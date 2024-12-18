require("dotenv").config();

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
