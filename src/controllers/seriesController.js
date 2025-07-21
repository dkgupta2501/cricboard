const pool = require('../config/db');
const redisClient = require('../config/redis');


exports.getDataValue = async (req, res) => {
  try {
    const data = [
      { id: 1, value: 'Test 1' },
      { id: 2, value: 'Test 2' },
      { id: 3, value: 'Test 3' },
      { id: 4, value: 'Test 4' }
    ];
    console.error('Error assigning teams to series:', data);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error getting data:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.body; // get userId from POST body

    // You can log or use userId here if needed
    console.log('Requested userId:', userId);

    // Since data is hardcoded, just return it always
    const data = {
      name: "Dhananjay Kumar Gupta",
      email: "dhananjay@gmail.com",
      mobile: "7256908978",
      date:"2025-07-18"
    };

    res.status(200).json(data);
  } catch (err) {
    console.error('Error getting data:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.createSeries = async (req, res) => {
  const { name, description, start_date, end_date } = req.body;

  if (!name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Name, start_date, and end_date are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO series (name, description, start_date, end_date) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, start_date, end_date]
    );

    // Invalidate cache
   // await redisClient.del('series:list');

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating series:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllSeries = async (req, res) => {
  try {
    //const cached = await redisClient.get('series:list');

    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }

    const result = await pool.query('SELECT * FROM series ORDER BY start_date DESC');

    //await redisClient.setEx('series:list', 60, JSON.stringify(result.rows)); // cache for 60s

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching series:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/series/:series_id/teams
exports.assignTeamsToSeries = async (req, res) => {
  const { series_id } = req.params;
  const { team_ids } = req.body; // team_ids: [int, int, ...]

  if (!Array.isArray(team_ids)) {
    return res.status(400).json({ error: 'team_ids must be an array.' });
  }

  try {
    // Remove existing assignments for this series
    await pool.query('DELETE FROM series_teams WHERE series_id = $1', [series_id]);

    // Insert new assignments
    if (team_ids.length > 0) {
      const values = team_ids.map((_, idx) => `($1, $${idx + 2})`).join(', ');
      const params = [series_id, ...team_ids];
      await pool.query(`INSERT INTO series_teams (series_id, team_id) VALUES ${values}`, params);
    }

    // Invalidate any relevant Redis cache if you use it for series-team lists
    // await redisClient.del(`series:${series_id}:teams`);

    res.json({ success: true, message: "Teams assigned to series." });
  } catch (err) {
    console.error('Error assigning teams to series:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/series/:series_id/teams
exports.getTeamsForSeries = async (req, res) => {
  const { series_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT t.* FROM teams t 
       INNER JOIN series_teams st ON t.id = st.team_id 
       WHERE st.series_id = $1
       ORDER BY t.name`,
      [series_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teams for series:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
