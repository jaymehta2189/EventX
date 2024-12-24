const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const groupController=require("../controller/group.controller");

router.post("/create",checkForAuth,groupController.createGroup);

module.exports=router;