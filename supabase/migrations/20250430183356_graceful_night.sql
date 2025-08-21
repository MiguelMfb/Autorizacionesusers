/*
  # Add services schema for authorizations

  1. New Tables
    - `services` - Stores individual service records
      - `id` (uuid, primary key)
      - `authorization_id` (uuid, foreign key)
      - `service_date` (date)
      - `service_type` (text)
      - `origin` (text)
      - `destination` (text) 
      - `vehicle_type` (text)
      - `driver_name` (text)
      - `driver_id` (text)
      - `vehicle_plate` (text)
      - `observations` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on services table
    - Add policies for authenticated users to manage their services
    
  3. Changes
    - Add foreign key constraint to link services to authorizations
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  authorization_id uuid NOT NULL REFERENCES authorizations(id) ON DELETE CASCADE,
  service_date date NOT NULL,
  service_type text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  vehicle_type text NOT NULL,
  driver_name text NOT NULL,
  driver_id text NOT NULL,
  vehicle_plate text NOT NULL,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint to ensure service_date falls within authorization period
  CONSTRAINT services_date_within_authorization_period CHECK (
    service_date >= (SELECT fecha_inicio_vigencia FROM authorizations WHERE id = authorization_id) AND
    service_date <= (SELECT fecha_fin_vigencia FROM authorizations WHERE id = authorization_id)
  )
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view their own services" ON services
  FOR SELECT 
  TO authenticated
  USING (
    authorization_id IN (
      SELECT id FROM authorizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own services" ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authorization_id IN (
      SELECT id FROM authorizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own services" ON services
  FOR UPDATE
  TO authenticated
  USING (
    authorization_id IN (
      SELECT id FROM authorizations 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    authorization_id IN (
      SELECT id FROM authorizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own services" ON services
  FOR DELETE
  TO authenticated
  USING (
    authorization_id IN (
      SELECT id FROM authorizations 
      WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on authorization_id for better query performance
CREATE INDEX services_authorization_id_idx ON services(authorization_id);