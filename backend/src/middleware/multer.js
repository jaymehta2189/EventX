// const multer = require('multer')
// const {MulterError} = require('../utils/Constants/multer')
// const path = require('path');
// const ApiError = require('../utils/ApiError');

// // Define CSV storage
// const csvStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../public/csv");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// // Define Image storage
// const imageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../public/images");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// // File filter to determine which storage to use
// const fileFilter = (req, file, cb) => {
//   const extname = path.extname(file.originalname).toLowerCase();

//   if (extname === '.csv') {
//     cb(null, true);
//   } else if (['.png', '.jpg', '.jpeg'].includes(extname)) {
//     cb(null, true);
//   } else {
//     cb(new ApiError(MulterError.INVALID_TYPE));
//   }
// };

// // Multer configuration
// const upload = multer({
//   storage: (req, file, cb) => {
//     const extname = path.extname(file.originalname).toLowerCase();
//     if (extname === '.csv') {
//       csvStorage.destination(req, file, cb);
//     } else if (['.png', '.jpg', '.jpeg'].includes(extname)) {
//       imageStorage.destination(req, file, cb);
//     } else {
//       cb(new ApiError(MulterError.INVALID_TYPE));
//     }
//   },
//   fileFilter: fileFilter
// });


// const checkCSVFile = (req, res, next) => {
//   if (!req.file || path.extname(req.file.originalname).toLowerCase() !== '.csv') {
//       throw new ApiError(MulterError.INVALID_TYPE,'Only CSV files are allowed');
//   }
//   next();
// };

// module.exports = {upload , checkCSVFile};
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.resolve(__dirname, '../../public/images');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')||file.mimetype.startsWith('application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and pdfs are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
