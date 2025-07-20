
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Utensils, Dumbbell, Target, Droplets, Mic, Settings, Trash2 } from "lucide-react";
import { SimpleMealTracker as EnhancedMealTracker } from "@/components/SimpleMealTracker";
import { AiCalorieGoalCalculator } from "@/components/AiCalorieGoalCalculator";
import { WaterIntakeTracker } from "@/components/WaterIntakeTracker";
import { VoiceInput } from "@/components/VoiceInput";
import { ConversationVoiceInput } from "@/components/ConversationVoiceInput";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import heroBanner from "@/assets/hero-banner.jpg";

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
  const { toast } = useToast();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showConversationVoice, setShowConversationVoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    const waterEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date().toISOString()
    };

    // Update local state
    setTodayData(prev => ({
      ...prev,
      waterEntries: [...prev.waterEntries, waterEntry]
    }));

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWaterLog') || '[]');
    const newLog = [...existingLog, waterEntry];
    localStorage.setItem('dailyWaterLog', JSON.stringify(newLog));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyWaterLog',
      newValue: JSON.stringify(newLog)
    }));
  };

  const handleVoiceFoodDetected = (food: { name: string; calories: number; quantity: number; unit: string }) => {
    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      quantity: food.quantity,
      unit: food.unit,
      mealType: 'snack',
      timestamp: new Date().toISOString()
    };

    handleCaloriesAdd(food.calories, foodItem);
  };

  const handleVoiceWorkoutDetected = (workout: { name: string; duration: number; calories: number }) => {
    const workoutItem: WorkoutItem = {
      id: Date.now().toString(),
      name: workout.name,
      duration: workout.duration,
      caloriesBurned: workout.calories,
      timestamp: new Date().toISOString()
    };

    handleWorkoutAdd(workoutItem);
  };

  const clearAllData = () => {
    localStorage.removeItem('dailyFoodLog');
    localStorage.removeItem('dailyWorkoutLog');
    localStorage.removeItem('dailyWaterLog');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('dailyMeals');
    
    setTodayData({
      foodItems: [],
      workoutItems: [],
      waterEntries: []
    });

    toast({
      title: "Data cleared! 🗑️",
      description: "All your data has been cleared successfully",
    });

    // Refresh the page to reset everything
    window.location.reload();
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
        {/* Hero Section with Background Image */}
        <div 
          className="relative mb-4 sm:mb-6 lg:mb-8 rounded-xl overflow-hidden shadow-xl"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '120px'
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <SidebarTrigger className="text-white" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-tight drop-shadow-lg">
                Welcome to FitAI Calories Tracker
              </h1>
              <p className="text-xs sm:text-sm text-gray-200 truncate drop-shadow-md">Your AI-powered fitness companion for {goalMessage}</p>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Enhanced Meal Tracker - View Only */}
          <div className="lg:col-span-2">
            <EnhancedMealTracker onCaloriesAdd={handleCaloriesAdd} />
          </div>
          
          {/* Right sidebar with smaller components */}
          <div className="space-y-3 sm:space-y-4">
            {/* AI Calorie Goal - Smaller Version */}
            <div className="scale-90 origin-top">
              <AiCalorieGoalCalculator onGoalCalculated={handleGoalCalculated} />
            </div>
            
            {/* Water Intake Tracker */}
            <WaterIntakeTracker onWaterAdd={handleWaterAdd} />
            
            {/* Settings Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 professional-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-700 text-sm">
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Button
                  onClick={clearAllData}
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs h-8"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {/* Mobile safe area padding */}
      <div className="h-20 mobile-safe"></div>

      {/* Voice Input Floating Button - Center Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <Button
            onClick={() => setShowConversationVoice(true)}
            className="relative h-16 w-16 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 transform hover:scale-110"
          >
            <Mic className="h-7 w-7" />
          </Button>
        </div>
      </div>

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <VoiceInput
          onClose={() => setShowVoiceInput(false)}
          onFoodDetected={handleVoiceFoodDetected}
          onWaterDetected={handleWaterAdd}
          onWorkoutDetected={handleVoiceWorkoutDetected}
        />
      )}

      {/* Conversation Voice Input Modal */}
      {showConversationVoice && (
        <ConversationVoiceInput
          onClose={() => setShowConversationVoice(false)}
          onDataSaved={(data) => {
            // Handle saved conversation data
            data.foods?.forEach((food: any) => handleVoiceFoodDetected(food));
            data.workouts?.forEach((workout: any) => handleVoiceWorkoutDetected(workout));
            data.water?.forEach((water: any) => handleWaterAdd(water.amount));
          }}
        />
      )}
    </div>
  );
};

export default Index;
