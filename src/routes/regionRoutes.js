const express = require('express');
const router = express.Router();
const { getStatesByCountry } = require('../controllers/regionController');



router.post('/getStatesByCountry', getStatesByCountry);

module.exports = router;