const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
//    
    try {
        const result = await pool.query('SELECT id, name, title, description FROM catalog');
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
