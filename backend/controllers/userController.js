const pool = require('../db');

async function getUserData(req, res) {
    const { userId } = req.query; // Assuming userId is passed as a query parameter
    try {
        const result = await pool.query('SELECT name, email, games_played, wins FROM public.users WHERE uid = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            name: result.rows[0].name,
            email: result.rows[0].email,
            gamesPlayed: result.rows[0].games_played,
            wins: result.rows[0].wins
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getUserData };
