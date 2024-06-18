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



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.appw
    }
});



router.get('/', async(req, res) => {
    res.render("userRegister",{
        pageTitle:"Register"
    });
    
});


router.get('/login', (req, res) => {
    // Your OpenLayers logic here
    res.render("userLogin",{
        pageTitle:"Login"
    });
    
});

router.get('/forgot', (req, res) => {
    // Your OpenLayers logic here
    res.render("userForgot",{
        pageTitle:"Update Password"
    });

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
                text: `${otp} : is Your OTP for Registration ASSAM GIS EXPLORER . ASSAM STATE SPACE APPLICATION CENTER`
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
            const otpresult = await client.query(`SELECT otp FROM emailotp WHERE email = $1`, [email]);


            if (otpresult.rows == 0) {
                const data = { message: 'Verify OTP first', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }
            const dbotp = otpresult.rows[0].otp;
            const storedOtp = dbotp.toString();
            const clientotp = req.body.otp;

            if (clientotp != storedOtp) {
                const data = { message: 'Verify OTP first', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }


            const regresult = await client.query(`SELECT * FROM registered WHERE email = $1`, [email]);
            console.log(`-->${regresult.rows == 0}`)
            // const regemail = regresult.rows[0].email;
            if (regresult.rows != 0) {
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

            // Add properties to it
            schema
                .is().min(8)                                    // Minimum length 8
                .is().max(100)                                  // Maximum length 100
                .has().uppercase()                              // Must have uppercase letters
                .has().lowercase()                              // Must have lowercase letters
                .has().digits(2)                                // Must have at least 2 digits
                .has().not().spaces()                           // Should not have spaces
                .has().symbols()                                // Must have at least one special character

            // Validate password function
            const validatePassword = (password) => {
                return schema.validate(password, { details: true });
            };
            const re_password = req.body.re_password;

            if (password != re_password) {
                const data = { message: 'Password Mismatch', title: "Alert", icon: "warning" };
                return res.status(400).json(data);
            }
            if (validatePassword(password).length != 0) {
                const data = { message: 'Minimum length 8 || Must have uppercase letters || Must have lowercase letters || Must have at least 2 digits || Should not have spaces || Must have at least one special character', title: "Password criteria", icon: "warning" };
                return res.status(400).json(data);
            }

            console.log(req.file.path)
            // Insert data into PostgreSQL database
            const query = `
            INSERT INTO registered ( first_name, last_name, mobile, organization, department, designation, email, user_type, about, password, id_proof)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;
            const hash_pw = bcrypt.hashSync(req.body.password, 10);
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
                hash_pw,
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






router.post('/login', upload.single('id_proof'), async (req, res) => {

    const {

        email,
        otp,
        password
    } = req.body;
    console.log(req.body)

    const action = req.body.submit;
    console.log(action)



    if (action === "GetOTP") {
        console.log("click getopt")
        // Handle action 1
        const email = req.body.email;

        try {
            const client = await pool.poolUser.connect();
            const user = await client.query('SELECT * FROM registered WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (!validPassword) {
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);
            }

            // if (!validator.isEmail(email)) {
            //     const data = { message: 'Please enter valid email', title: "Alert", icon: "danger" };
            //     return res.status(400).json(data);
            // }


            // Generate OTP (random 6-digit number)
            const otp = Math.floor(100000 + Math.random() * 900000);


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
                text: `${otp} : is Your OTP for Login ASSAM GIS EXPLORER . ASSAM STATE SPACE APPLICATION CENTER`
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

    if (action === "login") {

        try {
            // const password = req.body.password

            console.log("clicked login")
            console.log(req.body)


            if (!email || !password || !otp) {
                const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
                // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
                return res.json(data)
            }
        




            const client = await pool.poolUser.connect();


            const user = await client.query('SELECT * FROM registered WHERE email = $1', [email]);
            console.log("db pw")

            console.log('user')

            if (user.rows.length === 0) {
                console.log('Invalid Creadential 1')
                // return res.status(400).json({ error: 'Invalid Creadential' });
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);
            }
            console.log("2")
            console.log(bcrypt.hashSync(req.body.password, 10))
            console.log(user.rows[0].password)

            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (!validPassword) {
                console.log('Invalid Creadential 2')
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);

            }
            console.log("3")


            const validOtp = await client.query(`SELECT * FROM emailotp WHERE email = $1`, [email]);
            const result = await client.query(`SELECT otp FROM emailotp WHERE email = $1`, [email]);
            // console.log(result.rows);
            // console.log(result.rows[0]);
            // console.log();
            const dbotp = result.rows[0].otp;
            const storedOtp = dbotp.toString();

            client.release();

            console.log(storedOtp)
            console.log(otp)


            if (storedOtp != otp) {
                console.log('Invalid Otp')

                return res.status(400).json({ error: 'Invalid Otp' });
            }
            console.log("4")

            const token = await jwt.sign({ email: user.rows[0].email }, process.env.secretKey, { expiresIn: '240h' });

            console.log("token")


            // res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });

            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
            // console.log("Login successful")
            // return res.json({ message: 'Login successful', token });
            const data = { message: 'Login successful', title: "Sent", icon: "success", redirect: "/" };
            res.status(200).json(data);

            // Redirect to another route (e.g., the homepage)
            res.redirect('/');



            //    .json({ message: 'Login successful' });
            //    return res.json({ token });
            //    .json({ message: 'Login successful' });
            //    return res.json({ token });
        } catch (error) {

            console.log(error)

        }


    }



});


router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logout successful' });
});

router.post('/secret', userAuthMiddleware, (req, res) => {

    res.render("catalogView")

});








router.post('/forgot', upload.single('id_proof'), async (req, res) => {

    const action = req.body.submit;
    console.log("jijijijij")

    console.log(req.body)

   
    if (action === "GetOTP") {
        console.log("click getopt")
        // Handle action 1
        const email = req.body.email;

        try {
            const {

                email,
                password

            } = req.body;
            const client = await pool.poolUser.connect();
            const user = await client.query('SELECT * FROM registered WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                const data = { message: 'Invalid User', title: "Warning", icon: "danger" };
                return res.status(400).json(data);
            }

 

      
            // Generate OTP (random 6-digit number)
            const otp = Math.floor(100000 + Math.random() * 900000);


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
                text: `${otp} : is Your OTP for Login ASSAM GIS EXPLORER . ASSAM STATE SPACE APPLICATION CENTER`
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

    else if (action === 'update') {
        console.log("click Register")

        console.log(req.body)

        try {

            const {

                email,
                otp,
                password
            } = req.body;

            if (!email || !password || !otp) {
                const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
                // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
                return res.json(data)
            }

            const client = await pool.poolUser.connect();
            const otpresult = await client.query(`SELECT otp FROM emailotp WHERE email = $1`, [email]);

            if (otpresult.rows == 0) {
                const data = { message: 'Verify OTP first', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }
            const dbotp = otpresult.rows[0].otp;
            const storedOtp = dbotp.toString();
            const clientotp = req.body.otp;

            if (clientotp != storedOtp) {
                const data = { message: 'Verify OTP first', title: "Alert", icon: "danger" };
                return res.status(400).json(data);
            }


            const regresult = await client.query(`SELECT * FROM registered WHERE email = $1`, [email]);
            console.log(`-->${regresult.rows == 0}`)
            // const regemail = regresult.rows[0].email;
            if (regresult.rows === 0) {
                const data = { message: 'Record not found!', title: "Alert", icon: "warning" };
                return res.status(400).json(data);

            }
            // Add properties to it
            schema
                .is().min(8)                                    // Minimum length 8
                .is().max(100)                                  // Maximum length 100
                .has().uppercase()                              // Must have uppercase letters
                .has().lowercase()                              // Must have lowercase letters
                .has().digits(2)                                // Must have at least 2 digits
                .has().not().spaces()                           // Should not have spaces
                .has().symbols()                                // Must have at least one special character

            // Validate password function
            const validatePassword = (password) => {
                return schema.validate(password, { details: true });
            };
            const re_password = req.body.re_password;

            if (password != re_password) {
                const data = { message: 'Password Mismatch', title: "Alert", icon: "warning" };
                return res.status(400).json(data);
            }
            if (validatePassword(password).length != 0) {
                const data = { message: 'Minimum length 8 || Must have uppercase letters || Must have lowercase letters || Must have at least 2 digits || Should not have spaces || Must have at least one special character', title: "Password criteria", icon: "warning" };
                return res.status(400).json(data);
            }

            // Insert data into PostgreSQL database
           

            const update = `
            UPDATE registered SET password = $1 WHERE email = $2;
                 `;


            const hash_pw = bcrypt.hashSync(req.body.password, 10);
            const values = [
                hash_pw,
                email
            ];


          
            const dd = await client.query(update, values);
            console.log(dd)
            client.release();

            const data = { message: 'Password Updated Successfully', title: "Updated", icon: "success" };
            return res.status(400).json(data);

        } catch (error) {
            const data = { message: 'Something Went Wrong! try again', title: "Wrong", icon: "danger" };
            console.error('Error inserting data:', error);
            return res.status(400).json(data);

        }
        
    }


  
});

router.get('/a', (req, res) => {
    // Your OpenLayers logic here
    res.render("test");
    // res.render("404")

});

router.get('*', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");
    res.render("404")

});


module.exports = router;
