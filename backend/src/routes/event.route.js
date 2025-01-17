const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
// const checkForAuth  = require("../middleware/authentication");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");

router.post("/freelocation",checkForAuth,checkForOrg,eventController.FreeLocationFromTime);
router.post("/create",checkForAuth,checkForOrg,eventController.createEvent);
router.get("/",checkForAuth,eventController.cacheFindAllEvent,eventController.findAllEvent);
router.get("/view/:id",eventController.cacheViewEvent,eventController.viewEvent);
// router.get("/a/:name",eventController.SameNameInCache);
// router.get('/a',eventController.testRedis);

module.exports=router;