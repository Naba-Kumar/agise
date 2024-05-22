
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const adminAuthMiddleware = require("../middleware/userAuth")
const jwt = require('jsonwebtoken');


const cookieParser = require('cookie-parser');
const { log } = require('console');
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

router.get('/home',adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminHome");

});

router.post('/', upload.single('id_proof'),async(req, res) => {
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
            // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
            return res.json(data)
        }
        const client = await pool.poolUser.connect();

        console.log("db pw")
        const admin = await client.query('SELECT * FROM admins WHERE admin_id = $1', [admin_id]);
        console.log(admin.rows.length === 0)

        if (admin.rows.length === 0) {
            console.log('Invalid Creadential 1')
            // return res.status(400).json({ error: 'Invalid Creadential' });
            const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
            return res.status(400).json(data);
        }
        console.log("2")

        if (password === admin.rows[0].password) {
            console.log('Invalid Creadential 2')
            const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
            return res.status(400).json(data);

        }

        const token = await jwt.sign({ admin_id: user.rows[0].admin_id }, process.env.secretKey, { expiresIn: '1h' });

        console.log("token")

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })

        const data = { message: 'Login successful', title: "Sent", icon: "success" };
        return res.status(400).json(data);

    } catch (error) {

        console.log(error)
    }

});

router.post('/home',adminAuthMiddleware, (req, res) => {
    res.render("adminHome");

});

router.post('/logout', (req, res) => {
    res.render("home");

});

router.get('/requests', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminFileRequests");

});
router.post('/requests', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminRequests");

});

router.get('/upload', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminUpload");

});
router.post('/upload', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminUpload");

});

router.get('/catalog', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminAddCatalog");

});

router.post('/catalog', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminUpload");

});
router.post('/delete', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminDelete");

});
router.get('/delete', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminFileDelete");

});



// router.get('/login', (req, res) => {
//     // Your OpenLayers logic here
//     res.render("adminLogin");

// });


router.get('/queries', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminQueries");

});
router.post('/queries', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");

});






router.post('/logout', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminUpload");

});


module.exports = router;
