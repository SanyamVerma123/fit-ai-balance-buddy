import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Utensils, Dumbbell, Target } from "lucide-react";
import { MealTracker } from "@/components/MealTracker";
import { AiWorkoutTracker } from "@/components/AiWorkoutTracker";
import { AiCalorieGoalCalculator } from "@/components/AiCalorieGoalCalculator";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect } from "react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
  mealType: string;
  timestamp: string;
}

interface WorkoutItem {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  timestamp: string;
}

const Index = () => {
  const { userProfile } = useUserProfile();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [todayData, setTodayData] = useState({
    foodItems: [] as FoodItem[],
    workoutItems: [] as WorkoutItem[]
  });

  const today = new Date().toDateString();

  useEffect(() => {
    // Load today's data from localStorage
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]')
      .filter((item: FoodItem) => new Date(item.timestamp).toDateString() === today);
    
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]')
      .filter((item: WorkoutItem) => new Date(item.timestamp).toDateString() === today);

    setTodayData({
      foodItems: foodLog,
      workoutItems: workoutLog
    });
  }, [today]);

  const handleGoalCalculated = (goal: number) => {
    setCalorieGoal(goal);
  };

  const handleCaloriesAdd = (calories: number, food: any) => {
    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      quantity: food.quantity,
      unit: food.unit,
      mealType: food.mealType,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setTodayData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, foodItem]
    }));

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    localStorage.setItem('dailyFoodLog', JSON.stringify([...existingLog, foodItem]));
  };

  const handleWorkoutAdd = (workout: any) => {
    const workoutItem: WorkoutItem = {
      id: Date.now().toString(),
      name: workout.name,
      duration: workout.duration,
      caloriesBurned: workout.calories,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setTodayData(prev => ({
      ...prev,
      workoutItems: [...prev.workoutItems, workoutItem]
    }));

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    localStorage.setItem('dailyWorkoutLog', JSON.stringify([...existingLog, workoutItem]));
  };

  const totalCaloriesConsumed = todayData.foodItems.reduce((sum, item) => sum + item.calories, 0);
  const totalCaloriesBurned = todayData.workoutItems.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  const goalMessage = userProfile?.goal === 'gain' ? 'Gaining Weight' : 
                     userProfile?.goal === 'loss' ? 'Losing Weight' : 'Maintaining Weight';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to FitTracker AI
            </h1>
            <p className="text-gray-600">Your AI-powered fitness companion for {goalMessage}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Utensils className="w-5 h-5" />
                Calories Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCaloriesConsumed}</div>
              <p className="text-sm text-gray-600">Today's intake</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Dumbbell className="w-5 h-5" />
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalCaloriesBurned}</div>
              <p className="text-sm text-gray-600">From workouts</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="w-5 h-5" />
                Net Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{netCalories}</div>
              <p className="text-sm text-gray-600">Consumed - Burned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {userProfile?.goal === 'gain' ? '+' : userProfile?.goal === 'loss' ? '-' : '='} {Math.abs(netCalories)}
              </div>
              <p className="text-sm text-gray-600">Towards goal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AiCalorieGoalCalculator onGoalCalculated={handleGoalCalculated} />
          <MealTracker onCaloriesAdd={handleCaloriesAdd} />
        </div>

        <AiWorkoutTracker onWorkoutAdd={handleWorkoutAdd} />
      </div>
    </div>
  );
};

export default Index;
