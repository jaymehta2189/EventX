const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const groupController=require("../controller/group.controller");

router.post("/validate/name",groupController.validateGroupNameInEvent);
router.post("/validate/leader",groupController.validateGroupLeader);
router.post("/validate/memberRole",groupController.validateMemberRole);
router.post("/validate/userSize",groupController.validateGroupSize);

router.post("/create",checkForAuth,groupController.createGroup);

module.exports=router;