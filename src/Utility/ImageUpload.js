const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads"); // relative to Utility folder
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // use the folder we just ensured
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Optional file validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;









// const multer = require("multer");
// const path = require("path");

// const fs = require("fs");
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(src/uploadDir);
// }


// // Configure file storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });

// // Optional file validation
// const fileFilter = (req, file, cb) => {
//     // Accept: images only (JPEG, PNG, etc.)
//     if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only images are allowed!"), false);
//     }
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
// });

// module.exports = upload;








// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");

// const app = express();
// app.use(cors());

// // Configure file storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });

// const upload = multer({ storage });

// // Upload route (single file)
// app.post("/upload", upload.single("file"), (req, res) => {
//     console.log("File Uploaded:", req.file);
//     res.json({ message: "Upload successful", file: req.file });
// });

// app.listen(5000, () => console.log("Server started on port 5000"));