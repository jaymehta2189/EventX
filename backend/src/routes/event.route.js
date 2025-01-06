const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
// const checkForAuth  = require("../middleware/authentication");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");

router.post("/freelocation",checkForAuth,checkForOrg,eventController.FreeLocationFromTime);
router.post("/create",checkForAuth,checkForOrg,eventController.createEvent);
router.get("/",eventController.findAllEvent);
router.get("/:id",eventController.viewEvent);

module.exports=router;