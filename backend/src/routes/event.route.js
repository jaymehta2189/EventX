const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
// const checkForAuth  = require("../middleware/authentication");
const checkForAuth = require("../middleware/authentication.js");

router.post("/validate/name",eventController.validateSameNameEvent);
router.post("/validate/startdate",eventController.validateStartDate);
router.post("/validate/enddate",eventController.validateEndDate);
router.post("/validate/location",eventController.validateEventLocation);
router.post("/validate/category",eventController.validateCategory);
router.get("/cf",eventController.checkEventFull);

router.post("/create",checkForAuth,eventController.createEvent);
router.get("/",eventController.findAllEvent);
router.get("/:name",eventController.findEventByName);

module.exports=router;