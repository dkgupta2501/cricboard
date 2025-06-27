const express = require('express');
const router = express.Router();
const { createPlayer, getAllPlayers ,addPlayerToTeam,removePlayerFromTeam,getPlayersForTeam,listWithPlayerCount} = require('../controllers/playerController');

router.post('/create', (req, res) => {
  createPlayer(req, res);
});

router.get('/list', (req, res) => {
  getAllPlayers(req, res);
});


// Assign (add) player to team
router.post('/addPlayerToTeam', addPlayerToTeam);

// Remove (delete) player from team
router.delete('/removePlayerFromTeam', removePlayerFromTeam);

// Get all players for a team
router.get('/team/getPlayersForTeam/:team_id', getPlayersForTeam);

router.get('/team/listWithPlayerCount', listWithPlayerCount);

module.exports = router;
