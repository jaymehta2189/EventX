const Router=require("express");
const router=Router();

const groupController=require("../controller/group.controller");

router.post("/create",groupController.createGroup);

module.exports=router;