const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");
const groupController=require("../controller/group.controller");
const checkForCleander = require("../middleware/auth.js");

// add routes
router.post("/group",checkForAuth , checkForCleander , groupController.LeaderCreateGroup);
router.post("/group/join",checkForAuth , checkForCleander , groupController.UserJoinGroup);
router.get("/group/:id/users",checkForAuth, groupController.getUserInGroup);

router.post("/score",checkForAuth,checkForOrg,groupController.assignScore);

router.get("/group/qr/:groupId",checkForAuth,checkForOrg,groupController.scanGroupQRCode);
router.post("/verifyGroup",checkForAuth,groupController.VerificationOfGroup);

module.exports=router;