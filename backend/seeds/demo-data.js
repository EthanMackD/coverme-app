const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM approvals');
    await pool.query('DELETE FROM swap_claims');
    await pool.query('DELETE FROM swap_requests');
    await pool.query('DELETE FROM shifts');
    await pool.query('DELETE FROM users');

    console.log('Creating users...');
    const password = await bcrypt.hash('password123', 10);

    const users = [
      ['sarah.manager@coverme.com', password, 'Sarah', 'Collins', 'manager'],
      ['james.walker@coverme.com', password, 'James', 'Walker', 'employee'],
      ['emma.byrne@coverme.com', password, 'Emma', 'Byrne', 'employee'],
      ['liam.murphy@coverme.com', password, 'Liam', 'Murphy', 'employee'],
      ['chloe.kelly@coverme.com', password, 'Chloe', 'Kelly', 'employee'],
      ['ryan.odonoghue@coverme.com', password, 'Ryan', "O'Donoghue", 'employee'],
    ];

    const userIds = [];
    for (const u of users) {
      const res = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1,$2,$3,$4,$5) RETURNING user_id',
        u
      );
      userIds.push(res.rows[0].user_id);
    }

    const [sarah, james, emma, liam, chloe, ryan] = userIds;

    console.log('Creating shifts...');
    const today = new Date();
    const d = (offset) => {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      return date.toISOString().split('T')[0];
    };

    const shifts = [
      // Today
      [james, d(0), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [emma, d(0), '10:00', '18:00', 'Floor Staff', 'Main Floor'],
      [liam, d(0), '12:00', '20:00', 'Stock Room', 'Warehouse'],
      [chloe, d(0), '08:00', '16:00', 'Customer Service', 'Front Desk'],
      // Tomorrow
      [ryan, d(1), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [james, d(1), '12:00', '20:00', 'Floor Staff', 'Main Floor'],
      [emma, d(1), '08:00', '16:00', 'Stock Room', 'Warehouse'],
      // Day after
      [liam, d(2), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [chloe, d(2), '10:00', '18:00', 'Floor Staff', 'Main Floor'],
      [ryan, d(2), '12:00', '20:00', 'Customer Service', 'Front Desk'],
      // +3 days
      [james, d(3), '08:00', '16:00', 'Stock Room', 'Warehouse'],
      [emma, d(3), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [liam, d(3), '10:00', '18:00', 'Floor Staff', 'Main Floor'],
      // +4 days
      [chloe, d(4), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [ryan, d(4), '08:00', '16:00', 'Floor Staff', 'Main Floor'],
      [james, d(4), '12:00', '20:00', 'Customer Service', 'Front Desk'],
      // +5 days
      [emma, d(5), '09:00', '17:00', 'Stock Room', 'Warehouse'],
      [liam, d(5), '08:00', '16:00', 'Cashier', 'Main Floor'],
      [chloe, d(5), '10:00', '18:00', 'Floor Staff', 'Main Floor'],
      // +6 days
      [ryan, d(6), '09:00', '17:00', 'Cashier', 'Main Floor'],
      [james, d(6), '10:00', '18:00', 'Floor Staff', 'Main Floor'],
    ];

    const shiftIds = [];
    for (const s of shifts) {
      const res = await pool.query(
        'INSERT INTO shifts (user_id, date, start_time, end_time, position, location) VALUES ($1,$2,$3,$4,$5,$6) RETURNING shift_id',
        s
      );
      shiftIds.push(res.rows[0].shift_id);
    }

    console.log('Creating swap requests...');
    // James wants tomorrow's shift covered
    const swap1 = await pool.query(
      "INSERT INTO swap_requests (shift_id, requesting_user_id, reason, status) VALUES ($1,$2,$3,'open') RETURNING request_id",
      [shiftIds[5], james, 'Doctor appointment in the afternoon']
    );

    // Emma wants day-after-tomorrow covered
    const swap2 = await pool.query(
      "INSERT INTO swap_requests (shift_id, requesting_user_id, reason, status) VALUES ($1,$2,$3,'open') RETURNING request_id",
      [shiftIds[6], emma, 'Family event']
    );

    // Liam's shift in 3 days - claimed by Ryan, waiting approval
    const swap3 = await pool.query(
      "INSERT INTO swap_requests (shift_id, requesting_user_id, reason, status) VALUES ($1,$2,$3,'claimed') RETURNING request_id",
      [shiftIds[12], liam, 'Need to study for exam']
    );
    await pool.query(
      'INSERT INTO swap_claims (request_id, claiming_user_id) VALUES ($1,$2)',
      [swap3.rows[0].request_id, chloe]
    );

    // Chloe's shift in 4 days - claimed by Emma, waiting approval
    const swap4 = await pool.query(
      "INSERT INTO swap_requests (shift_id, requesting_user_id, reason, status) VALUES ($1,$2,$3,'claimed') RETURNING request_id",
      [shiftIds[13], chloe, 'Car broke down, need repair day']
    );
    await pool.query(
      'INSERT INTO swap_claims (request_id, claiming_user_id) VALUES ($1,$2)',
      [swap4.rows[0].request_id, emma]
    );

    console.log('\n=== SEED COMPLETE ===');
    console.log('All passwords: password123');
    console.log('\nManager login:  sarah.manager@coverme.com');
    console.log('Employee logins:');
    console.log('  james.walker@coverme.com');
    console.log('  emma.byrne@coverme.com');
    console.log('  liam.barrett@coverme.com');
    console.log('  chloe.kelly@coverme.com');
    console.log('  ryan.murphy@coverme.com');
    console.log('\nDemo state:');
    console.log('  - 21 shifts across 7 days');
    console.log('  - 2 open swap requests (James, Emma)');
    console.log('  - 2 pending approvals for manager (Liam->Chloe, Chloe->Emma)');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();