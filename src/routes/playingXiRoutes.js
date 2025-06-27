const express = require('express');
const router = express.Router();
const { assignPlayerToMatch, getMatchPlayingXI } = require('../controllers/playingXiController');

router.post('/add', (req, res) => {
  assignPlayerToMatch(req, res);
});

router.get('/list', (req, res) => {
  getMatchPlayingXI(req, res);
});

module.exports = router;
