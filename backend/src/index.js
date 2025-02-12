require("dotenv").config({path:'../.env'});

const ConnectDB=require("./db/initDB.js")
const app=require("./app.js");

ConnectDB().then(()=>{
    app.on("error",error=>{
        throw error;
    });

    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Successfully connected to port ${process.env.PORT || 8000}`);
    });
    
}).catch(error => console.error('DataBase failed to Connect!',error));




// const express = require('express');
// const cors = require('cors'); // Import the CORS package
// const app = express();
// const port = 4000;

// // Enable CORS for all origins
// app.use(cors());
// // Keep track of connected clients
// let clients = [];

// // SSE route to listen for incoming events from the server
// app.get('/events', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     // Keep the connection open
//     res.flushHeaders();

//     // Add client to the list of connected clients
//     clients.push(res);

//     // Clean up when client disconnects
//     req.on('close', () => {
//         clients = clients.filter(client => client !== res);
//         console.log('Client disconnected');
//     });
// });

// // Broadcast an event to all connected clients
// const broadcastEvent = (message) => {
//     clients.forEach(client => {
//         client.write(`data: ${message}\n\n`);
//     });
// };

// // Route for triggering the event (e.g., button click)
// app.post('/triggerEvent', (req, res) => {
//     // In a real application, you might extract data from the request body
//     const eventData = { name: "Special Event Triggered" };

//     // Broadcast the event to all connected clients
//     broadcastEvent(eventData.name);

//     // Send response to the requester
//     res.send('Event triggered');
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
