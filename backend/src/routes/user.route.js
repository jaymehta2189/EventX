const Router=require("express");
const router=Router();
const userController=require("../controller/user.controller");
// const checkForAuth= require("../middleware/authentication.js");
// console.log(typeof checkForAuth);
const checkForAuth = require("../middleware/authentication.js");
router.post("/signup",userController.signupPost);
router.post("/signin",userController.signinPost);
router.post("/logout",checkForAuth,userController.logout);
router.post("/sendOTP",userController.sendOTP);

module.exports=router;