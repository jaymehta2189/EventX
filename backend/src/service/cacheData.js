const {RedisClient} = require("./configRedis")

const Event = require("../models/event.model")
const User = require("../models/user.model")
const Group = require("../models/group.model")
const Authority = require("../models/authority.model")

const moment = require("moment-timezone")

// ======================== Event Cache ==================================


async function preCacheEvents() {
    const limit = 20;
    let page = 0;
    let events = [];
    try {
        while (true) {
            events = await Event.find().skip(page * limit).limit(limit);
            if (events.length > 0) {
                await cacheEvent(...events);
            } else {
                break;
            }
            page++;
        }
        return 1;
    } catch (error) {
        console.log(error.message);
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
                .set(`Event:Search:Data:${Idcount + index}`, element._id)
                .expire(`Event:Search:Data:${Idcount + index}`, ttlInSeconds);
        }

        // Always set the full event data in JSON format
        const endDate = new Date(element.timeLimit).getTime();
        const ttlInSecondsFullData = Math.floor(Math.max((endDate - Date.now()) / 1000, 0));

        if (moment.tz(Date.now(), "Asia/Kolkata").isBefore(moment(endDate))) {
            pipeline.call('JSON.SET', `Event:FullData:${element._id}`, '$', JSON.stringify(element))
                .expire(`Event:FullData:${element._id}`, ttlInSecondsFullData)
                .sadd(`Event:Org:${element.creator}`, element._id);
                // .expire(`Event:Org:${element.creator}`, ttlInSecondsFullData);
        }
    });

    pipeline.set('Event:Search:count', Idcount + eventes.length);

    await pipeline.exec();
}
async function preCacheEventJOINGroupAndUser() {
    const limit = 100;
    let page = 0;
    let eventsWithDetails;

    const pipeline = RedisClient.pipeline();

    try {
        do {
            // Aggregate data for events with pagination
            eventsWithDetails = await Event.aggregate([
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
                        foreignField: "Event", // Field in the User_Event_Join collection
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
                                in: "$$userJoin.Member", // Extract only User IDs
                            },
                        },
                    },
                },
                { $skip: page * limit }, // Skip the already processed events
                { $limit: limit }, // Limit to the batch size
            ]);

            if (eventsWithDetails.length === 0) {
                break; // No more events to process
            }

            // Process the fetched events
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

            // Execute the current batch of operations
            await pipeline.exec();

            // Increment the page number for the next batch
            page++;
        } while (eventsWithDetails.length === limit); // Continue until all events are processed

    } catch (error) {
        console.error('Error caching event details:', error.message);
    }
}
async function GetEventDataById(field, ...EventIds) {

    const pipeline = RedisClient.pipeline();

    EventIds.forEach(id => {
        pipeline.call("JSON.GET", `Event:FullData:${id}`, field);
    });

    const eventsSTR = await pipeline.exec();

    const events = eventsSTR
        .filter(([_, eventSTR]) => Boolean(eventSTR))
        .map(([_, eventSTR]) => JSON.parse(eventSTR)[0]);

    return events;
}
async function GetEventIdsByUserId(userId) {
    try {
        let cursor = '0';
        let eventId = [];
        let pipeline = RedisClient.pipeline();
        do {
            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Event:Join:users:*');
            cursor = newCursor;
            if (keys.length > 0) {

                keys.forEach((key) => {
                    pipeline.sismember(key, userId);
                });

                const results = await pipeline.exec();

                results.forEach(([error, isMember], index) => {
                    if (!error && isMember === 1) {
                        eventId.push(keys[index].split(':')[3]);
                    }
                });

                pipeline = RedisClient.pipeline();
            }
        } while (cursor !== '0');

        return eventId;
    } catch (error) {
        console.error('Error fetching active events:', error);
        return [];
    }
}

// ======================== Group Cache ==================================

