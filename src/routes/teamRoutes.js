const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams } = require('../controllers/teamController');

router.post('/create', (req, res) => {
  createTeam(req, res);
});

router.get('/list', (req, res) => {
  getAllTeams(req, res);
});

module.exports = router;
