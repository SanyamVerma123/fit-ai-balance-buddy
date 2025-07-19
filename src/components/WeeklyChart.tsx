import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
  mealType: string;
  timestamp: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export const WeeklyChart = () => {
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number }[]>([]);

  useEffect(() => {
    const calculateWeeklyData = () => {
      const today = new Date();
      const weekData = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        const foodLog: FoodItem[] = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
        const dayCalories = foodLog
          .filter(item => new Date(item.timestamp).toDateString() === dateString)
          .reduce((sum, item) => sum + (item.calories || 0), 0);
        
        weekData.push({
          day: dayNames[date.getDay()],
          calories: dayCalories
        });
      }
      
      setWeeklyData(weekData);
    };

    calculateWeeklyData();
    
    // Listen for storage changes to update chart
    const handleStorageChange = () => calculateWeeklyData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const maxCalories = Math.max(...weeklyData.map(d => d.calories), 100);

  return (
    <Card className="professional-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm">
          <BarChart3 className="w-4 h-4" />
          Weekly Calorie Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-end justify-around gap-1">
          {weeklyData.map((data, index) => (
            <div key={data.day + index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-purple-600"
                style={{ 
                  height: `${Math.max((data.calories / maxCalories) * 100, 5)}%`,
                  minHeight: '8px'
                }}
                title={`${data.calories} kcal`}
              ></div>
              <span className="text-xs mt-1 font-medium text-gray-600">{data.day}</span>
              <span className="text-xs text-gray-500">{data.calories}</span>
            </div>
          ))}
        </div>
        {weeklyData.every(d => d.calories === 0) && (
          <div className="text-center text-gray-500 text-xs mt-2">
            Start logging meals to see your weekly progress!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const NutritionPieChart = () => {
  const [nutritionData, setNutritionData] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    const calculateNutrition = () => {
      const today = new Date().toDateString();
      const foodLog: FoodItem[] = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
      
      const todayFood = foodLog.filter(item => 
        new Date(item.timestamp).toDateString() === today
      );

      const totals = todayFood.reduce((acc, item) => ({
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0)
      }), { protein: 0, carbs: 0, fat: 0 });

      const total = totals.protein + totals.carbs + totals.fat;
      
      if (total > 0) {
        setNutritionData({
          protein: Math.round((totals.protein / total) * 100),
          carbs: Math.round((totals.carbs / total) * 100),
          fat: Math.round((totals.fat / total) * 100)
        });
      } else {
        setNutritionData({ protein: 25, carbs: 50, fat: 25 });
      }
    };

    calculateNutrition();
    
    const handleStorageChange = () => calculateNutrition();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const nutritionItems = [
    { name: 'Protein', value: nutritionData.protein, color: 'bg-green-400' },
    { name: 'Carbs', value: nutritionData.carbs, color: 'bg-blue-400' },
    { name: 'Fat', value: nutritionData.fat, color: 'bg-purple-400' },
  ];

  const hasData = nutritionData.protein + nutritionData.carbs + nutritionData.fat > 0;

  return (
    <Card className="professional-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
          Today's Nutrition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-inner">
              <span className="text-xs font-bold text-gray-700">Today</span>
            </div>
          </div>
          <div className="ml-4 space-y-1">
            {nutritionItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded shadow-sm`}></div>
                <span className="text-xs font-medium text-gray-700">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
        {!hasData && (
          <div className="text-center text-gray-500 text-xs mt-2">
            Add meals to see nutrition breakdown!
          </div>
        )}
      </CardContent>
    </Card>
  );
};