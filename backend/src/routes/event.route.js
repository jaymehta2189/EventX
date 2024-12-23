const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");

router.post("/create",eventController.createEvent);
router.get("/",eventController.findAllEvent);
router.get("/:eventId",eventController.findEventById);

module.exports=router;