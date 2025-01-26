require("dotenv").config({path:'../.env'});

const ConnectDB=require("./initDB.js")
const app=require("./app.js");

ConnectDB().then(()=>{
    app.on("error",error=>{
        throw error;
    });

    app.listen( process.env.CLEANUP_PORT || 9000 ,()=>{
        console.log("CleanUp Service Start");
    });
    
}).catch(error => console.error('DataBase failed to Connect!',error));