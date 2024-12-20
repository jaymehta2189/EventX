const  mongoose =  require("mongoose");
const ConnectDB = async()=>{
    try{
        const ConnectionInstance  = await mongoose.connect(`${process.env.ConnectionUrl}`);
        console.log(`DataBase connected !!! DB HOST : ${ConnectionInstance.connection.host}`);
    }catch(error){
        console.error(`${process.env.ConnectionUrl} Not Connected `,error);
        process.exit(1);
    }
};

module.exports=ConnectDB;