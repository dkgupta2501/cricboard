const express = require('express');
const router = express.Router();
const {
    createMatch,
    getAllMatches,
    updateMatchToss,
    getMatchSummary
  } = require('../controllers/matchController');
  

  
router.get('/:id/summary', (req, res) => {
    getMatchSummary(req, res);
});
  

router.post('/create', (req, res) => {
  createMatch(req, res);
});

router.get('/list', (req, res) => {
  getAllMatches(req, res);
});

router.put('/:id/toss/update', (req, res) => {
  updateMatchToss(req, res);
});

router.put('/:id/toss/update', (req, res) => {
  updateMatchToss(req, res);
});


module.exports = router;
