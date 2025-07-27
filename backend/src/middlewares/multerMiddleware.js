import multer from "multer";

const storage = multer.diskStorage ({
    destination: (req, file, cb) => {
        cb (null, "public/upload"); // destination folder
    },
    filename: (req, file, cb) => {
        cb (null, `${Date.now()}-${file.originalname}`);    // using the original name of the file
    },
});

export const upload = multer({storage});


// export const upload = multer({
//     storage, 
//     limits: {
//         fileSize: 5 * 1024 * 1024 // limit to 5MB
//     },
//     fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const extname = fileTypes.test(file.mimetype);
//     const mimetype = fileTypes.test(file.originalname.split('.').pop().toLowerCase());

//     if (extname && mimetype) {
//         return cb(null, true);
//     } else {
//         cb(new ApiError(400, 'Only images are allowed'));
//     }
//     }
// });