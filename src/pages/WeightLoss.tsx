
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Target, Utensils, Activity } from "lucide-react";

const WeightLoss = () => {
  const tips = [
    "Create a moderate caloric deficit of 300-500 calories per day",
    "Focus on whole, unprocessed foods for better satiety",
    "Include protein with every meal to preserve muscle mass",
    "Stay hydrated - drink water before meals",
    "Combine cardio with strength training for best results",
  ];

  const mealPlan = [
    { meal: "Breakfast", foods: "Egg white omelet with vegetables and toast", calories: 300 },
    { meal: "Mid-Morning", foods: "Apple with almond butter", calories: 180 },
    { meal: "Lunch", foods: "Grilled chicken salad with quinoa", calories: 400 },
    { meal: "Snack", foods: "Greek yogurt with berries", calories: 150 },
    { meal: "Dinner", foods: "Baked fish with steamed vegetables", calories: 350 },
    { meal: "Evening", foods: "Herbal tea with small handful of nuts", calories: 120 },
  ];

  const totalCalories = mealPlan.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Weight Loss Plan
            </h1>
            <p className="text-gray-600">Sustainable strategies to lose weight safely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Target className="w-5 h-5" />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1,500 kcal</div>
              <p className="text-sm text-gray-600">Caloric target</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingDown className="w-5 h-5" />
                Weekly Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">-0.7 kg</div>
              <p className="text-sm text-gray-600">Safe loss rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Activity className="w-5 h-5" />
                Protein Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">120g</div>
              <p className="text-sm text-gray-600">Preserve muscle mass</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-red-600" />
                Sample Meal Plan
              </CardTitle>
              <CardDescription>
                Daily plan with {totalCalories} calories for sustainable weight loss
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
                    <span className="text-red-600 font-semibold">{meal.calories} kcal</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Daily Calories</span>
                    <span className="text-lg font-bold text-red-600">{totalCalories} kcal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weight Loss Tips</CardTitle>
              <CardDescription>
                Evidence-based strategies for effective weight loss
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">⚠️ Important</h4>
                <p className="text-sm text-blue-700">
                  Aim to lose 0.5-1 kg per week for sustainable results. Faster weight loss may lead to muscle loss and metabolic slowdown.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeightLoss;
