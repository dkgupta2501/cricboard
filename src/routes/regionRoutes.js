const express = require('express');
const router = express.Router();
const { getStatesByCountry,getCountryList ,getCitiesByState,getCitiesByStateCodeOnly} = require('../controllers/regionController');



router.post('/getStatesByCountry', getStatesByCountry);
router.get('/getCountryList', getCountryList);
router.post('/getCitiesByState', getCitiesByState);
router.post('/getCitiesByStateCodeOnly', getCitiesByStateCodeOnly);

module.exports = router;