const pool = require('../config/db');
const redis = require('../config/redis');

exports.createPlayer = async (req, res) => {
  const {
    team_id,
    first_name,
    last_name,
    role,
    batting_style,
    bowling_style,
    date_of_birth,
    nationality
  } = req.body;

  if (!team_id || !first_name || !role) {
    return res.status(400).json({ error: 'team_id, first_name, and role are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO players (team_id, first_name, last_name, role, batting_style, bowling_style, date_of_birth, nationality)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [team_id, first_name, last_name, role, batting_style, bowling_style, date_of_birth, nationality]
    );

    // Invalidate cache
    await redis.del('players:list');

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating player:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllPlayers = async (req, res) => {
  const { team_id } = req.query;

  try {
    const cacheKey = team_id ? `players:list:team:${team_id}` : 'players:list';

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const query = team_id
      ? 'SELECT * FROM players WHERE team_id = $1 ORDER BY first_name'
      : 'SELECT * FROM players ORDER BY first_name';

    const result = team_id
      ? await pool.query(query, [team_id])
      : await pool.query(query);

    await redis.setEx(cacheKey, 60, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/team_players
exports.addPlayerToTeam = async (req, res) => {
    const { team_id, player_id } = req.body;
    try {
      await pool.query(
        'INSERT INTO team_players (team_id, player_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [team_id, player_id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  // DELETE /api/team_players
exports.removePlayerFromTeam = async (req, res) => {
    const { team_id, player_id } = req.query; // <-- note 'query' here
    try {
      await pool.query(
        'DELETE FROM team_players WHERE team_id = $1 AND player_id = $2',
        [team_id, player_id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  

  // GET /api/teams/:team_id/players
  exports.getPlayersForTeam = async (req, res) => {
    const { team_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT p.* FROM players p
         INNER JOIN team_players tp ON tp.player_id = p.id
         WHERE tp.team_id = $1
         ORDER BY p.first_name, p.last_name`,
        [team_id]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.listWithPlayerCount = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT t.*, COUNT(tp.player_id) AS player_count
        FROM teams t
        LEFT JOIN team_players tp ON tp.team_id = t.id
        GROUP BY t.id
        ORDER BY t.name
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  