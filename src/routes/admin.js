
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



const loginstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'logins/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});

const login = multer({ storage: loginstorage });


const shpupload = multer({
    dest: 'shpuploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only ZIP files are allowed.'));
        }
    }
});;




router.get('/', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminLogin");

});

router.get('/home', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminHome");

});

router.post('/', login.single('id_proof'), async (req, res) => {
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
        client.release()
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


router.get('/requests', adminAuthMiddleware, async(req, res) => {
    // Your OpenLayers logic here
    try {
        
        const client = await pool.poolUser.connect();
        const  result  = await client.query('SELECT * FROM requests WHERE is_isolated=$1',[false]);
        const requestItems = result.rows;
    
        client.release();
        res.render('adminFileRequests', { requestItems});
    } catch (error) {
        
    }
    

});

router.post('/requests', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminRequests");

});

router.get('/isolated', adminAuthMiddleware, (req, res) => {
    res.render("adminFileRequests");

});

router.post('/isolated', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminRequests");

});

router.get('/upload', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminUpload");

});

router.post('/shpuploads', adminAuthMiddleware, shpupload.single('shapefile'), async (req, res) => {
    // Your OpenLayers logic here

    console.log("jij")
    try {
        const { table_name, workspace, data_store, srid } = req.body;

        if (!table_name || !workspace || !data_store || !srid) {
            const data = { message: 'All Fields Are Required', title: "Alert", icon: "warning", redirect: '\\admin\\upload' };
            return res.status(400).json(data);
        }

        const client = await pool.poolShp.connect();

        const query = `
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name = $1
                );
            `;
        const result = await client.query(query, [table_name]);
        const checkTableExists = result.rows[0].exists;
        client.release()

        if (checkTableExists) {
            const data = { message: 'Shapefile Name Already Exist', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
            return res.status(400).json(data);
        }



        console.log("hello from shpupld")
        let zipfilePath = req.file.path;
        const basedir = 'shpuploads/'
        const zip = new AdmZip(req.file.path);

        const fullDirectoryPath = path.join(basedir, table_name)

        zip.extractAllTo(fullDirectoryPath, true);

        const tmpshppath0 = fullDirectoryPath + '\\' + req.file.originalname;

        const tmpshppath = path.normalize(tmpshppath0);
        // Extract the file name without the extension
        const shapefilePath = tmpshppath.replace(".zip", ".shp");
        // Return the file name with the new extension

        // process.env.PGPASSWORD = '306090';

        const cmd = `shp2pgsql -I -s ${srid} ${shapefilePath} ${table_name} | psql -U ${process.env.db_user} -d ${process.env.shp_db}`;

        console.log(cmd)

        exec(cmd, { env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD } }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                // return res.status(500).send('Error uploading shapefile.');
                const data = { message: 'Something Were Wrong', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
                return res.status(400).json(data);
            }
            if (stderr) {
                console.error(`stder/r: ${stderr}`);
                // return res.status(500).send('Error uploading shapefile.');
                // const data = { message: 'Something Were Wrong', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
                // return res.status(400).json(data);
            }
            if (stdout) {
                // console.error(`stdout: ${stdout}`);
                // return res.status(500).send('Error uploading shapefile.');
            }

            // If successful, send a success response
            // res.send('Shapefile uploaded successfully.');
            const is_added = false;
            const query = `
                 INSERT INTO shapefiles (file_name, is_added)
                 VALUES ($1, $2)
                `;

            const values = [
                table_name,
                is_added
            ];

            try {
                const client = await pool.poolUser.connect();

                const checkUpload = await client.query(query, values);

                client.release();
                console.log('Shapefile uploaded successfully');
                const data = { message: 'Shapefile uploaded successfully', title: "uploaded", icon: "success", redirect: '\\admin\\upload' };
                console.log(data)
                return res.status(400).json(data);
            } catch (dbError) {
                console.error('Error executing database query:', dbError);
                const data = { message: 'something went wrong ', title: "Oops?", icon: "danger" };
                return res.status(400).json(data);
                res.status(500).send('Error executing database query');
            }


        })


    } catch (error) {

        console.error(`erryor: ${error}`)
        const data = { message: 'Invalid zip format or Something went wrong', title: "Oops?", icon: "error" };
                console.log(data)
                return res.status(400).json(data);
    }

});


