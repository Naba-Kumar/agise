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
const { phone } = require('phone');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.appw
    }
});



router.get('/', (req, res) => {
    res.render("userRegister");

});



// ------Register route starts
// const storage = multer.memoryStorage(); // Store files in memory


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


router.post('/', upload.single('id_proof'), async (req, res) => {

    const actions = "Register"

    const action = req.body.submit;
    const data = req.body.data;

    // Check which button was clicked based on its value
    if (action === "GetOTP") {
        console.log("click getopt")
        // Handle action 1
        const email = req.body.email;

        try {

            if (!validator.isEmail(email)) {
                const data = { message: 'Please enter valid email', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }


            // Generate OTP (random 6-digit number)
            const otp = Math.floor(100000 + Math.random() * 900000);

            const client = await pool.poolUser.connect();

            // Delete the existing OTP for the email
            await client.query(`DELETE FROM emailotp WHERE email = $1`, [email]);

            // Insert the new OTP for the email
            await client.query(`INSERT INTO emailotp (email, otp) VALUES ($1, $2)`, [email, otp]);
            client.release();



            // Send OTP via email
            await transporter.sendMail({
                from: process.env.email,
                to: req.body.email,
                subject: 'OTP for Registration AGISE',
                text: `Your OTP for Registration ASSAM GIS EXPLORER is: ${otp}`
            });

            const data = { message: 'OTP sent successfully', title: "Sent", icon: "success" };
            return res.status(400).json(data);



        } catch (err) {
            console.error('Error in sending OTP via email:', err);
            const error = { message: 'something went wrong' };

            const data = { message: 'something went wrong, Try again!', title: "Error", icon: "danger" };
            return res.status(400).json(data);
        }
    }

    else if (action === 'Verify') {
        console.log("click verify")

        // Handle action 2
        try {
            // const { email_address} = req.body;
            const email = req.body.email;
            const clientotp = req.body.otp;

            if (!email || !clientotp) {

                const data = { message: 'Fill The Fields Email and  OTP First', title: "Alert", icon: "warning" };
                return res.status(400).json(data);


            }


            // Retrieve stored OTP and session ID from the database
            const client = await pool.poolUser.connect();
            const result = await client.query(`SELECT otp FROM emailotp WHERE email = $1`, [email]);
            // console.log(result.rows);
            // console.log(result.rows[0]);
            // console.log();
            const dbotp = result.rows[0].otp;
            const storedOtp = dbotp.toString();
            console.log(`REsult - ${result}`)


            console.log(`client otp - ${typeof (clientotp)}`)
            console.log(`stored otp - ${typeof (storedOtp)}`)

            console.log(`client otp - ${clientotp}`)
            console.log(`stored otp - ${storedOtp}`)



            if (clientotp === storedOtp) {

                const client = await pool.poolUser.connect();

                // Delete the existing OTP for the email
                await client.query(`DELETE FROM verifiedemails WHERE email = $1`, [email]);

                // Insert the new OTP for the email
                await client.query(`INSERT INTO verifiedemails (email) VALUES ($1)`, [email]);

                const data = { message: 'OTP verified successfully', title: "Varified", icon: "success" };
                client.release();
                return res.status(400).json(data);

            } else {
                const data = { message: 'Invalid OTP', title: "Alert", icon: "danger" };
                return res.status(400).json(data);

                // res.status(400).send({ error: 'Invalid OTP' });
            }
        } catch (err) {
            const data = { message: 'Somthing Went Wrong, Try again!', title: "Error", icon: "danger" };
            console.error('Error in OTP verification:', err);
            return res.status(400).json(data);

            // res.status(500).send({ error: 'Internal Server Error' });
        }

    }

    else if (actions === 'Register') {
        console.log("click Register")

        console.log(req.body)

        const {
            first_name,
            last_name,
            mobile,
            organization,
            department,
            designation,
            email,
            user_type,
            about,
            password
        } = req.body;

        try {


            if (!first_name || !last_name || !mobile || !organization || !department || !designation || !email || !user_type || !about || !password) {
                const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
                // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
                return res.json(data)
            }
            if (!phone(req.body.mobile, { country: 'IND' })) {
                const data = { message: 'Enter Valid Email', title: "Warning", icon: "warning" };
                res.status(400);
                return res.json(data)
            }

            const client = await pool.poolUser.connect();
            const otpresult = await client.query(`SELECT otp FROM emailotp WHERE email = $1`, [email]);


            const dbotp = otpresult.rows[0].otp;
            const storedOtp = dbotp.toString();
            const clientotp = req.body.otp;

            if (clientotp != storedOtp) {
                const data = { message: 'Verify OTP first', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }


            const regresult = await client.query(`SELECT * FROM registered WHERE email = $1`, [email]);
            const regemail = regresult.rows[0].email;
            if (regemail.length < 1) {
                const data = { message: 'Email already registered', title: "Alert", icon: "warning" };
                return res.status(400).json(data);

            }
            // const storedOtp = dbotp.toString();
            // const clientotp = req.body.otp;




            const id_proof = fs.readFileSync(req.file.path);

            if (!id_proof) {
                const data = { message: 'Upload Valid Id proof', title: "Alert", icon: "warning" };
                return res.status(400).json(data);
            }

            const re_password = req.body.re_password;
            if (password === re_password) {
                const data = { message: 'Password Mismatch', title: "Alert", icon: "warning" };
                return res.status(400).json(data);
            }

            console.log(req.file.path)
            // Insert data into PostgreSQL database
            const query = `
            INSERT INTO registered ( first_name, last_name, mobile, organization, department, designation, email, user_type, about, password, id_proof)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;
            const values = [
                first_name,
                last_name,
                mobile,
                organization,
                department,
                designation,
                email,
                user_type,
                about,
                password,
                id_proof
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
        // const data = {message: 'Something not Went Wrong!'}
        // res.status(200).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
        // Get file data
        // console.log(req.file.path)
        // const id_proof = fs.readFileSync(req.file.path);

        // const id_proof = req.file.buffer; // This will contain the file buffer

        // const imageBuffer = fs.readFileSync('path/to/your/image.jpg')

        // Assuming id_proof is a bytea column in your PostgreSQL database
        // res.status(400).send('Verify OTP First');

    }
});

// ------Register route ends




router.get('/login', (req, res) => {
    // Your OpenLayers logic here
    res.render("userLogin");

});
router.post('/logn', (req, res) => {
    // Your OpenLayers logic here
    // res.render("login");

});

router.get('/forgot', (req, res) => {
    // Your OpenLayers logic here
    res.render("userForgot");

});
router.post('/forgot', (req, res) => {
    // Your OpenLayers logic here
    // res.render("query");

});


module.exports = router;
