
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Utensils, Dumbbell, Brain } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

const WeightGain = () => {
  const [isGettingAISuggestion, setIsGettingAISuggestion] = useState(false);
  const [aiMealSuggestions, setAiMealSuggestions] = useState<any[]>([]);
  const { userProfile } = useUserProfile();
  const { toast } = useToast();

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

  const getAIMealSuggestion = async (mealType: string) => {
    setIsGettingAISuggestion(true);
    try {
      const dietInfo = userProfile?.dietPreference || 'mixed';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert specializing in weight gain. Suggest detailed meal plans. Return ONLY a JSON object with this exact format: {"meal_name": "string", "items": ["item1", "item2"], "total_calories": number, "preparation_tips": "string"}.'
            },
            {
              role: 'user',
              content: `Suggest a detailed ${mealType} plan for weight gain. Diet preference: ${dietInfo}. Include specific foods, portions, and preparation tips.`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const suggestion = JSON.parse(content);
        setAiMealSuggestions(prev => [...prev, { ...suggestion, mealType }]);
        
        toast({
          title: "AI Meal Suggestion Ready!",
          description: `Generated ${mealType} plan: ${suggestion.meal_name}`,
        });
      } catch {
        const fallbackSuggestion = {
          meal_name: `Healthy ${mealType} for Weight Gain`,
          items: ["High-protein option", "Complex carbohydrates", "Healthy fats"],
          total_calories: 450,
          preparation_tips: "Focus on nutrient-dense, calorie-rich foods"
        };
        setAiMealSuggestions(prev => [...prev, { ...fallbackSuggestion, mealType }]);
        
        toast({
          title: "Meal Suggestion Ready!",
          description: `Generated ${mealType} plan`,
        });
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGettingAISuggestion(false);
    }
  };

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
                AI-Powered Meal Plans
              </CardTitle>
              <CardDescription>
                Get personalized meal suggestions based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Meal Type Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
                    <Button
                      key={mealType}
                      onClick={() => getAIMealSuggestion(mealType.toLowerCase())}
                      disabled={isGettingAISuggestion}
                      variant="outline"
                      className="bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100"
                    >
                      {isGettingAISuggestion ? (
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      AI {mealType}
                    </Button>
                  ))}
                </div>

                {/* AI Suggestions Display */}
                {aiMealSuggestions.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <h4 className="font-medium text-gray-800">AI Suggestions:</h4>
                    {aiMealSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-green-700 capitalize">
                            {suggestion.mealType}: {suggestion.meal_name}
                          </h5>
                          <span className="text-green-600 font-semibold">{suggestion.total_calories} kcal</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Items:</strong> {suggestion.items.join(", ")}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Tip:</strong> {suggestion.preparation_tips}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sample Meal Plan */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Sample Daily Plan ({totalCalories} kcal):</h4>
                  <div className="space-y-2">
                    {mealPlan.map((meal, index) => (
                      <div key={index} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800">{meal.meal}</h5>
                          <p className="text-sm text-gray-600">{meal.foods}</p>
                        </div>
                        <span className="text-green-600 font-semibold">{meal.calories} kcal</span>
                      </div>
                    ))}
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
