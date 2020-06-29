const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');
router.use(express.urlencoded());
console.log('Router Loaded');

router.get('/', homeController.home);

router.use('/users', require('./users'));


//For any further routes access from here
//router.use('/routername', require('./routerfile'));

module.exports = router;