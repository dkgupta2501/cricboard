const express = require('express');
const router = express.Router();
const { getStatesByCountry,getCountryList ,getCitiesByState} = require('../controllers/regionController');



router.post('/getStatesByCountry', getStatesByCountry);
router.get('/getCountryList', getCountryList);
router.post('/getCitiesByState', getCitiesByState);

module.exports = router;