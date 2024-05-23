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


    // const action = req.body.submit;
    // const data = req.body.data;

    console.log(req.body)

    const {
        full_name,
        email,
        mobile,
        organization,
        occupation,
        reason,
        message

    } = req.body;

    try {





        if (!full_name || !email || !mobile || !occupation || !reason || !message ) {
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

        const isresolved = false;

        const client = await pool.poolUser.connect();



        

        const query = `
        INSERT INTO queries ( full_name, email, mobile, occupation, reason, message, isresolved)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
        const values = [
            full_name,
            email,
            mobile,
            occupation,
            reason,
            message,
            isresolved
        ];


        // if (clientotp) {
        // console.log(`Result - ${result}`)
        // const client = await pool.poolUser.connect();
        await client.query(query, values);
        client.release();

        const data = { message: 'Query submitted  Successfully', title: "Submitted", icon: "success", redirect: '\\' };
        return res.status(400).json(data);

    } catch (error) {
        const data = { message: 'Something Went Wrong! try again', title: "Wrong", icon: "danger" };
        console.error('Error inserting data:', error);
        return res.status(400).json(data);

    }




});

// router.get('*', (req, res) => {
//     // Your OpenLayers logic here
//     // res.render("adminQueries");
//     res.render("404")

// });

module.exports = router;
