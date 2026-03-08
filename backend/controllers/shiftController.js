const pool = require('../config/db');

// Get all shifts for the logged-in user
exports.getMyShifts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name
       FROM shifts s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = $1
       ORDER BY s.date ASC, s.start_time ASC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ message: 'Server error fetching shifts' });
  }
};

// Get all shifts (managers only)
exports.getAllShifts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email
       FROM shifts s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.date ASC, s.start_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all shifts error:', error);
    res.status(500).json({ message: 'Server error fetching shifts' });
  }
};

// Create a new shift (managers only)
exports.createShift = async (req, res) => {
  try {
    const { userId, date, startTime, endTime, position, location } = req.body;

    if (!userId || !date || !startTime || !endTime || !position) {
      return res.status(400).json({ message: 'userId, date, startTime, endTime, and position are required' });
    }

    const result = await pool.query(
      `INSERT INTO shifts (user_id, date, start_time, end_time, position, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, date, startTime, endTime, position, location || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ message: 'Server error creating shift' });
  }
};

// Update a shift (managers only)
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, date, startTime, endTime, position, location } = req.body;

    const result = await pool.query(
      `UPDATE shifts
       SET user_id = COALESCE($1, user_id),
           date = COALESCE($2, date),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           position = COALESCE($5, position),
           location = COALESCE($6, location)
       WHERE shift_id = $7
       RETURNING *`,
      [userId, date, startTime, endTime, position, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({ message: 'Server error updating shift' });
  }
};

// Delete a shift (managers only)
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM shifts WHERE shift_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({ message: 'Server error deleting shift' });
  }
};

// Get all employees (for shift assignment dropdown)
exports.getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, role, position
       FROM users
       ORDER BY first_name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
};
