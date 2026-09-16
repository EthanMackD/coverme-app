const pool = require('../config/db');

// Create a swap request for one of my shifts
exports.createSwapRequest = async (req, res) => {
  try {
    const { shiftId, reason } = req.body;

    if (!shiftId) {
      return res.status(400).json({ message: 'shiftId is required' });
    }

    // Verify the shift belongs to the requesting user
    const shift = await pool.query(
      'SELECT * FROM shifts WHERE shift_id = $1 AND user_id = $2',
      [shiftId, req.user.userId]
    );

    if (shift.rows.length === 0) {
      return res.status(404).json({ message: 'Shift not found or does not belong to you' });
    }

    // Check for existing open request on this shift
    const existing = await pool.query(
      "SELECT * FROM swap_requests WHERE shift_id = $1 AND status IN ('open', 'claimed')",
      [shiftId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An active swap request already exists for this shift' });
    }

    const result = await pool.query(
      `INSERT INTO swap_requests (shift_id, requesting_user_id, reason)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [shiftId, req.user.userId, reason || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
};

// Get all open swap requests (for employees to browse)
exports.getOpenSwapRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sr.*, s.date, s.start_time, s.end_time, s.position, s.location,
              u.first_name, u.last_name
       FROM swap_requests sr
       JOIN shifts s ON sr.shift_id = s.shift_id
       JOIN users u ON sr.requesting_user_id = u.user_id
       WHERE sr.status = 'open' AND sr.requesting_user_id != $1
       ORDER BY s.date ASC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get open swaps error:', error);
    res.status(500).json({ message: 'Server error fetching swap requests' });
  }
};

// Get my swap requests
exports.getMySwapRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sr.*, s.date, s.start_time, s.end_time, s.position, s.location
       FROM swap_requests sr
       JOIN shifts s ON sr.shift_id = s.shift_id
       WHERE sr.requesting_user_id = $1
       ORDER BY sr.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my swaps error:', error);
    res.status(500).json({ message: 'Server error fetching your swap requests' });
  }
};

// Claim a swap request
exports.claimSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the swap request is open
    const swapReq = await pool.query(
      'SELECT * FROM swap_requests WHERE request_id = $1',
      [id]
    );

    if (swapReq.rows.length === 0) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swapReq.rows[0].status !== 'open') {
      return res.status(400).json({ message: 'This swap request is no longer open' });
    }

    if (swapReq.rows[0].requesting_user_id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot claim your own swap request' });
    }

    // Create the claim
    await pool.query(
      `INSERT INTO swap_claims (request_id, claiming_user_id)
       VALUES ($1, $2)`,
      [id, req.user.userId]
    );

    // Update status to claimed
    const result = await pool.query(
      "UPDATE swap_requests SET status = 'claimed' WHERE request_id = $1 RETURNING *",
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Claim swap error:', error);
    res.status(500).json({ message: 'Server error claiming swap request' });
  }
};

// Cancel my swap request
exports.cancelSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE swap_requests SET status = 'cancelled' WHERE request_id = $1 AND requesting_user_id = $2 AND status IN ('open', 'claimed') RETURNING *",
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Swap request not found or cannot be cancelled' });
    }

    res.json({ message: 'Swap request cancelled', request: result.rows[0] });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ message: 'Server error cancelling swap request' });
  }
};

// Approve/deny a swap (managers only)
exports.approveSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ message: 'approved (boolean) is required' });
    }

    // Get the swap request and its claim
    const swapReq = await pool.query(
      'SELECT * FROM swap_requests WHERE request_id = $1',
      [id]
    );

    if (swapReq.rows.length === 0) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swapReq.rows[0].status !== 'claimed') {
      return res.status(400).json({ message: 'Swap request must be claimed before approval' });
    }

    const claim = await pool.query(
    'SELECT * FROM swap_claims WHERE request_id = $1 ORDER BY claimed_at DESC LIMIT 1',      [id]
    );

    if (claim.rows.length === 0) {
      return res.status(400).json({ message: 'No claim found for this swap request' });
    }

    // Record the approval
    await pool.query(
      `INSERT INTO approvals (request_id, claim_id, manager_id, approved)
       VALUES ($1, $2, $3, $4)`,
      [id, claim.rows[0].claim_id, req.user.userId, approved]
    );

    // Update swap request status
    const newStatus = approved ? 'approved' : 'denied';
    await pool.query(
      'UPDATE swap_requests SET status = $1 WHERE request_id = $2',
      [newStatus, id]
    );

    // If approved, reassign the shift to the claiming user
    if (approved) {
      await pool.query(
        'UPDATE shifts SET user_id = $1 WHERE shift_id = $2',
        [claim.rows[0].claiming_user_id, swapReq.rows[0].shift_id]
      );
    }

    res.json({ message: `Swap request ${newStatus}` });
  } catch (error) {
    console.error('Approve swap error:', error);
    res.status(500).json({ message: 'Server error processing approval' });
  }
};

// Get all pending swaps for manager approval
exports.getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sr.*, s.date, s.start_time, s.end_time, s.position, s.location,
              req_u.first_name AS requester_first, req_u.last_name AS requester_last,
              claim_u.first_name AS claimer_first, claim_u.last_name AS claimer_last
       FROM swap_requests sr
       JOIN shifts s ON sr.shift_id = s.shift_id
       JOIN users req_u ON sr.requesting_user_id = req_u.user_id
       JOIN swap_claims sc ON sr.request_id = sc.request_id
       JOIN users claim_u ON sc.claiming_user_id = claim_u.user_id
       WHERE sr.status = 'claimed'
       ORDER BY s.date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Server error fetching pending approvals' });
  }
};
