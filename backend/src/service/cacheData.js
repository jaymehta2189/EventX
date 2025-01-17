const RedisClient = require("./configRedis")

const Event = require("../models/event.model")
const User = require("../models/user.model")
const Group = require("../models/group.model")

const moment = require("moment-timezone")



// ======================== Event Cache ==================================


async function preCacheEvents() {
    try {
        const eventes = await Event.find();

        await cacheEvent(...eventes);

        return 1;

    } catch (error) {
        console.error('Error processing events:', error.message);
        return 0;
    }
}

async function cacheEvent(...eventes) {
    const _ = await RedisClient.get('Event:Search:count');
    const Idcount = parseInt(_) || 0;

    const pipeline = RedisClient.pipeline();

    eventes.forEach((element, index) => {
        const startDate = new Date(element.startDate).getTime();
        const ttlInSeconds = Math.floor(Math.max((startDate - Date.now()) / 1000, 0));

        if (moment.tz(Date.now(), "Asia/Kolkata").isBefore(moment(startDate))) {
            pipeline
                .hset(`Event:Search:Data:${Idcount + index}`, 'id', element._id)
                .expire(`Event:Search:Data:${Idcount + index}`, ttlInSeconds);
        }

        // Always set the full event data in JSON format
        pipeline.call('JSON.SET', `Event:FullData:${element._id}`, '$', JSON.stringify(element));
    });

    pipeline.set('Event:Search:count', Idcount + eventes.length);

    await pipeline.exec();
}

async function preCacheEventJOINGroupAndUser() {
    try {
        const eventsWithDetails = await Event.aggregate([
            {
                $lookup: {
                    from: "groups", // Name of the Group collection
                    localField: "_id", // Field in the Event collection
                    foreignField: "event", // Field in the Group collection
                    as: "groups", // Alias for matched data
                },
            },
            {
                $lookup: {
                    from: "user_event_joins", // Name of the User_Event_Join collection
                    localField: "_id", // Field in the Event collection
                    foreignField: "event", // Field in the User_Event_Join collection
                    as: "userJoins", // Alias for matched data
                },
            },
            {
                $project: {
                    eventId: "$_id", // Retain the Event ID
                    endDate: "$endDate",
                    JoinGroupId: {
                        $map: {
                            input: "$groups",
                            as: "group",
                            in: "$$group._id", // Extract only Group IDs
                        },
                    },
                    JoinUserId: {
                        $map: {
                            input: "$userJoins",
                            as: "userJoin",
                            in: "$$userJoin._id", // Extract only User IDs
                        },
                    },
                },
            },
        ]);

        if (!eventsWithDetails) {
            throw new Error("Event Details Cache not work");
        }

        const pipeline = RedisClient.pipeline();

        eventsWithDetails.forEach(event => {
            const groupSetKey = `Event:Join:groups:${event.eventId}`;
            const userSetKey = `Event:Join:users:${event.eventId}`;
            const endDate = new Date(event.endDate).getTime() + 172800000;
            const ttlInSeconds = Math.floor(Math.max((endDate - Date.now()) / 1000, 0));

            if (ttlInSeconds > 0) {
                if (event.JoinGroupId && event.JoinGroupId.length > 0) {
                    pipeline.sadd(groupSetKey, ...event.JoinGroupId);
                    pipeline.expire(groupSetKey, ttlInSeconds);
                }
                if (event.JoinUserId && event.JoinUserId.length > 0) {
                    pipeline.sadd(userSetKey, ...event.JoinUserId);
                    pipeline.expire(userSetKey, ttlInSeconds);
                }
            }
        });

        // Execute the pipeline
        await pipeline.exec();

    } catch (error) {
        console.log(error.message);
    }
}



// ======================== Group Cache ==================================

