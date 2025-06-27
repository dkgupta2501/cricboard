const pool = require('../config/db');

exports.assignPlayerToMatch = async (req, res) => {
  const { match_id, team_id, player_id, captain, wicket_keeper } = req.body;

  if (!match_id || !team_id || !player_id) {
    return res.status(400).json({ error: 'match_id, team_id, and player_id are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO match_playing_xi (
         match_id, team_id, player_id, captain, wicket_keeper
       ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [match_id, team_id, player_id, captain || false, wicket_keeper || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Player already added to this match.' });
    }

    console.error('Error assigning player to match:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMatchPlayingXI = async (req, res) => {
  const { match_id, team_id } = req.query;

  if (!match_id || !team_id) {
    return res.status(400).json({ error: 'match_id and team_id are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT p.*, xi.captain, xi.wicket_keeper
       FROM match_playing_xi xi
       JOIN players p ON xi.player_id = p.id
       WHERE xi.match_id = $1 AND xi.team_id = $2
       ORDER BY p.first_name`,
      [match_id, team_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching playing XI:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
