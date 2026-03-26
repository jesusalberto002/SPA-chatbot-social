const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // We can determine the folder based on the route or a body field.
        // For this example, let's assume the route tells us the type.
        let uploadPath = './public/uploads/';

        if (req.baseUrl.includes('user')) {
            uploadPath += 'avatars/';
        } else if (req.baseUrl.includes('community')) {
            uploadPath += 'communityBanners/';
        } else if (req.baseUrl.includes('post')) {
            uploadPath += 'postImages/';
        }
        // You would also need to make sure these directories exist.
        console.log('Upload path:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
})

// Check File Type
function checkFileType(file, cb){
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    console.log('File type check:', {
        mimetype: mimetype,
        extname: extname,
        originalname: file.originalname
    });

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;
