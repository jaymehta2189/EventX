const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg, checkForStaff, checkForAdmin} = require("../middleware/check.js");
const upload = require('../middleware/multer.js');
//send report to staff
router.post("/event/:id/check",checkForAuth,checkForOrg,eventController.validateAndSendHODEmails);

router.post("/event/location",checkForAuth,checkForOrg,eventController.FreeLocationFromTime);
router.post("/event",checkForAuth,checkForOrg,upload.single("avatar"),eventController.createEvent);

router.get("/",checkForAuth,eventController.cacheFindAllEvent,eventController.findAllEvent);
router.get("/event/:id",checkForAuth,eventController.cacheViewEvent,eventController.viewEvent);
//groups in event
router.get("/event/:id/groups",checkForAuth,eventController.getGroupInEvent);
//all user in event
router.get("/event/:id/users",checkForAuth,eventController.getUserInEvent);
//all event created by org
router.get("/org/:orgId",checkForAuth,checkForOrg,eventController.getAllEventCreateByOrg);
router.get("/event/leaderboard/:id",checkForAuth,eventController.getLeaderBoardOfEvent);

router.get("/staff/events",checkForAuth,checkForStaff,eventController.cacheFindAllEvent);
router.get("/admin/events",checkForAuth,checkForAdmin,eventController.cacheFindAllEvent);
// router.post("/event/groups/report",checkForAuth,checkForOrg,eventController.generateGroupReportCSV);
  
  

module.exports=router;