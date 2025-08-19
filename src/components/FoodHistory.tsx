import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FoodRecord {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
  time: string;
}

interface FoodHistoryProps {
  onAddFood?: (food: FoodRecord) => void;
}

export const FoodHistory = ({ onAddFood }: FoodHistoryProps) => {
  const [foodHistory, setFoodHistory] = useState<FoodRecord[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFoodHistory();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadFoodHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFoodHistory = () => {
    const dailyMeals = JSON.parse(localStorage.getItem('dailyMeals') || '{}');
    const dailyFoodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    
    // Combine all food records
    const allFoods: FoodRecord[] = [];
    
    // From dailyMeals (structured by date)
    Object.entries(dailyMeals).forEach(([date, meals]: [string, any]) => {
      if (Array.isArray(meals)) {
        meals.forEach((meal: any) => {
          allFoods.push({
            id: `${date}-${meal.name}-${meal.time}`,
            name: meal.name,
            calories: meal.calories || 0,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            quantity: meal.quantity || 1,
            unit: meal.unit || 'serving',
            mealType: meal.mealType || 'snack',
            date: date,
            time: meal.time || new Date().toLocaleTimeString()
          });
        });
      }
    });

    // From dailyFoodLog (flat array)
    dailyFoodLog.forEach((food: any) => {
      const foodDate = new Date(food.timestamp).toISOString().split('T')[0];
      const foodTime = new Date(food.timestamp).toLocaleTimeString();
      
      allFoods.push({
        id: food.id?.toString() || `${foodDate}-${food.name}-${foodTime}`,
        name: food.name,
        calories: food.calories || 0,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        quantity: food.quantity || 1,
        unit: food.unit || 'serving',
        mealType: food.mealType || 'snack',
        date: foodDate,
        time: foodTime
      });
    });

    // Remove duplicates and sort by date/time
    const uniqueFoods = allFoods.filter((food, index, self) => 
      index === self.findIndex(f => f.id === food.id)
    );

    uniqueFoods.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
      return dateTimeB - dateTimeA; // Most recent first
    });

    setFoodHistory(uniqueFoods);
    
    // Get unique recent foods for quick add
    const uniqueNames = new Set<string>();
    const recent = uniqueFoods.filter(food => {
      if (uniqueNames.has(food.name.toLowerCase())) {
        return false;
      }
      uniqueNames.add(food.name.toLowerCase());
      return true;
    }).slice(0, 6);
    
    setRecentFoods(recent);
  };

  const handleQuickAdd = (food: FoodRecord) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString()
    };

    if (onAddFood) {
      onAddFood(newFood);
    }

    toast({
      title: "Food Added! 🍽️",
      description: `Added ${food.name} (${food.calories} kcal) to today's intake`,
    });
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'lunch': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dinner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'snack': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('dailyMeals');
    localStorage.removeItem('dailyFoodLog');
    setFoodHistory([]);
    setRecentFoods([]);
    
    toast({
      title: "History Cleared! 🗑️",
      description: "All food history has been cleared",
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Add from Recent Foods */}
      {recentFoods.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Clock className="w-4 h-4" />
              Quick Add Recent Foods
            </CardTitle>
            <CardDescription className="text-xs">
              Tap to quickly add foods you've eaten before
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recentFoods.map((food) => (
                <Button
                  key={food.id}
                  onClick={() => handleQuickAdd(food)}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-start text-left bg-white hover:bg-green-50"
                >
                  <div className="font-medium text-xs truncate w-full">{food.name}</div>
                  <div className="text-xs text-green-600">{food.calories} kcal</div>
                  <div className="text-xs text-gray-500">{food.quantity} {food.unit}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Food History */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Utensils className="w-4 h-4" />
                Food History ({foodHistory.length} items)
              </CardTitle>
              <CardDescription className="text-xs">
                Your complete food intake history with detailed nutrition
              </CardDescription>
            </div>
            {foodHistory.length > 0 && (
              <Button
                onClick={clearHistory}
                variant="outline"
                size="sm"
                className="text-xs h-7"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {foodHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No food history yet</p>
              <p className="text-xs">Start logging your meals to see them here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {foodHistory.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {food.name}
                      </h4>
                      <Badge className={`text-xs ${getMealTypeColor(food.mealType)}`}>
                        {food.mealType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="font-medium text-purple-600">
                        {food.calories} kcal
                      </span>
                      <span>{food.quantity} {food.unit}</span>
                      <span>{food.date}</span>
                      <span>{food.time}</span>
                    </div>
                    
                    {(food.protein || food.carbs || food.fat) && (
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {food.protein && <span>P: {food.protein}g</span>}
                        {food.carbs && <span>C: {food.carbs}g</span>}
                        {food.fat && <span>F: {food.fat}g</span>}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handleQuickAdd(food)}
                    size="sm"
                    variant="ghost"
                    className="ml-2 flex-shrink-0 h-8 w-8 p-0 hover:bg-purple-100"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};