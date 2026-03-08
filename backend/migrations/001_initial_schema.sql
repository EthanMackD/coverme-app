-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    position VARCHAR(100),
    location VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE shifts (
    shift_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    position VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap requests table
CREATE TABLE swap_requests (
    request_id SERIAL PRIMARY KEY,
    shift_id INTEGER REFERENCES shifts(shift_id),
    requesting_user_id INTEGER REFERENCES users(user_id),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'approved', 'denied', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap claims table
CREATE TABLE swap_claims (
    claim_id SERIAL PRIMARY KEY,
    swap_request_id INTEGER REFERENCES swap_requests(request_id),
    claiming_user_id INTEGER REFERENCES users(user_id),
    claim_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approvals table
CREATE TABLE approvals (
    approval_id SERIAL PRIMARY KEY,
    swap_request_id INTEGER REFERENCES swap_requests(request_id),
    claiming_user_id INTEGER REFERENCES users(user_id),
    manager_id INTEGER REFERENCES users(user_id),
    approved BOOLEAN,
    response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee availability table
CREATE TABLE employee_availability (
    availability_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    available_start TIME,
    available_end TIME
);

-- Positions table
CREATE TABLE positions (
    position_id SERIAL PRIMARY KEY,
    position_name VARCHAR(100) UNIQUE NOT NULL,
    required_certifications TEXT
);

-- Notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    swap_request_id INTEGER REFERENCES swap_requests(request_id),
    notification_type VARCHAR(50) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
