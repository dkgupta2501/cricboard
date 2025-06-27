const pool = require('../config/db');
const redis = require('../config/redis');

exports.createMatch = async (req, res) => {
  const {
    series_id,
    team1_id,
    team2_id,
    venue_id,
    match_date,
    match_format,
    total_overs
  } = req.body;

  if (!series_id || !team1_id || !team2_id || !match_date || !match_format || !total_overs) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (team1_id === team2_id) {
    return res.status(400).json({ error: 'Team 1 and Team 2 must be different.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO matches (
         series_id, team1_id, team2_id, venue_id,
         match_date, match_format, total_overs, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Scheduled') RETURNING *`,
      [series_id, team1_id, team2_id, venue_id, match_date, match_format, total_overs]
    );

    await redis.del('matches:list');

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating match:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllMatches = async (req, res) => {
    const { series_id } = req.query;
  
    try {
      const cacheKey = series_id ? `matches:list:series:${series_id}` : 'matches:list';
  
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
  
      const query = series_id
        ? `SELECT m.*, 
                 t1.name AS team1_name, 
                 t2.name AS team2_name
            FROM matches m
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            WHERE m.series_id = $1
            ORDER BY m.match_date`
        : `SELECT m.*, 
                 t1.name AS team1_name, 
                 t2.name AS team2_name
            FROM matches m
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            ORDER BY m.match_date`;
  
      const result = series_id
        ? await pool.query(query, [series_id])
        : await pool.query(query);
  
      await redis.setEx(cacheKey, 60, JSON.stringify(result.rows));
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching matches:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

exports.updateMatchToss = async (req, res) => {
    const matchId = req.params.id;
    const { toss_winner_team_id, toss_decision } = req.body;
  
    if (!toss_winner_team_id || !['bat', 'bowl'].includes(toss_decision)) {
      return res.status(400).json({ error: 'Invalid toss details.' });
    }
  
    try {
      const matchResult = await pool.query('SELECT * FROM matches WHERE id = $1', [matchId]);
  
      if (matchResult.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found.' });
      }
  
      const updateResult = await pool.query(
        `UPDATE matches
         SET toss_winner_team_id = $1, toss_decision = $2, status = 'Toss Done'
         WHERE id = $3
         RETURNING *`,
        [toss_winner_team_id, toss_decision, matchId]
      );
  
      // Invalidate cache if needed
      await redis.del('matches:list');
  
      res.json(updateResult.rows[0]);
    } catch (err) {
      console.error('Error updating toss:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  exports.getMatchSummary = async (req, res) => {
    const matchId = req.params.id;
  
    try {
      const [scoreRes, matchRes] = await Promise.all([
        pool.query(
          `SELECT
             team_id,
             SUM(runs + extras_runs) AS total_runs,
             COUNT(*) FILTER (WHERE is_wicket = true) AS wickets,
             MAX(over) AS last_over,
             MAX(ball) AS last_ball
           FROM score_events
           WHERE match_id = $1
           GROUP BY team_id`,
          [matchId]
        ),
        pool.query(
          `SELECT m.*, t1.name as team1_name, t2.name as team2_name
           FROM matches m
           JOIN teams t1 ON m.team1_id = t1.id
           JOIN teams t2 ON m.team2_id = t2.id
           WHERE m.id = $1`,
          [matchId]
        )
      ]);
  
      if (matchRes.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found.' });
      }
  
      const match = matchRes.rows[0];
      const innings = scoreRes.rows.map(row => ({
        team_id: row.team_id,
        total_runs: parseInt(row.total_runs),
        wickets: parseInt(row.wickets),
        overs: `${row.last_over}.${row.last_ball}`
      }));
  
      const summary = {
        match_id: match.id,
        series_id: match.series_id,
        teams: {
          [match.team1_id]: match.team1_name,
          [match.team2_id]: match.team2_name
        },
        status: match.status,
        format: match.match_format,
        total_overs: match.total_overs,
        innings
      };
  
      res.json(summary);
    } catch (err) {
      console.error('Error fetching match summary:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  