const Router=require("express");
const router=Router();
const user_group_joinController=require("../controller/user_group_join.controller");

router.get("/group/:userId",user_group_joinController.getUserGroups);
router.get("/event/:userId",user_group_joinController.getUserEvents);

module.exports=router;