async function preCacheGroup() {
    const limit = 20;
    let page = 0;
    let groups;

    try {
        while (true) {
            groups = await Group.find().skip(page * limit).limit(limit);
            if (groups.length > 0) {
                await cacheGroup(...groups);
            } else {
                break;
            }

            page++;
        }
        return 1;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}

async function cacheGroup(...groups) {
    const pipeline = RedisClient.pipeline();

    for (const group of groups) {
        const endDateJSON = await RedisClient.call("JSON.GET", `Event:FullData:${group.event}`, '$.timeLimit');

        const endDate = new Date(JSON.parse(endDateJSON)).getTime();
        const ttlInSeconds = Math.floor((endDate - Date.now()) / 1000);

        if (ttlInSeconds > 0) {
            const key = `Group:FullData:${group._id}`;
            pipeline.call('JSON.SET', key, '$', JSON.stringify(group));
            pipeline.sadd('Group:Code', group.code);
            pipeline.expire(key, ttlInSeconds);
        }
    }

    await pipeline.exec();
}

async function preCacheGroupJoinUser() {
    const limit = 100;
    let page = 0;
    let groupDetails;

    try {
        do {
            groupDetails = await Group.aggregate([
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
                                in: "$$user_group.Member",
                            },
                        },
                    },
                },
                { $skip: page * limit },
                { $limit: limit },
            ]);

            if (groupDetails.length === 0) {
                break;
            }

            await cacheGroupJoinUser(...groupDetails);

            page++;
        } while (groupDetails.length === limit);

    } catch (error) {
        console.error('Error caching group join users:', error.message);
    }
}
async function cacheGroupLeaderJoinUser(groupDetails) {
    const pipeline = RedisClient.pipeline();

    const endDateJSON = await RedisClient.call("JSON.GET", `Event:FullData:${groupDetails.event}`, '$.endDate');

    const endDate = new Date(JSON.parse(endDateJSON)).getTime() + 172800000;
    const ttlInSeconds = Math.floor((endDate - Date.now()) / 1000);

    if (ttlInSeconds > 0) {
        const Key = `Group:Join:${groupDetails.id}`;
        pipeline.sadd(Key, groupDetails.JoinUserId);
        pipeline.expire(Key, ttlInSeconds);
    }

    await pipeline.exec();
}

async function cacheGroupJoinUser(...groupDetails) {
    const pipeline = RedisClient.pipeline();
    for (const group of groupDetails) {
        const endDateJSON = await RedisClient.call("JSON.GET", `Event:FullData:${group.event}`, '$.endDate');

        const endDate = new Date(JSON.parse(endDateJSON)).getTime() + 172800000;
        const ttlInSeconds = Math.floor((endDate - Date.now()) / 1000);

        if (ttlInSeconds > 0) {
            const Key = `Group:Join:${group._id}`;
            if (Array.isArray(group.JoinUserId) && group.JoinUserId.length > 0) {
                pipeline.sadd(Key, ...group.JoinUserId);
            } else if (group.JoinUserId) {
                pipeline.sadd(Key, group.JoinUserId);
            }            
            pipeline.expire(Key, ttlInSeconds);
        }
    }
    await pipeline.exec();
}

async function GetGroupDataById(field, ...GroupIds) {

    const pipeline = RedisClient.pipeline();

    GroupIds.forEach(id => {
        pipeline.call("JSON.GET", `Group:FullData:${id}`, field);
    });

    const groupsSTR = await pipeline.exec();

    const groups = groupsSTR
        .filter(([_, groupSTR]) => Boolean(groupSTR))
        .map(([_, groupSTR]) => JSON.parse(groupSTR)[0]);

    return groups;
}

async function GetGroupIdsByUserId(userId) {
    try {
        let cursor = '0';
        let groupId = [];
        let pipeline = RedisClient.pipeline();
        do {
            const [newCursor, keys] = await RedisClient.scan(cursor, 'MATCH', 'Group:Join:*');
            cursor = newCursor;
            if (keys.length > 0) {
                keys.forEach((key) => {
                    pipeline.sismember(key, userId);
                });

                const results = await pipeline.exec();

                results.forEach(([error, isMember], index) => {
                    if (!error && isMember === 1) {
                        groupId.push(keys[index].split(':')[2]);
                    }
                });

                pipeline =  RedisClient.pipeline();
            }
        } while (cursor !== '0');
        return groupId;
    } catch (error) {
        console.error('Error fetching active groups:', error);
        return [];
    }
}

async function GetUserIdsByGroupId(groupId) {
    try{
        return (await RedisClient.smembers(`Group:Join:${groupId}`));
    }catch(error){
        return [];
    }
}

// ============================= User Cache ==================================

