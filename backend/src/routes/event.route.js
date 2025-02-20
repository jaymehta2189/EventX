const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg, checkForStaff, checkForAdmin} = require("../middleware/check.js");
const upload = require('../middleware/multer.js');

router.post("/event/location",checkForAuth,checkForOrg,eventController.FreeLocationFromTime);
router.post("/event",checkForAuth,checkForOrg,upload.single("avatar"),eventController.createEvent);
router.get("/",checkForAuth,eventController.cacheFindAllEvent,eventController.findAllEvent);
router.get("/event/:id",checkForAuth,eventController.cacheViewEvent,eventController.viewEvent);
router.get("/event/:id/groups",checkForAuth,eventController.getGroupInEvent);
router.get("/event/:id/users",checkForAuth,eventController.getUserInEvent);
router.get("/org/:orgId",checkForAuth,checkForOrg,eventController.getAllEventCreateByOrg);
router.post("/event/:id/check",checkForAuth,checkForOrg,eventController.validateAndSendHODEmails);

router.get("/staff/events",checkForAuth,checkForStaff,eventController.cacheFindAllEvent);
router.get("/admin/events",checkForAuth,checkForAdmin,eventController.cacheFindAllEvent);

router.post("/event/groups/report",checkForAuth,checkForOrg,eventController.generateGroupReportCSV);
// router.post(
//     "/event/groups/score",
//     checkForAuth,
//     checkForOrg,
//     upload.single('csvFile'),
//     checkCSVFile,
//     eventController.processGroupReportCSV
// );

router.get("/event/:id/rank",checkForAuth,eventController.rankGroupsByEventScore);
module.exports=router;