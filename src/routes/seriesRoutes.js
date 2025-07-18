const express = require('express');
const router = express.Router();
const { createSeries, getAllSeries ,assignTeamsToSeries,getTeamsForSeries,getDataValue,getUserDetails} = require('../controllers/seriesController');



router.post('/createSeries', createSeries);

router.get('/getAllSeries', getAllSeries);
router.get('/getDataValue', getDataValue);
router.post('/getUserDetails', getUserDetails);


router.post('/:series_id/teams', assignTeamsToSeries);
router.get('/:series_id/teams', getTeamsForSeries)

module.exports = router;
