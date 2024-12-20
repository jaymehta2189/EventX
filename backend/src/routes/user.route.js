const Router=require("express");
const router=Router();
const userController=require("../controller/user.controller")

router.post("/signup",userController.signupPost);
router.post("/signin",userController.signinPost);
router.post("/logout",userController.logout);
router.post("/sendOTP",userController.sendOTP);

module.exports=router;