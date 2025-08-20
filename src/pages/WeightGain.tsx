
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Utensils, Dumbbell, Brain } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

const PERMANENT_API_KEY = "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";

const WeightGain = () => {
  const [isGettingAISuggestion, setIsGettingAISuggestion] = useState(false);
  const [aiMealSuggestions, setAiMealSuggestions] = useState<any[]>([]);
  const { userProfile } = useUserProfile();
  const { toast } = useToast();

  // Load saved suggestions on component mount
  useEffect(() => {
    const savedSuggestions = localStorage.getItem('weightGainAISuggestions');
    if (savedSuggestions) {
      try {
        setAiMealSuggestions(JSON.parse(savedSuggestions));
      } catch (error) {
        console.error('Error loading saved suggestions:', error);
      }
    }
  }, []);

  // Save suggestions whenever they change
  useEffect(() => {
    if (aiMealSuggestions.length > 0) {
      localStorage.setItem('weightGainAISuggestions', JSON.stringify(aiMealSuggestions));
    }
  }, [aiMealSuggestions]);

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
      const weight = userProfile?.weight || 70;
      const goal = userProfile?.goal || 'gain';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERMANENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert specializing in weight gain. Create detailed meal suggestions for ${mealType}. User weight: ${weight}kg, Goal: ${goal}, Diet: ${dietInfo}. Return ONLY a JSON object with this exact format: {"meal_name": "string", "items": ["item1", "item2"], "total_calories": number, "preparation_tips": "string"}.`
            },
            {
              role: 'user',
              content: `Suggest a detailed ${mealType} plan for healthy weight gain. Include specific foods, portions, and preparation tips for someone who weighs ${weight}kg.`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from AI');
      }
      
      try {
        const suggestion = JSON.parse(content);
        const newSuggestion = { ...suggestion, mealType, timestamp: Date.now() };
        setAiMealSuggestions(prev => [...prev, newSuggestion]);
        
        toast({
          title: "AI Meal Suggestion Ready!",
          description: `Generated ${mealType} plan: ${suggestion.meal_name}`,
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        const fallbackSuggestion = {
          meal_name: `Healthy ${mealType} for Weight Gain`,
          items: ["High-protein option", "Complex carbohydrates", "Healthy fats"],
          total_calories: 450,
          preparation_tips: "Focus on nutrient-dense, calorie-rich foods",
          mealType,
          timestamp: Date.now()
        };
        setAiMealSuggestions(prev => [...prev, fallbackSuggestion]);
        
        toast({
          title: "Meal Suggestion Ready!",
          description: `Generated ${mealType} plan`,
        });
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        title: "Error Getting AI Suggestion",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGettingAISuggestion(false);
    }
  };

  const clearSuggestions = () => {
    setAiMealSuggestions([]);
    localStorage.removeItem('weightGainAISuggestions');
    toast({
      title: "Suggestions Cleared",
      description: "All AI meal suggestions have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 lg:p-6 max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Weight Gain Plan
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">Healthy strategies to gain weight and build muscle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-green-700 text-xs sm:text-sm lg:text-base">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Daily Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-600">2,550 kcal</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Recommended intake</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-blue-700 text-xs sm:text-sm lg:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Weekly Target</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-blue-600">+0.5 kg</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Healthy gain rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-purple-700 text-xs sm:text-sm lg:text-base">
                <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">Protein Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-purple-600">140g</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Daily protein target</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="truncate">AI-Powered Meal Plans</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get personalized meal suggestions based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {/* Meal Type Buttons */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
                    <Button
                      key={mealType}
                      onClick={() => getAIMealSuggestion(mealType.toLowerCase())}
                      disabled={isGettingAISuggestion}
                      variant="outline"
                      className="bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      {isGettingAISuggestion ? (
                        <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-1 sm:mr-2" />
                      ) : (
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">AI {mealType}</span>
                    </Button>
                  ))}
                </div>

                {/* Clear Button */}
                {aiMealSuggestions.length > 0 && (
                  <Button
                    onClick={clearSuggestions}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                  >
                    Clear All Suggestions
                  </Button>
                )}

                {/* AI Suggestions Display */}
                {aiMealSuggestions.length > 0 && (
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    <h4 className="font-medium text-gray-800 text-xs sm:text-sm">AI Suggestions:</h4>
                    {aiMealSuggestions.slice(-5).map((suggestion, index) => (
                      <div key={index} className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <h5 className="font-medium text-green-700 capitalize text-xs sm:text-sm truncate">
                            {suggestion.mealType}: {suggestion.meal_name}
                          </h5>
                          <span className="text-green-600 font-semibold text-xs sm:text-sm flex-shrink-0 ml-2">{suggestion.total_calories} kcal</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
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
                <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <h4 className="font-medium mb-2 sm:mb-3 text-xs sm:text-sm">Sample Daily Plan ({totalCalories} kcal):</h4>
                  <div className="space-y-1 sm:space-y-2">
                    {mealPlan.map((meal, index) => (
                      <div key={index} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-800 text-xs sm:text-sm truncate">{meal.meal}</h5>
                          <p className="text-xs text-gray-600 truncate">{meal.foods}</p>
                        </div>
                        <span className="text-green-600 font-semibold text-xs sm:text-sm flex-shrink-0 ml-2">{meal.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base lg:text-lg">Weight Gain Tips</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Science-backed strategies for healthy weight gain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1 sm:mb-2 text-xs sm:text-sm">💡 Pro Tip</h4>
                <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
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
