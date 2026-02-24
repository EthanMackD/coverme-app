-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE positions (
  position_id SERIAL PRIMARY KEY,
  position_name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Shifts table
CREATE TABLE shifts (
  shift_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position_id INTEGER REFERENCES positions(position_id),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap requests table
CREATE TABLE swap_requests (
  request_id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(shift_id),
  requesting_user_id INTEGER REFERENCES users(user_id),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'approved', 'denied', 'cancelled')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap claims table
CREATE TABLE swap_claims (
  claim_id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES swap_requests(request_id),
  claiming_user_id INTEGER REFERENCES users(user_id),
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approvals table
CREATE TABLE approvals (
  approval_id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES swap_requests(request_id),
  claim_id INTEGER REFERENCES swap_claims(claim_id),
  manager_id INTEGER REFERENCES users(user_id),
  approved BOOLEAN,
  response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Employee availability table
CREATE TABLE employee_availability (
  availability_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  available_start TIME,
  available_end TIME
);

-- Notifications table
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  request_id INTEGER REFERENCES swap_requests(request_id),
  notification_type VARCHAR(100),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
