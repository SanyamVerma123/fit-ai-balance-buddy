import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Camera, Brain, Clock, Send, X, Check, Sparkles, ChefHat, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { WeeklyChart, NutritionPieChart } from "@/components/WeeklyChart";
import foodBanner from "@/assets/food-banner.jpg";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: string;
  date: string;
  time: string;
}

interface EnhancedMealTrackerProps {
  onCaloriesAdd: (calories: number, food: FoodItem) => void;
}

interface SuggestedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'snacks', label: 'Snacks', icon: '🍎' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
];

export const EnhancedMealTracker = ({ onCaloriesAdd }: EnhancedMealTrackerProps) => {
  const [dailyMeals, setDailyMeals] = useState<{[key: string]: FoodItem[]}>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storedDaily = localStorage.getItem('dailyMeals');
    if (storedDaily) {
      setDailyMeals(JSON.parse(storedDaily));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyMeals', JSON.stringify(dailyMeals));
  }, [dailyMeals]);

  const deleteFoodItem = (mealType: string, index: number) => {
    setDailyMeals(prev => ({
      ...prev,
      [today]: prev[today]?.filter((_, i) => i !== index || prev[today][i].mealType !== mealType) || []
    }));
    
    toast({
      title: "Item deleted! 🗑️",
      description: "Food item removed from your meal tracker",
    });
  };

  const todayMeals = dailyMeals[today] || [];
  const mealStats = mealTypes.map(mealType => {
    const typeMeals = todayMeals.filter(meal => meal.mealType === mealType.value);
    return {
      ...mealType,
      meals: typeMeals,
      calories: typeMeals.reduce((acc, meal) => acc + meal.calories, 0),
      count: typeMeals.length
    };
  });

  const totalCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);

  return (
    <div className="space-y-4 w-full">
      {/* Hero Banner */}
      <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden shadow-food">
        <img 
          src={foodBanner} 
          alt="Healthy food banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-dark opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 justify-center">
              <ChefHat className="w-4 h-4" />
              Track Your Meals
            </h2>
            <p className="text-xs opacity-90">View your daily nutrition progress</p>
          </div>
        </div>
      </div>

      <Card className="professional-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Utensils className="w-5 h-5" />
            Track Your Meals
          </CardTitle>
          <CardDescription>
            Track your daily meals and nutrition. Add foods through "Record Meal" in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Charts Section */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeeklyChart />
              <NutritionPieChart />
            </div>
          </div>

          {/* Daily Summary */}
          <div className="gradient-food p-4 rounded-xl text-white">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold flex items-center gap-2">
                📊 Today's Summary
              </h4>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {totalCalories} kcal total
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {mealStats.map((meal) => (
                <div key={meal.value} className="bg-white/10 rounded-lg p-2">
                  <div className="text-xl mb-1">{meal.icon}</div>
                  <div className="text-xs font-medium">{meal.label}</div>
                  <div className="text-sm font-bold">{meal.calories} kcal</div>
                  <div className="text-xs opacity-80">{meal.count} items</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Lists */}
          <div className="space-y-4">
            {mealStats.map((meal) => (
              <div key={meal.value} className="space-y-2">
                <h5 className="font-semibold text-primary flex items-center gap-2">
                  <span className="text-lg">{meal.icon}</span>
                  {meal.label} ({meal.calories} kcal)
                </h5>
                {meal.meals.length > 0 ? (
                  <div className="space-y-2">
                    {meal.meals.map((food, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{food.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {food.quantity} {food.unit} • {food.calories} kcal
                            {food.protein && ` • ${food.protein}g protein`}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingItem(`${meal.value}-${index}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFoodItem(meal.value, index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    No {meal.label.toLowerCase()} logged yet. Go to "Record Meal" to add foods!
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={() => window.location.href = '/record-meal'} 
              className="gradient-primary text-white shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meals (Go to Record Meal)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SimpleMealTracker = EnhancedMealTracker;