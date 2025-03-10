const Redis = require('ioredis');
require('dotenv').config();
const RedisClient = new Redis(process.env.REDIS_URL,{tls:{}});
// const pubClient = new Redis(process.env.REDIS_URL);
// const subClient = pubClient.duplicate();

RedisClient.ClearRedisSync = async ()=>{
    try {
        const result = await RedisClient.call('FLUSHALL', 'SYNC');
        console.log('Flush Result:', result); // Should print "OK"
    } catch (error) {
        console.error('Error flushing Redis:', error);
    }
};

RedisClient.ClearRedisAsync = async ()=>{
    try {
        const result = await RedisClient.call('FLUSHALL', 'ASYNC');
        console.log('Flush Result:', result); // Should print "OK"
    } catch (error) {
        console.error('Error flushing Redis:', error);
    }
};

module.exports = {RedisClient};//,pubClient,subClient};