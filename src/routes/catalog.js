
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const userAuthMiddleware = require("../middleware/userAuth")
const jwt = require('jsonwebtoken');
const childProcess = require('child_process');
const { exec } = childProcess;
const AdmZip = require('adm-zip');
const axios = require('axios');
const fs = require('fs')

const cookieParser = require('cookie-parser');
const { log } = require('console');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();


// router.get('/', async(req, res) => {
// //    
//     try {
//         const client = await pool.poolUser.connect();
//         // const result = await client.query('SELECT file_name, file_id, workspace, title, description FROM catalog');
//         // const catalogItems = result.rows;


//         const catalogResult = await client.query('SELECT file_name, file_id, workspace, title, description FROM catalog');
//         const catalogItems = catalogResult.rows;
//         console.log(req.user)

//         // Fetch request statuses for each catalog item for the current user

//         if(req.user.email.length>0){
//             const email = req.user.email;
//             console.log(req.user.email)
//             for (const item of catalogItems) {
//                 const requestResult = await client.query(`
//                 SELECT is_checked, request_status  
//                 FROM requests 
//                 WHERE email = $1 AND file_name = $2
//                 ORDER BY requestno DESC LIMIT 1
//                 `, [email, item.file_name]);

//             if (requestResult.rows.length > 0) {
//                 const request = requestResult.rows[0];
//             if (request.check) {
//                     if (request.request_status) {
//                         item.requestStatus = 'approved';
//                     } else {
//                         item.requestStatus = 'rejected';
//                     }
//                 } else {
//                     item.requestStatus = 'requested';
//                 }
//             } else {
//                 item.requestStatus = 'request';
//             }
//         }
//     }

//         client.release();
//         res.render('catalog', { catalogItems });


//         // res.render('catalog', { catalogItems });
//     } catch (err) {
//         console.error('Error fetching catalog items', err);
//         res.status(500).send('Internal Server Error');
//     }

// });

router.get('/', async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const catalogResult = await client.query('SELECT file_name, file_id, workspace, title, description FROM catalog WHERE visibility=$1', [true]);
        const catalogItems = catalogResult.rows;

        const token = req.cookies.token;

        // Set default requestStatus for all catalog items
        catalogItems.forEach(item => {
            item.requestStatus = 'request';
        });

        function parseJwt(token) {
            try {
                return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            } catch (e) {
                return null;
            }
        }

        if (!token) {
            client.release();
            return res.render('catalog', { catalogItems });
        }

        const decodedToken = parseJwt(token);
        const currentTime = Math.floor(Date.now() / 1000);



        if (!decodedToken || decodedToken.exp < currentTime) {
            client.release();
            return res.render('catalog', { catalogItems });
        }

        try {
            const decoded = jwt.verify(token, process.env.secretKey);
            const { userId, email } = decoded;
            console.log(req.user)

            if (email) {
                for (const item of catalogItems) {
                    const requestResult = await client.query(`
                        SELECT is_checked, request_status  
                        FROM requests 
                        WHERE email = $1 AND file_name = $2
                        ORDER BY requestno DESC LIMIT 1
                    `, [email, item.file_name]);

                    if (requestResult.rows.length > 0) {
                        const request = requestResult.rows[0];
                        if (request.is_checked) {
                            item.requestStatus = request.request_status ? 'approved' : 'rejected';
                        } else {
                            item.requestStatus = 'requested';
                        }
                    } else {
                        item.requestStatus = 'request';
                    }
                }
            }

            client.release();
            return res.render('catalog', { catalogItems });
        } catch (e) {
            client.release();
            return res.render('catalog', { catalogItems });
        }
    } catch (err) {
        console.error('Error fetching catalog items', err);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id)
    // res.render("catalogView")
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query(`SELECT * FROM catalog where file_name = $1`, [id]);
        const catalogItems = result.rows;
        console.log(catalogItems)

        client.release();
        res.render('catalogView', { catalogItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
    // Logic to view the shapefile
});


router.post('/:id', userAuthMiddleware, async (req, res) => {
    const file_name = req.params.id;
    const email = req.user.email;

    // res.render("catalogView")
    try {
        console.log(req.body)
        console.log(req.user)

        const client = await pool.poolUser.connect();
        const result = await client.query(`SELECT * FROM requests WHERE email=$1 AND file_name=$2`, [email, file_name]);

        if (result.rows.length > 0) {

            const data = { message: 'File already requested!', title: "Alert", icon: "warning" };
            return res.status(400).json(data);
        }
        const is_checked = false;
        const request_status = false;
        const is_isolated = false;


        await client.query(`INSERT INTO requests (email, file_name, is_checked, request_status, is_isolated) VALUES ($1, $2, $3, $4, $5)`, [email, file_name, is_checked, request_status, is_isolated]);

        const data = { message: 'File requested!', title: "success", icon: "success" };
        return res.status(400).json(data);


    } catch (err) {
        console.error(err);
        // res.status(500).send('Server Error');
        const data = { message: 'Server Error!', title: "Error", icon: "error" };
        return res.status(400).json(data)
    }
    // Logic to view the shapefile
});

router.get('/request/:id', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.redirect('/login');
    }
    const id = req.params.id;
    // Logic to handle data request
});

router.post('/download/:id', userAuthMiddleware, async (req, res) => {
    try {
        console.log("foil");
        const email = req.user.email;
        const file_name = req.params.id;
        const file_name_withext = `${file_name}.zip`;

        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT * FROM useraccess WHERE email=$1 AND file_name=$2', [email, file_name]);
        client.release();

        if (result.rows.length > 0) {
            const filePath = path.join(__dirname, '../../catalog', file_name_withext);

            if (!fs.existsSync(filePath)) {
                console.log(filePath);
                const data = { message: 'File not found', icon: 'warning' };
                return res.status(404).json(data); // Use 404 status code for file not found
            }

        
            const stat = fs.statSync(filePath);

            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename=${path.basename(file_name_withext)}`
            });

            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
            // console.log(readStream)

            readStream.on('error', (err) => {
                console.error('Error reading file:', err);
                if (!res.headersSent) {
                    const data = { message: 'Error while reading file', icon: 'warning' };
                    return res.status(500).json(data); // Use 500 status code for server error
                }
            });

            res.on('close', () => {
                console.log('Response finished');
                readStream.destroy();
            });

        } else {
            const data = { message: 'Forbidden', icon: 'warning' };
            return res.status(403).json(data); // Use 403 status code for forbidden
        }
    } catch (error) {
        console.error(error);
        const data = { message: 'Internal server error', icon: 'error' };
        return res.status(500).json(data); // Use 500 status code for server error
    }
});





module.exports = router;