// Route to get item details
// Route to fetch item details based on file_name
router.get('/catalog/:file_name', async (req, res) => {
    try {
        const { file_name } = req.params;
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE file_name = $1', [file_name]);
        client.release();
        if (rows.length) {
            res.json(rows[0]);
        } else {
            res.status(404).send('File not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to render the form with file names
router.get('/catalog', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE is_added=false');
        client.release();
        res.render('adminAddCatalog', { catalogItems: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/catalog', adminAuthMiddleware, login.single('id_proof'), async (req, res) => {

    console.log(req.body)



    const { file_name, file_id, workspace, store, title, description } = req.body;

    try {
        if (!file_name || !file_id || !workspace || !store || !title || !description) {
            const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
            return res.json(data)
        }

        console.log(req.body)


        axios.post(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
            featureType: {
                name: file_name,
                nativeName: file_name,
                title: file_name,
                srs: 'EPSG:4326'
                // attributes: {
                //     attribute: [
                //       { name: 'name', binding: 'java.lang.String' },
                //       { name: 'description', binding: 'java.lang.String' },
                //       { name: 'latitude', binding: 'java.lang.Double' },
                //       { name: 'longitude', binding: 'java.lang.Double' }
                //     ]
                //   }
            }
        }, {
            auth: {
                username: 'admin',
                password: 'geoserver'
            }
        }).then(async response => {
            // res.send('Shapefile uploaded and published successfully');
            console.log('--------------------------------------')
            console.log(response)
            console.log('--------------------------------------')


            const client = await pool.poolUser.connect();

            const visibility = true;

            console.log("heyyyyyyyyyyyyyyyy")

            const query = `
                INSERT INTO catalog( file_name, file_id, workspace, store, title, description, visibility)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `;
            const values = [
                file_name,
                file_id,
                workspace,
                store,
                title,
                description,
                visibility
            ];

            const checkUpload = await client.query(query, values);



            const shapefile_table_query = `
            UPDATE shapefiles
            SET is_added=$1
            WHERE file_name=$2
             `;

            const shapefile_table_update = [true, file_name]

            await client.query(shapefile_table_query, shapefile_table_update);

            console.log("-------------------")
            console.log(checkUpload)
            console.log("-------------------")
            client.release();

            // console.error('Error publishing to to GeoServer:', error);
            const data = { message: 'File Published to GeoServer', title: "Success", icon: "success" };
            console.log(data)
            return res.status(500).json(data);




        }).catch(error => {
            console.error('Error publishing to GeoServer:', error);
            const data = { message: 'Error publishing to GeoServer', title: "Oops?", icon: "danger" };
            console.log(data)
            return res.status(500).json(data);
        });


    } catch (error) {
        console.error(`Error - ${error}`)

    }


});
router.post('/delete', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminDelete");

});
router.get('/delete', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    res.render("adminFileDelete");

});


router.get('/manage', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT sn, file_id, file_name, title, visibility  FROM catalog');
        client.release();

        const catalogItems = result.rows;

        // client.release();
        res.render('adminCatalogManage', { catalogItems});

        // res.render('adminAddCatalog', { catalogItems: rows });
        // res.render('adminCatalogManage');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




router.put('/manage', adminAuthMiddleware, async (req, res) => {
    const { id, visibility } = req.body;

    if (id == null || visibility == null) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const client = await pool.poolUser.connect();
        const query = `
            UPDATE catalog
            SET visibility = $1
            WHERE sn = $2
        `;
        const values = [visibility, id];

        await client.query(query, values);
        client.release(); // Ensure the connection is released
        res.status(200).json({ success: true, icon: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});


router.get('/isolated', adminAuthMiddleware, async (req, res) => {
    try {
        // const client = await pool.poolUser.connect();
        // const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE is_added=false');
        // client.release();
        // res.render('adminAddCatalog', { catalogItems: rows });
        res.render('adminFileRequestsISo');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/isolated', adminAuthMiddleware, async (req, res) => {
    try {
        // const client = await pool.poolUser.connect();
        // const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE is_added=false');
        // client.release();
        // res.render('adminAddCatalog', { catalogItems: rows });
        res.render('adminFileRequestsISo');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/privilege', adminAuthMiddleware, async (req, res) => {
    try {
        // const client = await pool.poolUser.connect();
        // const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE is_added=false');
        // client.release();
        // res.render('adminAddCatalog', { catalogItems: rows });
        res.render('adminPrivilege');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/search', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT *  FROM registered');
        client.release();

        const userItems = result.rows;

        const imageBuffer = result.rows[0].id_proof;
        result.rows[0].id_proof = imageBuffer.toString('base64');

        // client.release();
        res.render('adminSearch', { userItems});

        // res.render('adminAddCatalog', { catalogItems: rows });
        // res.render('adminCatalogManage');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



// router.get('/login', (req, res) => {
//     // Your OpenLayers logic here
//     res.render("adminLogin");

// });


router.get('/queries', adminAuthMiddleware, async (req, res) => {
    // Your OpenLayers logic here
    try {
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT * FROM queries');
        client.release();
        res.render('adminQueries', { queries: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

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
