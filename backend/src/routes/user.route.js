const Router=require("express");
const router=Router();
const userController=require("../controller/user.controller");
// const checkForAuth= require("../middleware/authentication.js");
// console.log(typeof checkForAuth);
const {checkForStaff} = require("../middleware/check.js");
const checkForAuth = require("../middleware/authentication.js");

router.post("/signup",userController.signupPost);
router.post("/signin",userController.signinPost);
router.post("/logout",checkForAuth,userController.logout);
router.post("/sendOTP",userController.sendOTP);

router.get("/user/:id",userController.viewUserProfile);
router.get("/user/:id/events",checkForAuth,userController.getEvent);
router.get("/user/:id/groups",checkForAuth,userController.getGroup);

router.get("/creator",checkForAuth,userController.getEventCreators);

router.get("/orgs/:branch",checkForAuth,userController.getOrganizationsByBranch);
router.get("/orgs",checkForAuth,userController.getAllOrganizations);

router.post("/profile/:id",userController.updateProfile);

router.post("/sem/user",checkForAuth,userController.getuserBySem);
router.post("/branch/user",checkForAuth,userController.getUserByEmail);
router.post("/modified/user",checkForAuth,checkForStaff,userController.modifieUserToOrg);

// for admin
router.get('/db/clean',checkForAuth,userController.cleanup);
router.get('/db/clean/stop',checkForAuth,userController.stopCleanupJob);
router.get('/db/clean/resume',checkForAuth,userController.resumeCleanupJob);

module.exports=router;