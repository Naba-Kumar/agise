const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Your OpenLayers logic here
    res.render("Catalog");

});

router.post('/request', (req, res) => {
    // Your OpenLayers logic here
    // res.render("Catalog");

});

router.get('/view', (req, res) => {
    // Your OpenLayers logic here
    res.render("view");

});

router.get('*', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");
    res.render("404")

});
module.exports = router;
