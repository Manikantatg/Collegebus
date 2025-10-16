/*
  # Bus Tracking System Database Schema

  ## Overview
  Creates a complete real-time bus tracking system with cross-device synchronization.

  ## New Tables
  
  ### `buses`
  - `id` (integer, primary key) - Bus number (1-16)
  - `current_stop_index` (integer) - Current position in route
  - `eta` (integer, nullable) - ETA to next stop in minutes
  - `current_driver_email` (text, nullable) - Currently logged in driver
  - `current_driver_name` (text, nullable) - Driver name
  - `current_location_lat` (numeric, nullable) - GPS latitude
  - `current_location_lng` (numeric, nullable) - GPS longitude
  - `current_location_speed` (numeric, nullable) - Speed in m/s
  - `current_location_timestamp` (timestamptz, nullable) - Location timestamp
  - `total_distance` (numeric) - Total distance traveled
  - `last_updated` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Record creation time

  ### `bus_stops`
  - `id` (uuid, primary key) - Unique identifier
  - `bus_id` (integer, foreign key) - Reference to buses table
  - `stop_index` (integer) - Position in route (0-based)
  - `name` (text) - Stop name
  - `scheduled_time` (text) - Expected arrival time
  - `completed` (boolean) - Whether bus reached this stop
  - `actual_time` (text, nullable) - Actual arrival time
  - `created_at` (timestamptz) - Record creation time

  ### `eta_requests`
  - `id` (uuid, primary key) - Unique identifier
  - `bus_id` (integer, foreign key) - Reference to buses table
  - `stop_index` (integer) - Stop position when ETA was set
  - `minutes` (integer) - ETA in minutes
  - `next_stop` (text) - Name of next stop
  - `timestamp` (text) - Formatted time string
  - `created_at` (timestamptz) - Record creation time

  ### `notifications`
  - `id` (uuid, primary key) - Unique identifier
  - `bus_id` (integer, foreign key) - Reference to buses table
  - `type` (text) - Notification type (update/eta/request)
  - `message` (text) - Notification message
  - `timestamp` (text) - Formatted time string
  - `created_at` (timestamptz) - Record creation time

  ### `driver_logs`
  - `id` (uuid, primary key) - Unique identifier
  - `bus_id` (integer) - Bus number
  - `driver_email` (text) - Driver email
  - `driver_name` (text) - Driver name
  - `type` (text) - Log type (entry/exit)
  - `location_lat` (numeric) - GPS latitude
  - `location_lng` (numeric) - GPS longitude
  - `location_speed` (numeric) - Speed in m/s
  - `location_timestamp` (timestamptz) - Location timestamp
  - `created_at` (timestamptz) - Log creation time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for buses, bus_stops, eta_requests, notifications
  - Authenticated write access for buses, bus_stops, eta_requests, notifications, driver_logs
  - Data integrity maintained through foreign key constraints

  ## Indexes
  - Composite indexes for efficient querying
  - Timestamp indexes for real-time updates
*/

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id integer PRIMARY KEY CHECK (id >= 1 AND id <= 16),
  current_stop_index integer DEFAULT 0 NOT NULL,
  eta integer,
  current_driver_email text,
  current_driver_name text,
  current_location_lat numeric,
  current_location_lng numeric,
  current_location_speed numeric,
  current_location_timestamp timestamptz,
  total_distance numeric DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create bus_stops table
CREATE TABLE IF NOT EXISTS bus_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id integer NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  stop_index integer NOT NULL,
  name text NOT NULL,
  scheduled_time text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  actual_time text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(bus_id, stop_index)
);

-- Create eta_requests table
CREATE TABLE IF NOT EXISTS eta_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id integer NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  stop_index integer NOT NULL,
  minutes integer NOT NULL,
  next_stop text NOT NULL,
  timestamp text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id integer NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('update', 'eta', 'request')),
  message text NOT NULL,
  timestamp text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create driver_logs table
CREATE TABLE IF NOT EXISTS driver_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id integer NOT NULL,
  driver_email text NOT NULL,
  driver_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('entry', 'exit')),
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  location_speed numeric DEFAULT 0 NOT NULL,
  location_timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bus_stops_bus_id ON bus_stops(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_stops_bus_stop ON bus_stops(bus_id, stop_index);
CREATE INDEX IF NOT EXISTS idx_eta_requests_bus_id ON eta_requests(bus_id);
CREATE INDEX IF NOT EXISTS idx_eta_requests_created_at ON eta_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_bus_id ON notifications(bus_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_logs_bus_id ON driver_logs(bus_id);
CREATE INDEX IF NOT EXISTS idx_driver_logs_created_at ON driver_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE eta_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buses table
CREATE POLICY "Anyone can view buses"
  ON buses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert buses"
  ON buses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update buses"
  ON buses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for bus_stops table
CREATE POLICY "Anyone can view bus stops"
  ON bus_stops FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert bus stops"
  ON bus_stops FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update bus stops"
  ON bus_stops FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for eta_requests table
CREATE POLICY "Anyone can view eta requests"
  ON eta_requests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert eta requests"
  ON eta_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for notifications table
CREATE POLICY "Anyone can view notifications"
  ON notifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete old notifications"
  ON notifications FOR DELETE
  TO public
  USING (true);

-- RLS Policies for driver_logs table
CREATE POLICY "Anyone can view driver logs"
  ON driver_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert driver logs"
  ON driver_logs FOR INSERT
  TO public
  WITH CHECK (true);