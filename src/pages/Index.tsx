
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Utensils, Dumbbell, Target, Droplets } from "lucide-react";
import { MealTracker } from "@/components/MealTracker";
import { AiWorkoutTracker } from "@/components/AiWorkoutTracker";
import { AiCalorieGoalCalculator } from "@/components/AiCalorieGoalCalculator";
import { WaterIntakeTracker } from "@/components/WaterIntakeTracker";
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

interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

const Index = () => {
  const { userProfile } = useUserProfile();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [todayData, setTodayData] = useState({
    foodItems: [] as FoodItem[],
    workoutItems: [] as WorkoutItem[],
    waterEntries: [] as WaterEntry[]
  });

  const today = new Date().toDateString();

  // Listen for storage changes to update data in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dailyFoodLog' || e.key === 'dailyWorkoutLog' || e.key === 'dailyWaterLog') {
        loadTodayData();
      }
    };

    const handleCustomStorageEvent = () => {
      loadTodayData();
    };

    const loadTodayData = () => {
      const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]')
        .filter((item: FoodItem) => new Date(item.timestamp).toDateString() === today);
      
      const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]')
        .filter((item: WorkoutItem) => new Date(item.timestamp).toDateString() === today);

      const waterLog = JSON.parse(localStorage.getItem('dailyWaterLog') || '[]')
        .filter((item: WaterEntry) => new Date(item.timestamp).toDateString() === today);

      setTodayData({
        foodItems: foodLog,
        workoutItems: workoutLog,
        waterEntries: waterLog
      });
    };

    loadTodayData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageEvent);
    };
  }, [today]);

  const handleGoalCalculated = (goal: number) => {
    setCalorieGoal(goal);
  };

  const handleCaloriesAdd = (calories: number, food: any) => {
    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories || 0,
      quantity: food.quantity || 1,
      unit: food.unit || 'serving',
      mealType: food.mealType || 'snack',
      timestamp: new Date().toISOString()
    };

    // Update local state
    setTodayData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, foodItem]
    }));

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const newLog = [...existingLog, foodItem];
    localStorage.setItem('dailyFoodLog', JSON.stringify(newLog));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyFoodLog',
      newValue: JSON.stringify(newLog)
    }));
  };

  const handleWorkoutAdd = (workout: any) => {
    const workoutItem: WorkoutItem = {
      id: Date.now().toString(),
      name: workout.name,
      duration: workout.duration || 0,
      caloriesBurned: workout.calories || 0,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setTodayData(prev => ({
      ...prev,
      workoutItems: [...prev.workoutItems, workoutItem]
    }));

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const newLog = [...existingLog, workoutItem];
    localStorage.setItem('dailyWorkoutLog', JSON.stringify(newLog));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyWorkoutLog',
      newValue: JSON.stringify(newLog)
    }));
  };

  const handleWaterAdd = (amount: number) => {
    // Water intake handled by WaterIntakeTracker component
  };

  // Fixed calculations to prevent NaN
  const totalCaloriesConsumed = todayData.foodItems.reduce((sum, item) => {
    const calories = typeof item.calories === 'number' && !isNaN(item.calories) ? item.calories : 0;
    return sum + calories;
  }, 0);

  const totalCaloriesBurned = todayData.workoutItems.reduce((sum, item) => {
    const calories = typeof item.caloriesBurned === 'number' && !isNaN(item.caloriesBurned) ? item.caloriesBurned : 0;
    return sum + calories;
  }, 0);

  const totalWaterIntake = todayData.waterEntries.reduce((sum, entry) => {
    const amount = typeof entry.amount === 'number' && !isNaN(entry.amount) ? entry.amount : 0;
    return sum + amount;
  }, 0);

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const safeNetCalories = isNaN(netCalories) ? 0 : netCalories;

  const goalMessage = userProfile?.goal === 'gain' ? 'Gaining Weight' : 
                     userProfile?.goal === 'loss' ? 'Losing Weight' : 'Maintaining Weight';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 lg:p-6 max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Welcome to FitTracker AI
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">Your AI-powered fitness companion for {goalMessage}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-green-700 text-xs sm:text-sm lg:text-base">
                <Utensils className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Calories In</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-600">{totalCaloriesConsumed}</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Today's intake</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-orange-700 text-xs sm:text-sm lg:text-base">
                <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Calories Out</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-orange-600">{totalCaloriesBurned}</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">From workouts</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-blue-700 text-xs sm:text-sm lg:text-base">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Net Calories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-blue-600">{safeNetCalories}</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Consumed - Burned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-purple-700 text-xs sm:text-sm lg:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Goal Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-purple-600">
                {userProfile?.goal === 'gain' ? '+' : userProfile?.goal === 'loss' ? '-' : '='} {Math.abs(safeNetCalories)}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Towards goal</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-cyan-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-cyan-700 text-xs sm:text-sm lg:text-base">
                <Droplets className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Water Intake</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-cyan-600">{totalWaterIntake}ml</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Today's hydration</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <AiCalorieGoalCalculator onGoalCalculated={handleGoalCalculated} />
          <WaterIntakeTracker onWaterAdd={handleWaterAdd} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <MealTracker onCaloriesAdd={handleCaloriesAdd} />
          <AiWorkoutTracker onWorkoutAdd={handleWorkoutAdd} />
        </div>
      </div>
    </div>
  );
};

export default Index;
