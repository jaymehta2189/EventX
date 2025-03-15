const requestTracker = new Map();  
const MAX_UNIQUE_IPS = 200;  
const MAX_REQUESTS_PER_MINUTE = 50;
const TIME_WINDOW_MS = 60 * 1000;
const allowedPaths = [
    '/api/v1/users/signup',
    '/api/v1/users/signin',
    '/api/v1/auth/google'
];

const rateLimiterMiddleware = (req, res, next) => {
    // if (allowedPaths.includes(req.path)) {
    //     return next();
    // }

    const ip = req.ip;
    const currentTime = Date.now();  

    if (requestTracker.size >= MAX_UNIQUE_IPS) {  
        return res.status(429).json({  
            error: "User limit exceeded"  
        });  
    }

    if (!requestTracker.has(ip)) {  
        requestTracker.set(ip, { count: 1, startTime: currentTime });  
    } else {  
        const userData = requestTracker.get(ip);  

        if (currentTime - userData.startTime > TIME_WINDOW_MS) {  
            requestTracker.set(ip, { count: 1, startTime: currentTime });  
        } else {  
            if (userData.count >= MAX_REQUESTS_PER_MINUTE) {
                return res.status(429).json({ error: "Too many requests" });  
            }  

            requestTracker.set(ip, {  
                count: userData.count + 1,  
                startTime: userData.startTime  
            });  
        }  
    }  

    next();  
};  

// Cleanup expired records  
setInterval(() => {  
    const currentTime = Date.now();  
    requestTracker.forEach((userData ,ip)=>{
        if (currentTime - userData.startTime > TIME_WINDOW_MS) {  
            requestTracker.delete(ip);  
        }
    });
}, TIME_WINDOW_MS);

module.exports = rateLimiterMiddleware;