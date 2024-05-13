const  express = require('express');
const  router = express.Router();

router.use('/', require('./home'));

router.use('/gis', require('./gis'));

router.use('/user', require('./user'));


router.use('/catalog', require('./catalog'));

router.use('/admin', require('./admin'));



module.exports = router;

