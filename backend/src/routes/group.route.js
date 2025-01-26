const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");
const groupController=require("../controller/group.controller");

// add routes
router.post("/group/",checkForAuth,groupController.LeaderCreateGroup);
router.post("/group/join",checkForAuth,groupController.UserJoinGroup);
router.get("/group/:id/users",checkForAuth,groupController.getUserInGroup);

router.get("/group/qr/:groupId",checkForAuth,checkForOrg,groupController.scanGroupQRCode);

module.exports=router;