async function preCacheUser() {
    const limit = 20;
    let page = 0;
    let users;

    try {
        while (true) {
            users = await User.find().skip(page * limit).limit(limit);

            if (users.length > 0) {
                await cacheUser(...users);
            } else {
                break;
            }

            page++;
        }

        return 1;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}

async function cacheUser(...users) {
    const pipeline = RedisClient.pipeline();

    users.forEach(user => {
        const key = `User:FullData:${user._id}`;
        pipeline.call('JSON.SET', key, '$', JSON.stringify(user));

        pipeline.hset(`User:Email:${user.email}`, {
            role: user.role,
            id: user._id
        });

        pipeline.sadd(`User:Branch:${user.branch}`,user._id);
    });

    await pipeline.exec();
}

async function GetUserDataFromEmail(field, ...Emails) {

    const pipeline = RedisClient.pipeline();

    Emails.forEach(email => {
        pipeline.hget(`User:Email:${email}`, 'id');
    });

    const userIds = await pipeline.exec();

    const valiedUserId = userIds
        .filter(([_, userId]) => Boolean(userId))
        .map(([_, userId]) => userId);

    const users = await GetUserDataById(field, ...valiedUserId);

    return users;
}

async function GetUserDataById(field, ...UserIds) {

    const pipeline = RedisClient.pipeline();

    UserIds.forEach(id => {
        pipeline.call("JSON.GET", `User:FullData:${id}`, field);
    });

    const usersSTR = await pipeline.exec();

    const users = usersSTR
        .filter(([_, userSTR]) => Boolean(userSTR))
        .map(([_, userSTR]) => JSON.parse(userSTR)[0]);

    return users;
}

// ============================= authoritiy Cache ====================================

async function preCacheAuthority() {
    const limit = 20;
    let page = 0;
    let authority;

    try {
        while (true) {
            authority = await Authority.find().skip(page * limit).limit(limit);

            if (authority.length > 0) {
                await cacheAuthority(...authority);
            } else {
                break;
            }

            page++;
        }

        return 1;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}

async function cacheAuthority(...authority) {
    const pipeline = RedisClient.pipeline();

    authority.forEach(authority => {
        const key = `Authority:FullData:${authority._id}`;
        pipeline.call('JSON.SET', key, '$', JSON.stringify(authority));

        pipeline.hset(`Authority:Email:${authority.email}`, {
            role: authority.role,
            id: authority._id
        });

        pipeline.sadd(`Authority:Branch:${authority.branch}`,authority._id);
    });

    await pipeline.exec();
}


async function GetAuthorityDataFromEmail(field, ...Emails) {

    const pipeline = RedisClient.pipeline();

    Emails.forEach(email => {
        pipeline.hget(`Authority:Email:${email}`, 'id');
    });

    const userIds = await pipeline.exec();

    const valiedUserId = userIds.filter(([_, userId]) => Boolean(userId));

    const users = await GetAuthorityDataById(field, ...valiedUserId);

    return users;
}

async function GetAuthorityDataById(field, ...AuthorityIds) {
    const pipeline = RedisClient.pipeline();

    AuthorityIds.forEach(id => {
        pipeline.call("JSON.GET", `Authority:FullData:${id}`, field);
    });

    const usersSTR = await pipeline.exec();

    const users = usersSTR
        .filter(([_, userSTR]) => Boolean(userSTR))
        .map(([_, userSTR]) => JSON.parse(userSTR)[0]);

    return users;
}

// ==================================== Clear Cache ==================================

const ClearAllCacheSYNC = RedisClient.ClearRedisSync;

const ClearAllCacheASYNC = RedisClient.ClearRedisAsync;

module.exports = {
    // Event cache function
    preCacheEvents,
    preCacheEventJOINGroupAndUser,
    cacheEvent,
    GetEventDataById,
    GetEventIdsByUserId,

    // Group cache function
    preCacheGroup,
    preCacheGroupJoinUser,
    cacheGroupJoinUser,
    cacheGroup,
    GetGroupDataById,
    GetGroupIdsByUserId,
    cacheGroupLeaderJoinUser,
    GetUserIdsByGroupId,

    // User cache function
    preCacheUser,
    cacheUser,
    GetUserDataFromEmail,
    GetUserDataById,

    // Authority cache function
    preCacheAuthority,
    cacheAuthority,
    GetAuthorityDataFromEmail,
    GetAuthorityDataById,

    // flushe Data
    ClearAllCacheSYNC,
    ClearAllCacheASYNC
}