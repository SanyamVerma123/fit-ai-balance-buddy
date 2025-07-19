import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const WeeklyChart = () => {
  const weeklyData = [
    { day: 'Sun', calories: 1800 },
    { day: 'Mon', calories: 2200 },
    { day: 'Tue', calories: 1950 },
    { day: 'Wed', calories: 2100 },
    { day: 'Thu', calories: 1750 },
    { day: 'Fri', calories: 2300 },
    { day: 'Sat', calories: 2000 },
  ];

  const maxCalories = Math.max(...weeklyData.map(d => d.calories));

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
            <div key={data.day} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-purple-600"
                style={{ 
                  height: `${(data.calories / maxCalories) * 100}%`,
                  minHeight: '8px'
                }}
                title={`${data.calories} kcal`}
              ></div>
              <span className="text-xs mt-1 font-medium text-gray-600">{data.day}</span>
              <span className="text-xs text-gray-500">{data.calories}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const NutritionPieChart = () => {
  const nutritionData = [
    { name: 'Protein', value: 25, color: 'bg-green-400' },
    { name: 'Carbs', value: 50, color: 'bg-blue-400' },
    { name: 'Fat', value: 25, color: 'bg-purple-400' },
  ];

  return (
    <Card className="professional-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
          Nutrition Breakdown
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
            {nutritionData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded shadow-sm`}></div>
                <span className="text-xs font-medium text-gray-700">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};