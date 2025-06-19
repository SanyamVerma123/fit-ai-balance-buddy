
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { EnhancedCalorieCounter } from "@/components/EnhancedCalorieCounter";
import { QuickStats } from "@/components/QuickStats";
import { PremiumSidebarTrigger } from "@/components/AppSidebar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Target, Activity, User } from "lucide-react";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  date: string;
}

interface DailyIntake {
  [date: string]: {
    foods: FoodItem[];
    totalCalories: number;
  };
}

const Index = () => {
  const { userProfile, updateProfile } = useUserProfile();
  const [dailyIntake, setDailyIntake] = useState<DailyIntake>({});
  const [calorieGoal, setCalorieGoal] = useState(2000);
  
  const today = new Date().toISOString().split('T')[0];
  const todayIntake = dailyIntake[today] || { foods: [], totalCalories: 0 };
  const calorieProgress = (todayIntake.totalCalories / calorieGoal) * 100;

  useEffect(() => {
    const stored = localStorage.getItem('dailyIntake');
    if (stored) {
      setDailyIntake(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyIntake', JSON.stringify(dailyIntake));
  }, [dailyIntake]);

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
                <p className="text-gray-600">Track your calories and achieve your {userProfile?.goal === 'gain' ? 'weight gain' : userProfile?.goal === 'loss' ? 'weight loss' : 'weight maintenance'} goals</p>
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
                Daily Calorie Progress
              </CardTitle>
              <CardDescription>
                {todayIntake.totalCalories} / {calorieGoal} calories consumed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={calorieProgress} className="mb-4" />
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Consumed: {todayIntake.totalCalories} kcal</span>
                <span>Remaining: {Math.max(0, calorieGoal - todayIntake.totalCalories)} kcal</span>
              </div>
              {todayIntake.foods.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Today's Foods:</h4>
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
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Height:</span>
                  <div className="font-medium">{userProfile?.height} cm</div>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <div className="font-medium">{userProfile?.weight} kg</div>
                </div>
                <div>
                  <span className="text-gray-600">Goal:</span>
                  <div className="font-medium capitalize">{userProfile?.goal} weight</div>
                </div>
                <div>
                  <span className="text-gray-600">Target:</span>
                  <div className="font-medium">{userProfile?.targetWeight} kg</div>
                </div>
              </div>
              <div>
                <Label htmlFor="goal">Daily Calorie Goal</Label>
                <Input
                  id="goal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  placeholder="2000"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <EnhancedCalorieCounter onCaloriesAdd={handleAddFood} />
        </div>
      </div>
    </div>
  );
};

export default Index;
