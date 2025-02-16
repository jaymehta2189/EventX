const Router=require("express");
const router=Router();
const userController=require("../controller/user.controller");
// const checkForAuth= require("../middleware/authentication.js");
// console.log(typeof checkForAuth);
const checkForAuth = require("../middleware/authentication.js");


module.exports=router;