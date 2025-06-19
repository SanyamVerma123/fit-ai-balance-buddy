
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Activity, Utensils, Heart } from "lucide-react";

const WeightMaintain = () => {
  const tips = [
    "Eat at your maintenance calorie level (TDEE)",
    "Focus on nutrient-dense, balanced meals",
    "Maintain consistent eating patterns",
    "Continue regular physical activity",
    "Monitor weight weekly to catch fluctuations early",
  ];

  const mealPlan = [
    { meal: "Breakfast", foods: "Overnight oats with fruits and nuts", calories: 350 },
    { meal: "Mid-Morning", foods: "Mixed nuts and dried fruits", calories: 200 },
    { meal: "Lunch", foods: "Balanced bowl with protein, grains, and vegetables", calories: 500 },
    { meal: "Snack", foods: "Greek yogurt with granola", calories: 250 },
    { meal: "Dinner", foods: "Lean protein with roasted vegetables and quinoa", calories: 550 },
    { meal: "Evening", foods: "Herbal tea with dark chocolate", calories: 150 },
  ];

  const totalCalories = mealPlan.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Weight Maintenance Plan
            </h1>
            <p className="text-gray-600">Stay healthy and maintain your current weight</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="w-5 h-5" />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2,000 kcal</div>
              <p className="text-sm text-gray-600">Maintenance calories</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Activity className="w-5 h-5" />
                Weight Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">±1 kg</div>
              <p className="text-sm text-gray-600">Healthy fluctuation</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Heart className="w-5 h-5" />
                Protein Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">110g</div>
              <p className="text-sm text-gray-600">Daily protein target</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-blue-600" />
                Sample Meal Plan
              </CardTitle>
              <CardDescription>
                Balanced daily plan with {totalCalories} calories for weight maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealPlan.map((meal, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{meal.meal}</h4>
                      <p className="text-sm text-gray-600">{meal.foods}</p>
                    </div>
                    <span className="text-blue-600 font-semibold">{meal.calories} kcal</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Daily Calories</span>
                    <span className="text-lg font-bold text-blue-600">{totalCalories} kcal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Maintenance Tips</CardTitle>
              <CardDescription>
                Key strategies to maintain your healthy weight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎯 Success Tip</h4>
                <p className="text-sm text-green-700">
                  Consistency is key! Stick to your routine 80% of the time and allow for flexibility in the remaining 20%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeightMaintain;
