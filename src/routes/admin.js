const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    // Your OpenLayers logic here
    res.render("adminHome");
    
});

router.post('/login', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminLogin");

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
