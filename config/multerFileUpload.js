const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(!file){
      throw Error('Image required');
    }
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, `productImg/${Date.now()}_${file.originalname}`);
  }
});

module.exports = { multerStorage };