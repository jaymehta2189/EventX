const Router=require("express");
const router=Router();
const orgController=require("../controller/org.controller");

router.post("/create",orgController.createOrg);

module.exports=router;