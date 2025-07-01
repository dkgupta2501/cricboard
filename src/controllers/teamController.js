const pool = require('../config/db');
const redis = require('../config/redis');

exports.createTeam = async (req, res) => {
  const { name, logo_url, coach_name, home_ground } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO teams (name, logo_url, coach_name, home_ground)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, logo_url, coach_name, home_ground]
    );

    // Invalidate cache
    // await redis.del('teams:list');

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    // const cached = await redis.get('teams:list');

    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }

    const result = await pool.query(`SELECT * FROM teams ORDER BY name ASC`);

    //await redis.setEx('teams:list', 60, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