async function preCacheGroup() {
    try {
        const groups = await Group.find();
        await cacheGroup(...groups);
        return 1;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}

async function cacheGroup(...groups) {
    const pipeline = RedisClient.pipeline();

    await Promise.all(
        groups.map(async group => {
            const endDateJSON = await RedisClient.call("JSON.GET", `Event:FullData:${group.event}`, '$.endDate');

            const endDate = new Date(JSON.parse(endDateJSON)).getTime() + 172800000;
            const ttlInSeconds = Math.floor((endDate - Date.now()) / 1000);

            if (ttlInSeconds > 0) {
                const key = `Group:FullData:${group._id}`;
                pipeline.call('JSON.SET', key, '$', JSON.stringify(group));
                pipeline.expire(key, ttlInSeconds);
            }
        })
    );
    await pipeline.exec();
}

async function preCacheGroupJoinUser() {
    const groupDetails = await Group.aggregate([
        {
            $lookup: {
                from: "user_group_joins",
                localField: "_id",
                foreignField: "Group",
                as: "User_Group",
            },
        },
        {
            $project: {
                id: "$_id",
                event: "$event",
                JoinUserId: {
                    $map: {
                        input: "$User_Group",
                        as: "user_group",
                        in: "$$user_group.Member", // Use the loop variable defined in 'as'
                    },
                },
            },
        },
    ]);

    await cacheGroupJoinUser(...groupDetails);
}

async function cacheGroupJoinUser(...groupDetails){
    const pipeline = RedisClient.pipeline();
    console.log(groupDetails);
    for (const group of groupDetails) {
        const endDateJSON = await RedisClient.call("JSON.GET", `Event:FullData:${group.event}`, '$.endDate');

        const endDate = new Date(JSON.parse(endDateJSON)).getTime() + 172800000;
        const ttlInSeconds = Math.floor((endDate - Date.now()) / 1000);

        if (ttlInSeconds > 0) {
            const Key = `Group:Join:${group._id}`;
            pipeline.sadd(Key, ...group.JoinUserId);
            pipeline.expire(Key, ttlInSeconds);
        }
    }

    await pipeline.exec();
}


// ============================= User Cache ==================================


async function preCacheUser() {
    try {
        const users = await User.find();
        await cacheUser(...users);
        return 1;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}
async function cacheUser(...users) {
    const pipeline = RedisClient.pipeline();

    await Promise.all(
        users.map(async user => {
            const Key = `User:FullData:${user._id}`;
            pipeline.call('JSON.SET',Key,'$',JSON.stringify(user));
            pipeline.hset(`User:Email:${user.email}`, {
                role: user.role,
                id:user._id
              });
              
        })
    );

    await pipeline.exec();
}

async function GetUserDataFromEmail(...Emails) {
    
    const pipeline = RedisClient.pipeline();

    Emails.forEach(email => {
        pipeline.hget(`User:Email:${email}`, 'id');
    });
    // console.log(Emails);

    const userIds = await pipeline.exec();

    // console.log(userIds);
    console.log(userIds);

    const userPipeline = RedisClient.pipeline();
    userIds.forEach(([_, userId]) => {
        if(userId)
            userPipeline.call('JSON.GET', `User:FullData:${userId}`, '$');
    });

    const userResults = await userPipeline.exec();

    const users = userResults.map(([_ , userSTR]) => {
        if(userSTR)
        return JSON.parse(userSTR)[0]; 
    });

    console.log(users);
    return users;
}

const ClearAllCacheSYNC = RedisClient.ClearRedisSync;

const ClearAllCacheASYNC = RedisClient.ClearRedisAsync;

module.exports = {
    // Event cache function
    preCacheEvents,
    preCacheEventJOINGroupAndUser,
    cacheEvent,

    // Group cache function
    preCacheGroup,
    preCacheGroupJoinUser,
    cacheGroupJoinUser,
    cacheGroup,

    // User cache function
    preCacheUser,
    cacheUser,
    GetUserDataFromEmail,

    // flushe Data
    ClearAllCacheSYNC,
    ClearAllCacheASYNC
}