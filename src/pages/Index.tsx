
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Utensils, Activity, Award, Calendar } from "lucide-react";
import { PremiumSidebarTrigger } from "@/components/AppSidebar";
import { MealTracker } from "@/components/MealTracker";
import { AiCalorieGoalCalculator } from "@/components/AiCalorieGoalCalculator";
import { AiWorkoutTracker } from "@/components/AiWorkoutTracker";
import { useUserProfile } from "@/hooks/useUserProfile";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  mealType: string;
  date: string;
  time: string;
}

interface WorkoutItem {
  name: string;
  duration: number;
  calories: number;
  date: string;
  sets?: number;
  reps?: number;
  weight?: number;
  location: string;
}

interface DailyData {
  [date: string]: {
    totalCalories: number;
    foods: FoodItem[];
    workouts: WorkoutItem[];
    caloriesBurned: number;
  };
}

const Index = () => {
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const { userProfile } = useUserProfile();

  const today = new Date().toISOString().split('T')[0];
  const todayData = dailyData[today] || { 
    totalCalories: 0, 
    foods: [], 
    workouts: [], 
    caloriesBurned: 0 
  };

  useEffect(() => {
    const stored = localStorage.getItem('dailyData');
    if (stored) {
      setDailyData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
  }, [dailyData]);

  const handleCaloriesAdd = (calories: number, food: FoodItem) => {
    setDailyData(prev => {
      const updated = { ...prev };
      if (!updated[today]) {
        updated[today] = { totalCalories: 0, foods: [], workouts: [], caloriesBurned: 0 };
      }
      updated[today].totalCalories += calories;
      updated[today].foods.push(food);
      return updated;
    });
  };

  const handleWorkoutAdd = (workout: WorkoutItem) => {
    setDailyData(prev => {
      const updated = { ...prev };
      if (!updated[today]) {
        updated[today] = { totalCalories: 0, foods: [], workouts: [], caloriesBurned: 0 };
      }
      updated[today].workouts.push(workout);
      updated[today].caloriesBurned += workout.calories;
      return updated;
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getStreakDays = () => {
    const dates = Object.keys(dailyData).sort().reverse();
    let streak = 0;
    for (const date of dates) {
      if (dailyData[date].totalCalories > 0 || dailyData[date].workouts.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calorieProgress = Math.min((todayData.totalCalories / calorieGoal) * 100, 100);
  const netCalories = todayData.totalCalories - todayData.caloriesBurned;

  const getGoalMessage = () => {
    switch (userProfile?.goal) {
      case 'gain':
        return 'Building muscle and gaining weight healthily';
      case 'loss':
        return 'Burning calories and losing weight safely';
      case 'maintain':
        return 'Maintaining current weight and staying fit';
      default:
        return 'Track your nutrition and fitness journey';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <PremiumSidebarTrigger />
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getGreeting()}{userProfile?.name ? `, ${userProfile.name}!` : '!'}
            </h1>
            <p className="text-gray-600">{getGoalMessage()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                <Target className="w-5 h-5" />
                Calories Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {todayData.totalCalories}
                  </span>
                  <span className="text-sm text-gray-500">/ {calorieGoal}</span>
                </div>
                <Progress value={calorieProgress} className="h-2" />
                <p className="text-xs text-gray-600">
                  {calorieGoal - todayData.totalCalories > 0 
                    ? `${calorieGoal - todayData.totalCalories} kcal remaining`
                    : 'Goal reached!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                <Utensils className="w-5 h-5" />
                Meals Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {todayData.foods.length}
              </div>
              <div className="space-y-1">
                {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => {
                  const mealCount = todayData.foods.filter(f => f.mealType === mealType).length;
                  return mealCount > 0 ? (
                    <Badge key={mealType} variant="secondary" className="mr-1 text-xs">
                      {mealType}: {mealCount}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                <Activity className="w-5 h-5" />
                Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {todayData.workouts.length}
              </div>
              <p className="text-sm text-gray-600">
                {todayData.caloriesBurned} kcal burned
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
                <Award className="w-5 h-5" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {getStreakDays()}
              </div>
              <p className="text-sm text-gray-600">
                {getStreakDays() === 1 ? 'day' : 'days'} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Net Calories Info */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Net Calories</h3>
                <p className="text-sm text-gray-600">Consumed - Burned = Net intake</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {netCalories} kcal
                </div>
                <p className="text-sm text-gray-500">
                  {todayData.totalCalories} - {todayData.caloriesBurned}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tracking Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MealTracker onCaloriesAdd={handleCaloriesAdd} />
          <AiWorkoutTracker onWorkoutAdd={handleWorkoutAdd} />
        </div>

        {/* AI Calorie Goal Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiCalorieGoalCalculator onGoalCalculated={setCalorieGoal} />
          
          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest meals and workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...todayData.foods, ...todayData.workouts]
                  .sort((a, b) => new Date(a.time || a.date).getTime() - new Date(b.time || b.date).getTime())
                  .slice(-5)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {'mealType' in item ? `${item.mealType} • ${item.quantity} ${item.unit}` : `Workout • ${item.duration} min`}
                        </p>
                      </div>
                      <Badge variant="outline">{item.calories} kcal</Badge>
                    </div>
                  ))}
                
                {todayData.foods.length === 0 && todayData.workouts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No activity yet today</p>
                    <p className="text-sm">Start tracking your meals and workouts!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
