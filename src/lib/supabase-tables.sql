-- Create tables for the FitAI Calories Tracker app

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height DECIMAL NOT NULL,
  weight DECIMAL NOT NULL,
  goal TEXT CHECK (goal IN ('gain', 'loss', 'maintain')),
  target_weight DECIMAL,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very', 'extra')),
  diet_preference TEXT CHECK (diet_preference IN ('vegetarian', 'non-vegetarian', 'mixed')),
  workout_location TEXT CHECK (workout_location IN ('gym', 'home', 'outdoor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily food log table
CREATE TABLE IF NOT EXISTS daily_food_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories DECIMAL NOT NULL DEFAULT 0,
  protein DECIMAL DEFAULT 0,
  carbs DECIMAL DEFAULT 0,
  fat DECIMAL DEFAULT 0,
  quantity DECIMAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'serving',
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily workout log table
CREATE TABLE IF NOT EXISTS daily_workout_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  calories_burned DECIMAL NOT NULL DEFAULT 0,
  workout_type TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily water intake table
CREATE TABLE IF NOT EXISTS daily_water_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0, -- in ml
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversation logs table
CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_data JSONB NOT NULL,
  extracted_data JSONB,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_food_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_workout_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_water_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON daily_food_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON daily_workout_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON daily_water_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON conversation_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data" ON progress_log
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_food_log_user_date ON daily_food_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_workout_log_user_date ON daily_workout_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_water_log_user_date ON daily_water_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user_date ON conversation_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_log_user_date ON progress_log(user_id, date);