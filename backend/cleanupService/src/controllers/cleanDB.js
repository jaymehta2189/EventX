const Event = require('../models/event.model.js');
const Group = require('../models/group.model.js');
const User_Event_Join = require('../models/User_Event_Join.model.js');
const User_Group_Join = require('../models/User_Group_Join.model.js');

const moment = require('moment-timezone');
const deleteFiles = require('../utils/Cloudinary.js');
const schedule = require('node-schedule');

let jobRunning = true;
let cleanUpTime = undefined ; // Optional: Use persistent storage if you want this value to survive app restarts

// Meaningful job name
const cleanExpiredDataJob = schedule.scheduleJob('30 7 * * *', cleanDatabase);

const asyncHandler = require('../utils/asyncHandler');

async function cleanDatabase() {
    try {
        // Prevent cleanup if it was done in the last 12 hours
        if (cleanUpTime && moment.tz(Date.now(), "Asia/Kolkata").diff(cleanUpTime, 'hours') < 12) {
            console.log('Cleanup skipped: Last cleanup was within the last 12 hours.');
            return;
        }

        const minTimeLimt = moment.tz(Date.now(), "Asia/Kolkata").toDate();

        const pipeline = [
            {
                $match: {
                    timeLimit: { $lt: minTimeLimt }
                }
            },
            {
                $lookup: {
                    from: 'groups',
                    localField: '_id',
                    foreignField: 'event',
                    as: 'groups'
                }
            },
            {
                $unwind: '$groups'
            },
            {
                $project: {
                    eventId: '$_id',
                    groupId: '$groups._id',
                    qrCode: '$groups.qrCode'
                }
            }
        ];

        const result = await Event.aggregate(pipeline).exec();

        const deletedEventIds = result.map(item => item.eventId);
        const deletedGroupIds = result.map(item => item.groupId);
        const deletedQrCodes = result.map(item => item.qrCode);

        await Promise.all([
            Event.deleteMany({ _id: { $in: deletedEventIds } }),
            Group.deleteMany({ _id: { $in: deletedGroupIds } }),
            User_Event_Join.deleteMany({ Event: { $in: deletedEventIds } }),
            User_Group_Join.deleteMany({ Group: { $in: deletedGroupIds } }),
            deleteFiles(...deletedQrCodes)
        ]);

        console.log('Database cleanup completed successfully');

        // Update cleanup time
        cleanUpTime = minTimeLimt;
    } catch (error) {
        console.error('Error during database cleanup:', error);
        // Optionally handle error response (depending on how you want to notify the user)
    }
}

const stopJob = asyncHandler(async (req, res) => {
    if (!jobRunning) {
        return res.status(400).send('Job is already stopped.');
    }

    cleanExpiredDataJob.cancel();
    jobRunning = false; // Mark the job as stopped
    return res.status(200).send('Job stopped');
});

const resumeJob = asyncHandler(async (req, res) => {
    if (jobRunning) {
        return res.status(400).send('Job is already running.');
    }

    cleanExpiredDataJob.reschedule('30 7 * * *');
    jobRunning = true; // Mark the job as running
    return res.status(200).send('Job resumed');
});

const cleanExpierDataFromDatabaseAndCloudinary = asyncHandler(async (req, res) => {
    try {
        await cleanDatabase();
        return res.status(200).send('Events cleaned');
    } catch (error) {
        console.error('Error during cleanup:', error);
        return res.status(500).send('Error cleaning events');
    }
});

module.exports = {
    cleanExpierDataFromDatabaseAndCloudinary,
    stopJob,
    resumeJob
};
