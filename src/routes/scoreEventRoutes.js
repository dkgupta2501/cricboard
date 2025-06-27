const express = require('express');
const router = express.Router();
const { addScoreEvent, getScoreEventsByMatch } = require('../controllers/scoreEventController');

router.post('/add', (req, res) => {
  addScoreEvent(req, res);
});

router.get('/list', (req, res) => {
  getScoreEventsByMatch(req, res);
});

module.exports = router;
