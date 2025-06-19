
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiWorkoutTracker } from "@/components/AiWorkoutTracker";
import { Dumbbell, Clock, Target } from "lucide-react";

interface WorkoutItem {
  name: string;
  duration: number;
  calories: number;
  date: string;
}

interface DailyWorkouts {
  [date: string]: {
    workouts: WorkoutItem[];
    totalCaloriesBurned: number;
  };
}

const Workouts = () => {
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkouts>({});
  
  const today = new Date().toISOString().split('T')[0];
  const todayWorkouts = dailyWorkouts[today] || { workouts: [], totalCaloriesBurned: 0 };
  
  const allWorkouts = Object.values(dailyWorkouts).flatMap(day => day.workouts);
  const totalWeekCalories = allWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalWeekTime = allWorkouts.reduce((sum, w) => sum + w.duration, 0);

  useEffect(() => {
    const stored = localStorage.getItem('dailyWorkouts');
    if (stored) {
      setDailyWorkouts(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyWorkouts', JSON.stringify(dailyWorkouts));
  }, [dailyWorkouts]);

  const handleAddWorkout = (workout: WorkoutItem) => {
    setDailyWorkouts(prev => {
      const updated = { ...prev };
      if (!updated[today]) {
        updated[today] = { workouts: [], totalCaloriesBurned: 0 };
      }
      updated[today].workouts.push(workout);
      updated[today].totalCaloriesBurned += workout.calories;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              AI Workout Tracker
            </h1>
            <p className="text-gray-600">Track exercises with AI-powered calorie calculation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Dumbbell className="w-5 h-5" />
                Today's Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {todayWorkouts.workouts.length}
              </div>
              <p className="text-sm text-gray-600">Sessions completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Clock className="w-5 h-5" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalWeekTime} min
              </div>
              <p className="text-sm text-gray-600">Total this week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Target className="w-5 h-5" />
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {totalWeekCalories}
              </div>
              <p className="text-sm text-gray-600">Total this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiWorkoutTracker onWorkoutAdd={handleAddWorkout} />

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>
                Your AI-analyzed workout history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allWorkouts.slice(-10).reverse().map((workout, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{workout.name}</h4>
                      <p className="text-sm text-gray-600">
                        {workout.duration} min • {workout.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 font-semibold">{workout.calories}</span>
                      <p className="text-xs text-gray-500">calories burned</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {allWorkouts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No workouts logged yet</p>
                  <p className="text-sm">Add your first workout to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
