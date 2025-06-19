
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { EnhancedCalorieCounter } from "@/components/EnhancedCalorieCounter";
import { AiWorkoutTracker } from "@/components/AiWorkoutTracker";
import { AiCalorieGoalCalculator } from "@/components/AiCalorieGoalCalculator";
import { QuickStats } from "@/components/QuickStats";
import { PremiumSidebarTrigger } from "@/components/AppSidebar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Target, Activity, User, Utensils } from "lucide-react";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  date: string;
}

interface WorkoutItem {
  name: string;
  duration: number;
  calories: number;
  date: string;
}

interface DailyIntake {
  [date: string]: {
    foods: FoodItem[];
    totalCalories: number;
  };
}

interface DailyWorkouts {
  [date: string]: {
    workouts: WorkoutItem[];
    totalCaloriesBurned: number;
  };
}

const Index = () => {
  const { userProfile, updateProfile } = useUserProfile();
  const [dailyIntake, setDailyIntake] = useState<DailyIntake>({});
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkouts>({});
  const [calorieGoal, setCalorieGoal] = useState(2000);
  
  const today = new Date().toISOString().split('T')[0];
  const todayIntake = dailyIntake[today] || { foods: [], totalCalories: 0 };
  const todayWorkouts = dailyWorkouts[today] || { workouts: [], totalCaloriesBurned: 0 };
  
  const netCalories = todayIntake.totalCalories - todayWorkouts.totalCaloriesBurned;
  const calorieProgress = Math.max(0, (netCalories / calorieGoal) * 100);

  useEffect(() => {
    const storedIntake = localStorage.getItem('dailyIntake');
    const storedWorkouts = localStorage.getItem('dailyWorkouts');
    const storedGoal = localStorage.getItem('calorieGoal');
    
    if (storedIntake) {
      setDailyIntake(JSON.parse(storedIntake));
    }
    if (storedWorkouts) {
      setDailyWorkouts(JSON.parse(storedWorkouts));
    }
    if (storedGoal) {
      setCalorieGoal(parseInt(storedGoal));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyIntake', JSON.stringify(dailyIntake));
  }, [dailyIntake]);

  useEffect(() => {
    localStorage.setItem('dailyWorkouts', JSON.stringify(dailyWorkouts));
  }, [dailyWorkouts]);

  useEffect(() => {
    localStorage.setItem('calorieGoal', calorieGoal.toString());
  }, [calorieGoal]);

  const handleAddFood = (calories: number, food: FoodItem) => {
    setDailyIntake(prev => {
      const updated = { ...prev };
      if (!updated[today]) {
        updated[today] = { foods: [], totalCalories: 0 };
      }
      updated[today].foods.push(food);
      updated[today].totalCalories += calories;
      return updated;
    });
  };

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

  const handleGoalCalculated = (goal: number) => {
    setCalorieGoal(goal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <PremiumSidebarTrigger />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {userProfile?.name || 'User'}! 👋
                </h1>
                <p className="text-gray-600">AI-powered fitness tracking for your {userProfile?.goal === 'gain' ? 'weight gain' : userProfile?.goal === 'loss' ? 'weight loss' : 'weight maintenance'} journey</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Today's Goal</div>
                <div className="text-2xl font-bold text-purple-600">{calorieGoal} kcal</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickStats />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Daily Progress
              </CardTitle>
              <CardDescription>
                Calories: {todayIntake.totalCalories} consumed - {todayWorkouts.totalCaloriesBurned} burned = {netCalories} net
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={calorieProgress} className="mb-4" />
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Net Calories: {netCalories} kcal</span>
                <span>Remaining: {Math.max(0, calorieGoal - netCalories)} kcal</span>
              </div>
              
              {todayIntake.foods.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Today's Foods:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {todayIntake.foods.map((food, index) => (
                      <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                        <span>{food.name} ({food.quantity} {food.unit})</span>
                        <span className="text-blue-600 font-medium">{food.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayWorkouts.workouts.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Today's Workouts:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {todayWorkouts.workouts.map((workout, index) => (
                      <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                        <span>{workout.name} ({workout.duration} min)</span>
                        <span className="text-orange-600 font-medium">-{workout.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AiCalorieGoalCalculator onGoalCalculated={handleGoalCalculated} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedCalorieCounter onCaloriesAdd={handleAddFood} />
          <AiWorkoutTracker onWorkoutAdd={handleAddWorkout} />
        </div>
      </div>
    </div>
  );
};

export default Index;
