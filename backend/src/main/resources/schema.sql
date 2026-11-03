CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(80),
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(100),
  role VARCHAR(16) NOT NULL DEFAULT 'user',
  image VARCHAR(500),
  google_subject VARCHAR(255) UNIQUE,
  fitness_profile JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  goal VARCHAR(40) NOT NULL,
  level VARCHAR(24) NOT NULL,
  workout_type VARCHAR(24) NOT NULL,
  equipment VARCHAR(32) NOT NULL,
  plan_data JSON NOT NULL,
  profile_data JSON NOT NULL,
  progress JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_user_created (user_id, created_at),
  CONSTRAINT fk_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_records (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  date_value VARCHAR(30) NOT NULL,
  weight VARCHAR(12) NOT NULL,
  bmi DECIMAL(5,1) NOT NULL,
  measurements JSON NOT NULL,
  completed_workouts INT NOT NULL DEFAULT 0,
  notes VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_progress_user_date (user_id, date_value, created_at),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
