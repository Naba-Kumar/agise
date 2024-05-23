
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const adminAuthMiddleware = require("../middleware/adminAuth")
const jwt = require('jsonwebtoken');


const cookieParser = require('cookie-parser');
const { log } = require('console');
const { Redirect } = require('twilio/lib/twiml/VoiceResponse');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});

const upload = multer({ storage: storage });


router.get('/', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminLogin");

});

router.get('/home', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminHome");

});

router.post('/', upload.single('id_proof'), async (req, res) => {
    // Your OpenLayers logic here
    const {
        admin_id,
        password
    } = req.body;
    console.log(req.body)

    const action = req.body.submit;
    console.log(action)
    try {
        // const password = req.body.password
        console.log("clicked admin login")
        console.log(req.body)

        if (!admin_id || !password) {
            const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
            return res.json(data)
        }
        const client = await pool.poolUser.connect();
        const admin = await client.query('SELECT * FROM admins WHERE admin_id = $1', [admin_id]);

        if (admin.rows.length === 0) {
            console.log('Invalid Creadential 1')
            // return res.status(400).json({ error: 'Invalid Creadential' });
            const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
            return res.status(400).json(data);
        }

        if (password != admin.rows[0].password) {
            console.log('Invalid Creadential 2')
            const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
            return res.status(400).json(data);

        }

        const token = await jwt.sign({ admin_id: admin.rows[0].admin_id }, process.env.adminSecretKey, { expiresIn: '1h' });

        console.log("token")

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })

        const data = { message: 'Login successful', title: "Sent", icon: "success", redirect: '\\admin\\home' };
        return res.status(400).json(data);
    } catch (error) {

        console.log(error)
    }

});

router.post('/home', adminAuthMiddleware, (req, res) => {
    res.render("adminHome");

});


router.get('/requests', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminFileRequests");

});
router.post('/requests', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminRequests");

});

router.get('/upload', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminUpload");

});
router.post('/upload', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminUpload");

});

router.get('/catalog', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminAddCatalog");

});

router.post('/catalog', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminUpload");

});
router.post('/delete', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminDelete");

});
router.get('/delete', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminFileDelete");

});



// router.get('/login', (req, res) => {
//     // Your OpenLayers logic here
//     res.render("adminLogin");

// });


router.get('/queries', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminQueries");

});
router.post('/queries', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");

});
router.post('/logout', adminAuthMiddleware, (req, res) => {
    // res.clearCookie('token');
    // const data = { message: 'Logot successful', title: "Logout", icon: "success", redirect:'\\admin\\home' };
    //     return res.status(400).json(data);

    try {
        // Clear the cookie containing the token
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Send a success response
        const data = { message: 'Logout successful', title: "Logged Out", icon: "success", redirect: '\\' };
        console.log(data)
        return res.json(data);
    } catch (error) {
        console.error(error);
        const data = { message: 'Logout failed', title: "Error", icon: "error" };

        return res.status(500).json(data);
    }

});


router.get('*', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");
    res.render("404")

});




module.exports = router;
