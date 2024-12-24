const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
// const checkForAuth  = require("../middleware/authentication");
const checkForAuth = require("../middleware/authentication.js");
router.post("/create",checkForAuth,eventController.createEvent);
router.get("/",eventController.findAllEvent);
router.get("/:eventId",eventController.findEventById);

module.exports=router;