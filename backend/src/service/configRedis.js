const Redis = require('ioredis');
require('dotenv').config();
const RedisClient = new Redis({
  host: process.env.REDIS_URL,
  port: 6379, 
  tls: {} ,
  connectTimeout: 10000
  // Required for secure connection
});
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