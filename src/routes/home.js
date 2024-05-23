const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const nodemailer = require('nodemailer');
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validator = require('validator')
const bcrypt = require('bcryptjs');
const userAuthMiddleware = require("../middleware/userAuth")
const jwt = require('jsonwebtoken');
var passwordValidator = require('password-validator');
// Create a schema
var schema = new passwordValidator();


const cookieParser = require('cookie-parser');
const { log } = require('console');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    // Your OpenLayers logic here
    res.render("home");

});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});

const upload = multer({ storage: storage });

// const storage = multer.memoryStorage(); // Store files in memory
// const upload = multer({ dest: 'uploads/' }); // Configure multer to save files to 'uploads/' directory


router.post('/query', upload.single('id_proof'), async (req, res) => {

    const actions = "Register"

    const action = req.body.submit;
    const data = req.body.data;

    console.log(req.body)

    const {
        fullname,
        email,
        mobile,
        organization,
        occupation,
        reason,
        message

    } = req.body;

    try {





        if (!fullname || !mobile || !organization || !occupation || !designation || !email || !reason || !message) {
            const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
            // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
            return res.json(data)
        }

        const validateIndianPhoneNumber = (mobile) => {
            const phoneRegex = /^[6-9]\d{9}$/;
            return phoneRegex.test(mobile);
        };

        if (!validateIndianPhoneNumber(mobile)) {
            const data = { message: 'Enter Valid Phone number!', title: "Warning", icon: "warning" };
            res.status(400);
            return res.json(data)
        }

        const client = await pool.poolUser.connect();


        // Validate password function


        console.log(req.file.path)
        // Insert data into PostgreSQL database
        fullname,
            email,
            mobile,
            organization,
            occupation,
            reason,
            message
        const query = `
        INSERT INTO queries ( first_name, email, mobile, mobile, occupation, reason, message)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
        const hash_pw = bcrypt.hashSync(req.body.password, 10);
        const values = [
            fullname,
            email,
            mobile,
            organization,
            occupation,
            reason,
            message
        ];


        // if (clientotp) {
        // console.log(`Result - ${result}`)
        // const client = await pool.poolUser.connect();
        await client.query(query, values);
        client.release();

        const data = { message: 'You Are Registered Successfully', title: "Registered", icon: "success" };
        return res.status(400).json(data);

    } catch (error) {
        const data = { message: 'Something Went Wrong! try again', title: "Wrong", icon: "danger" };
        console.error('Error inserting data:', error);
        return res.status(400).json(data);

    }




});

module.exports = router;
