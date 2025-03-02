/*
  # Create scenarios schema

  1. New Tables
    - `scenarios`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text)
      - `description` (text)
      - `mitre_tactics` (text[])
      - `created_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
      - `live_execution` (jsonb)

    - `roles`
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, references scenarios)
      - `title` (text)
      - `department` (text)
      - `responsibilities` (text[])

    - `injects`
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, references scenarios)
      - `title` (text)
      - `description` (text)
      - `timing` (text)
      - `target_roles` (uuid[])

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own scenarios
*/

-- Create scenarios table
CREATE TABLE scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  description text,
  mitre_tactics text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  live_execution jsonb
);

-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES scenarios ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  department text NOT NULL,
  responsibilities text[] DEFAULT '{}'
);

-- Create injects table
CREATE TABLE injects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES scenarios ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  timing text NOT NULL,
  target_roles uuid[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE injects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own scenarios"
  ON scenarios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage roles for their scenarios"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scenarios
      WHERE scenarios.id = roles.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios
      WHERE scenarios.id = roles.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage injects for their scenarios"
  ON injects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scenarios
      WHERE scenarios.id = injects.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios
      WHERE scenarios.id = injects.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );