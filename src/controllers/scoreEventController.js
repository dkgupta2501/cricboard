const pool = require('../config/db');
const redis = require('../config/redis');

exports.addScoreEvent = async (req, res) => {
  const {
    match_id,
    team_id,
    over,
    ball,
    batsman_id,
    bowler_id,
    runs,
    is_wicket,
    extras_type,
    extras_runs,
    commentary
  } = req.body;

  if (!match_id || over === undefined || ball === undefined || batsman_id === undefined || bowler_id === undefined) {
    return res.status(400).json({ error: 'Missing required ball-by-ball data.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO score_events (
         match_id, team_id, over, ball,
         batsman_id, bowler_id, runs, is_wicket,
         extras_type, extras_runs, commentary, created_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
       RETURNING *`,
      [
        match_id, team_id, over, ball,
        batsman_id, bowler_id, runs || 0, is_wicket || false,
        extras_type || null, extras_runs || 0, commentary || null
      ]
    );

    // Optional: broadcast to WebSocket
    // io.to(`match_${match_id}`).emit('score:update', result.rows[0]);

    // Invalidate match cache if needed
    await redis.del(`score_events:match:${match_id}`);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error recording score event:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getScoreEventsByMatch = async (req, res) => {
  const { match_id } = req.query;

  if (!match_id) {
    return res.status(400).json({ error: 'match_id is required.' });
  }

  try {
    const cacheKey = `score_events:match:${match_id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const result = await pool.query(
      `SELECT * FROM score_events
       WHERE match_id = $1
       ORDER BY over, ball`,
      [match_id]
    );

    await redis.setEx(cacheKey, 60, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching score events:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
