const Router=require("express");
const router=Router();
const eventController=require("../controller/event.controller");
// const checkForAuth  = require("../middleware/authentication");
const checkForAuth = require("../middleware/authentication.js");
const {checkForOrg} = require("../middleware/check.js");
const {upload,checkCSVFile} = require('../middleware/multer.js');

router.post("/event/location",checkForAuth,checkForOrg,eventController.FreeLocationFromTime);
router.post("/event",checkForAuth,checkForOrg,eventController.createEvent);
router.get("/",checkForAuth,eventController.cacheFindAllEvent,eventController.findAllEvent);
router.get("/event/:id",checkForAuth,eventController.cacheViewEvent,eventController.viewEvent);
router.get("/event/:id/groups",checkForAuth,eventController.getGroupInEvent);
router.get("/event/:id/users",checkForAuth,eventController.getUserInEvent);
router.get("/org/:orgId",checkForAuth,checkForOrg,eventController.getAllEventCreateByOrg);
router.post("/event/:id/check",checkForAuth,checkForOrg,eventController.validateAndSendHODEmails);
router.get("/search",checkForAuth,eventController.searchAvailableEvents);

router.post("/event/groups/report",checkForAuth,checkForOrg,eventController.generateGroupReportCSV);
router.post(
    "/event/groups/score",
    checkForAuth,
    checkForOrg,
    upload.single('csvFile'),
    checkCSVFile,
    eventController.processGroupReportCSV
);
router.get("/event/:id/rank",checkForAuth,eventController.rankGroupsByEventScore);

// router.get("/a/:name",eventController.SameNameInCache);
// router.get('/a',eventController.testRedis);

module.exports=router;