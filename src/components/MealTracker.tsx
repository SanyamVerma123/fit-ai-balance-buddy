
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Camera, Brain, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  mealType: string;
  date: string;
  time: string;
}

interface SavedMeal {
  name: string;
  items: FoodItem[];
  mealType: string;
  totalCalories: number;
}

interface MealTrackerProps {
  onCaloriesAdd: (calories: number, food: FoodItem) => void;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'snacks', label: 'Snacks', icon: '🍎' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'other', label: 'Other', icon: '🍽️' }
];

const units = [
  { value: 'gram', label: 'Grams (g)' },
  { value: 'piece', label: 'Piece(s)' },
  { value: 'cup', label: 'Cup(s)' },
  { value: 'tablespoon', label: 'Tablespoon(s)' },
  { value: 'teaspoon', label: 'Teaspoon(s)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'slice', label: 'Slice(s)' }
];

export const MealTracker = ({ onCaloriesAdd }: MealTrackerProps) => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("piece");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [dailyMeals, setDailyMeals] = useState<{[key: string]: FoodItem[]}>({});
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const stored = localStorage.getItem('savedMeals');
    if (stored) {
      setSavedMeals(JSON.parse(stored));
    }

    const storedDaily = localStorage.getItem('dailyMeals');
    if (storedDaily) {
      setDailyMeals(JSON.parse(storedDaily));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
  }, [savedMeals]);

  useEffect(() => {
    localStorage.setItem('dailyMeals', JSON.stringify(dailyMeals));
  }, [dailyMeals]);

  const analyzeWithAI = async (description: string, qty: string, unitType: string, mealType: string) => {
    setIsProcessing(true);
    try {
      const dietInfo = userProfile?.dietPreference ? `Diet preference: ${userProfile.dietPreference}` : '';
      
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
              content: 'You are a nutrition expert. Analyze food items and provide calorie information. Return ONLY a JSON object with this exact format: {"calories": number, "food_name": "string"}. Be precise and consider the exact quantity and unit provided.'
            },
            {
              role: 'user',
              content: `Calculate exact calories for: ${description} - ${qty} ${unitType} for ${mealType}. ${dietInfo}. Be very precise with the quantity.`
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze food');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        return {
          calories: parsed.calories || 0,
          name: parsed.food_name || description
        };
      } catch {
        const calorieMatch = content.match(/(\d+)/);
        return {
          calories: calorieMatch ? parseInt(calorieMatch[1]) : 100,
          name: description
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        calories: 100,
        name: description
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIMealSuggestion = async (mealType: string) => {
    setIsProcessing(true);
    try {
      const dietInfo = userProfile?.dietPreference || 'mixed';
      const goalInfo = userProfile?.goal || 'maintain';
      
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
              content: 'You are a nutrition expert. Suggest healthy meal items for specific meal types. Return ONLY a JSON array with this exact format: [{"name": "food_name", "quantity": number, "unit": "unit_type", "calories": number}]. Maximum 3-4 items per meal.'
            },
            {
              role: 'user',
              content: `Suggest a healthy ${mealType} for someone who wants to ${goalInfo} weight. Diet preference: ${dietInfo}. Include portion sizes and calories.`
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
        const suggestions = JSON.parse(content);
        return suggestions;
      } catch {
        // Fallback suggestions
        const fallbacks = {
          breakfast: [
            { name: "Oatmeal with banana", quantity: 1, unit: "cup", calories: 150 },
            { name: "Greek yogurt", quantity: 1, unit: "cup", calories: 100 }
          ],
          lunch: [
            { name: "Grilled chicken breast", quantity: 150, unit: "gram", calories: 250 },
            { name: "Brown rice", quantity: 1, unit: "cup", calories: 220 }
          ],
          dinner: [
            { name: "Salmon fillet", quantity: 120, unit: "gram", calories: 280 },
            { name: "Steamed vegetables", quantity: 1, unit: "cup", calories: 50 }
          ]
        };
        return fallbacks[mealType as keyof typeof fallbacks] || fallbacks.breakfast;
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFood = async () => {
    if (!foodName || !quantity) {
      toast({
        title: "Missing information",
        description: "Please enter both food name and quantity",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeWithAI(foodName, quantity, unit, selectedMeal);
    const foodItem: FoodItem = {
      name: result.name,
      quantity: Number(quantity),
      unit,
      calories: result.calories,
      mealType: selectedMeal,
      date: today,
      time: new Date().toLocaleTimeString()
    };

    // Add to daily meals
    setDailyMeals(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), foodItem]
    }));

    onCaloriesAdd(result.calories, foodItem);

    toast({
      title: "Food added!",
      description: `Added ${result.name} to ${selectedMeal} (${result.calories} kcal)`,
    });

    setFoodName("");
    setQuantity("1");
  };

  const handleAISuggestion = async () => {
    const suggestions = await generateAIMealSuggestion(selectedMeal);
    
    if (suggestions.length > 0) {
      let totalCalories = 0;
      const mealItems: FoodItem[] = [];

      for (const suggestion of suggestions) {
        const foodItem: FoodItem = {
          name: suggestion.name,
          quantity: suggestion.quantity,
          unit: suggestion.unit,
          calories: suggestion.calories,
          mealType: selectedMeal,
          date: today,
          time: new Date().toLocaleTimeString()
        };
        
        mealItems.push(foodItem);
        totalCalories += suggestion.calories;
      }

      // Add all items to daily meals
      setDailyMeals(prev => ({
        ...prev,
        [today]: [...(prev[today] || []), ...mealItems]
      }));

      // Save as a meal suggestion for future use
      const savedMeal: SavedMeal = {
        name: `AI ${selectedMeal} suggestion`,
        items: mealItems,
        mealType: selectedMeal,
        totalCalories
      };

      setSavedMeals(prev => {
        const existing = prev.filter(meal => 
          !(meal.name.includes(`AI ${selectedMeal}`) && meal.mealType === selectedMeal)
        );
        return [...existing, savedMeal];
      });

      // Update total calories
      mealItems.forEach(item => onCaloriesAdd(item.calories, item));

      toast({
        title: "AI meal added!",
        description: `Added complete ${selectedMeal} (${totalCalories} kcal)`,
      });
    }
  };

  const todayMealsForType = (dailyMeals[today] || []).filter(meal => meal.mealType === selectedMeal);
  const mealCalories = todayMealsForType.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-600" />
          Meal Tracker
        </CardTitle>
        <CardDescription>
          Track your meals with AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meal Type Selection */}
        <div className="grid grid-cols-5 gap-2">
          {mealTypes.map((meal) => (
            <Button
              key={meal.value}
              variant={selectedMeal === meal.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMeal(meal.value)}
              className={selectedMeal === meal.value ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <span className="mr-1">{meal.icon}</span>
              <span className="hidden sm:inline">{meal.label}</span>
            </Button>
          ))}
        </div>

        {/* Current Meal Summary */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <h4 className="font-medium capitalize">{selectedMeal} Today</h4>
            <Badge variant="secondary">{mealCalories} kcal</Badge>
          </div>
          {todayMealsForType.length > 0 && (
            <div className="mt-2 space-y-1">
              {todayMealsForType.map((meal, index) => (
                <div key={index} className="text-sm text-gray-600 flex justify-between">
                  <span>{meal.name} ({meal.quantity} {meal.unit})</span>
                  <span>{meal.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestion Button */}
        <Button 
          onClick={handleAISuggestion}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Getting AI Suggestion...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get AI {selectedMeal} Suggestion
            </>
          )}
        </Button>

        {/* Manual Food Entry */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Food Manually
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="foodName">Food Name</Label>
              <Input
                id="foodName"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder={`e.g., Scrambled eggs (for ${selectedMeal})`}
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  disabled={isProcessing}
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={setUnit} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unitOption) => (
                      <SelectItem key={unitOption.value} value={unitOption.value}>
                        {unitOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAddFood}
              disabled={isProcessing || !foodName || !quantity}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to {selectedMeal}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Saved Meal History */}
        {savedMeals.filter(meal => meal.mealType === selectedMeal).length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Previous {selectedMeal} Ideas
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedMeals
                .filter(meal => meal.mealType === selectedMeal)
                .slice(-3)
                .map((meal, index) => (
                <div key={index} className="text-sm bg-white p-2 rounded border">
                  <div className="font-medium">{meal.name}</div>
                  <div className="text-gray-600">{meal.totalCalories} kcal total</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
