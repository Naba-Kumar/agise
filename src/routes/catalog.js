
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const adminAuthMiddleware = require("../middleware/adminAuth")
const jwt = require('jsonwebtoken');
const childProcess = require('child_process');
const { exec } = childProcess;
const AdmZip = require('adm-zip');
const axios = require('axios');

const cookieParser = require('cookie-parser');
const { log } = require('console');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async(req, res) => {
//    
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT file_name, file_id, workspace, title, description FROM catalog');
        const catalogItems = result.rows;
        res.render('catalog', { catalogItems });
    } catch (err) {
        console.error('Error fetching catalog items', err);
        res.status(500).send('Internal Server Error');
    }

});



router.get('/view/:id', (req, res) => {
    const id = req.params.id;
    // Logic to view the shapefile
});

router.get('/request/:id', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.redirect('/login');
    }
    const id = req.params.id;
    // Logic to handle data request
});

router.get('/download/:id', (req, res) => {
    if (!isAuthenticated(req) || !userHasRequestedData(req, id) || !adminHasApprovedRequest(req, id)) {
        return res.status(403).send('Forbidden');
    }
    const id = req.params.id;
    // Logic to handle data download
});





module.exports = router;
