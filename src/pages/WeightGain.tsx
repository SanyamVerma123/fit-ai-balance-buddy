
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Utensils, Dumbbell } from "lucide-react";

const WeightGain = () => {
  const tips = [
    "Eat in a caloric surplus of 300-500 calories above maintenance",
    "Focus on protein-rich foods (1.6-2.2g per kg body weight)",
    "Include healthy fats like nuts, avocados, and olive oil",
    "Eat frequent meals throughout the day",
    "Combine with strength training for muscle gain",
  ];

  const mealPlan = [
    { meal: "Breakfast", foods: "Oatmeal with banana, nuts, and protein powder", calories: 450 },
    { meal: "Mid-Morning", foods: "Greek yogurt with berries and granola", calories: 300 },
    { meal: "Lunch", foods: "Chicken breast, rice, and vegetables", calories: 550 },
    { meal: "Snack", foods: "Peanut butter sandwich", calories: 400 },
    { meal: "Dinner", foods: "Salmon, quinoa, and roasted vegetables", calories: 600 },
    { meal: "Evening", foods: "Protein shake with milk", calories: 250 },
  ];

  const totalCalories = mealPlan.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Weight Gain Plan
            </h1>
            <p className="text-gray-600">Healthy strategies to gain weight and build muscle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Target className="w-5 h-5" />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2,550 kcal</div>
              <p className="text-sm text-gray-600">Recommended intake</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-5 h-5" />
                Weekly Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">+0.5 kg</div>
              <p className="text-sm text-gray-600">Healthy gain rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Dumbbell className="w-5 h-5" />
                Protein Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">140g</div>
              <p className="text-sm text-gray-600">Daily protein target</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-600" />
                Sample Meal Plan
              </CardTitle>
              <CardDescription>
                Daily plan with {totalCalories} calories for healthy weight gain
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
                    <span className="text-green-600 font-semibold">{meal.calories} kcal</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Daily Calories</span>
                    <span className="text-lg font-bold text-green-600">{totalCalories} kcal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weight Gain Tips</CardTitle>
              <CardDescription>
                Science-backed strategies for healthy weight gain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-yellow-700">
                  Track your weight weekly at the same time of day. Aim for 0.5-1 kg gain per week for optimal muscle building.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeightGain;
