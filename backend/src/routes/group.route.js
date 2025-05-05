const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");
const groupController=require("../controller/group.controller");
const checkForCleander = require("../middleware/auth.js");

// add routes
//create group
router.post("/group",checkForAuth , checkForCleander , groupController.LeaderCreateGroup);
//join by code
router.post("/group/join",checkForAuth , checkForCleander , groupController.UserJoinGroup);
//get users in group
router.get("/group/:id/users",checkForAuth, groupController.getUserInGroup);
//assign score to groups
router.post("/score",checkForAuth,checkForOrg,groupController.assignScore);
//scan qr code
router.get("/group/qr/:groupId/:userId",checkForAuth,checkForOrg,groupController.scanGroupQRCode);
// group verify
router.post("/verifyGroup",checkForAuth,groupController.VerificationOfGroup);

module.exports=router;