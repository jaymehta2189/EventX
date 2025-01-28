const Router=require("express");
const router=Router();
// const  checkForAuth  = require("../middleware/authentication.js");
const checkForAuth = require("../middleware/authentication.js");
const ensureAuth=require("../middleware/ensureAuth.js");
const groupController=require("../controller/group.controller");

router.post("/create",checkForAuth,ensureAuth,groupController.createGroup);

module.exports=router;