import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Camera, Brain, Clock, Send, X, Check, Sparkles, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import breakfastImg from "@/assets/breakfast-foods.jpg";
import lunchImg from "@/assets/lunch-foods.jpg";
import dinnerImg from "@/assets/dinner-foods.jpg";
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

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  { value: 'breakfast', label: 'Breakfast', icon: '🌅', image: breakfastImg },
  { value: 'lunch', label: 'Lunch', icon: '☀️', image: lunchImg },
  { value: 'snacks', label: 'Snacks', icon: '🍎', image: breakfastImg },
  { value: 'dinner', label: 'Dinner', icon: '🌙', image: dinnerImg },
];

const units = [
  { value: 'gram', label: 'Grams (g)' },
  { value: 'piece', label: 'Piece(s)' },
  { value: 'cup', label: 'Cup(s)' },
  { value: 'tablespoon', label: 'Tablespoon(s)' },
  { value: 'teaspoon', label: 'Teaspoon(s)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'slice', label: 'Slice(s)' },
  { value: 'bowl', label: 'Bowl(s)' },
  { value: 'plate', label: 'Plate(s)' }
];

export const EnhancedMealTracker = ({ onCaloriesAdd }: EnhancedMealTrackerProps) => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("piece");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedFood[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [dailyMeals, setDailyMeals] = useState<{[key: string]: FoodItem[]}>({});
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

  const analyzeWithAI = async (description: string, qty: string, unitType: string, mealType: string): Promise<NutritionalInfo> => {
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
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert. Analyze food items and provide detailed nutritional information. Return ONLY a JSON object with this exact format: {"calories": number, "protein": number, "carbs": number, "fat": number, "food_name": "string"}. Be precise with calculations.'
            },
            {
              role: 'user',
              content: `Calculate detailed nutrition for: ${description} - ${qty} ${unitType} for ${mealType}. ${dietInfo}. Include calories, protein (g), carbs (g), and fat (g).`
            }
          ],
          temperature: 0.1,
          max_tokens: 150
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
          calories: parsed.calories || 100,
          protein: parsed.protein || 5,
          carbs: parsed.carbs || 15,
          fat: parsed.fat || 3
        };
      } catch {
        const calorieMatch = content.match(/(\d+)/);
        const calories = calorieMatch ? parseInt(calorieMatch[1]) : 100;
        return {
          calories,
          protein: Math.round(calories * 0.15 / 4), // 15% protein
          carbs: Math.round(calories * 0.55 / 4), // 55% carbs
          fat: Math.round(calories * 0.30 / 9) // 30% fat
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      const calories = 100;
      return {
        calories,
        protein: 5,
        carbs: 15,
        fat: 3
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeImageWithAI = async (imageFile: File) => {
    setIsAnalyzingImage(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'system',
              content: 'Analyze food images and provide detailed nutrition. Return ONLY JSON: {"name": "food_name", "calories": number, "protein": number, "carbs": number, "fat": number}. Be precise with estimations.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Identify this food and estimate detailed nutrition including calories, protein (g), carbs (g), and fat (g). Consider typical serving size.'
                },
                {
                  type: 'image_url',
                  image_url: { url: base64 }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 150
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        return {
          name: parsed.name || 'Food from image',
          calories: parsed.calories || 150,
          protein: parsed.protein || 8,
          carbs: parsed.carbs || 20,
          fat: parsed.fat || 5
        };
      } catch {
        return {
          name: 'Food from image',
          calories: 150,
          protein: 8,
          carbs: 20,
          fat: 5
        };
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        name: 'Food from image',
        calories: 150,
        protein: 8,
        carbs: 20,
        fat: 5
      };
    } finally {
      setIsAnalyzingImage(false);
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
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'system',
              content: 'Suggest healthy meals with detailed nutrition. Return ONLY a JSON array: [{"name": "food_name", "quantity": number, "unit": "unit_type", "calories": number, "protein": number, "carbs": number, "fat": number}]. Maximum 4 items.'
            },
            {
              role: 'user',
              content: `Suggest a healthy ${mealType} for someone who wants to ${goalInfo} weight. Diet: ${dietInfo}. Include detailed nutrition (calories, protein, carbs, fat).`
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
        setAiSuggestions(suggestions);
        setShowSuggestions(true);
        
        toast({
          title: "AI Suggestions Ready! ✨",
          description: `Generated ${suggestions.length} nutritious ${mealType} options`,
        });
        
        return suggestions;
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError);
        // Enhanced fallback suggestions with nutrition
        const fallbacks = {
          breakfast: [
            { name: "Oatmeal with banana", quantity: 1, unit: "bowl", calories: 180, protein: 6, carbs: 35, fat: 3 },
            { name: "Greek yogurt", quantity: 1, unit: "cup", calories: 130, protein: 15, carbs: 9, fat: 5 }
          ],
          lunch: [
            { name: "Grilled chicken breast", quantity: 150, unit: "gram", calories: 280, protein: 35, carbs: 0, fat: 12 },
            { name: "Quinoa salad", quantity: 1, unit: "cup", calories: 220, protein: 8, carbs: 40, fat: 4 }
          ],
          dinner: [
            { name: "Salmon fillet", quantity: 120, unit: "gram", calories: 300, protein: 40, carbs: 0, fat: 14 },
            { name: "Roasted vegetables", quantity: 1, unit: "cup", calories: 80, protein: 3, carbs: 18, fat: 1 }
          ]
        };
        const fallbackSuggestions = fallbacks[mealType as keyof typeof fallbacks] || fallbacks.breakfast;
        setAiSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
        
        return fallbackSuggestions;
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        title: "Network Error",
        description: "Failed to get AI suggestions. Please check your connection.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageAnalysis = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeImageWithAI(uploadedImage);
    setFoodName(result.name);
    
    toast({
      title: "Image analyzed! 📸",
      description: `Detected: ${result.name} (${result.calories} kcal)`,
    });

    // Clean up
    setUploadedImage(null);
    setImagePreview(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
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

    const nutrition = await analyzeWithAI(foodName, quantity, unit, selectedMeal);
    const foodItem: FoodItem = {
      name: foodName,
      quantity: Number(quantity),
      unit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      mealType: selectedMeal,
      date: today,
      time: new Date().toLocaleTimeString()
    };

    setDailyMeals(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), foodItem]
    }));

    onCaloriesAdd(nutrition.calories, foodItem);

    toast({
      title: "Food added! 🍽️",
      description: `Added ${foodName} (${nutrition.calories} kcal, ${nutrition.protein}g protein)`,
    });

    setFoodName("");
    setQuantity("1");
  };

  const handleAddSuggestedFood = (suggestion: SuggestedFood) => {
    const foodItem: FoodItem = {
      name: suggestion.name,
      quantity: suggestion.quantity,
      unit: suggestion.unit,
      calories: suggestion.calories,
      protein: suggestion.protein || 5,
      carbs: suggestion.carbs || 15,
      fat: suggestion.fat || 3,
      mealType: selectedMeal,
      date: today,
      time: new Date().toLocaleTimeString()
    };

    setDailyMeals(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), foodItem]
    }));

    onCaloriesAdd(suggestion.calories, foodItem);

    toast({
      title: "Food added! ✨",
      description: `Added ${suggestion.name} to ${selectedMeal}`,
    });
  };

  const todayMealsForType = (dailyMeals[today] || []).filter(meal => meal.mealType === selectedMeal);
  const mealStats = todayMealsForType.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const selectedMealType = mealTypes.find(m => m.value === selectedMeal);

  return (
    <div className="space-y-4 w-full">
      {/* Hero Banner */}
      <div className="relative h-32 sm:h-40 rounded-xl overflow-hidden shadow-food">
        <img 
          src={foodBanner} 
          alt="Healthy food banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-dark opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 justify-center">
              <ChefHat className="w-5 h-5" />
              Smart Meal Tracker
            </h2>
            <p className="text-xs sm:text-sm opacity-90">AI-powered nutrition analysis</p>
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
            Add foods manually, with AI analysis, or by photo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meal Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mealTypes.map((meal) => (
              <Button
                key={meal.value}
                variant={selectedMeal === meal.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMeal(meal.value)}
                className={`text-xs h-12 flex-col gap-1 ${
                  selectedMeal === meal.value 
                    ? "gradient-primary text-white shadow-glow" 
                    : "hover:shadow-glow transition-all"
                }`}
              >
                <span className="text-base">{meal.icon}</span>
                <span className="truncate">{meal.label}</span>
              </Button>
            ))}
          </div>

          {/* Current Meal Summary */}
          <div className="gradient-food p-4 rounded-xl text-white">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold capitalize flex items-center gap-2">
                {selectedMealType?.icon} {selectedMeal} Today
              </h4>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {mealStats.calories} kcal
              </Badge>
            </div>
            
            {todayMealsForType.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/20 p-2 rounded-lg text-center">
                    <div className="font-semibold">{Math.round(mealStats.protein)}g</div>
                    <div className="opacity-80">Protein</div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg text-center">
                    <div className="font-semibold">{Math.round(mealStats.carbs)}g</div>
                    <div className="opacity-80">Carbs</div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg text-center">
                    <div className="font-semibold">{Math.round(mealStats.fat)}g</div>
                    <div className="opacity-80">Fat</div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg text-center">
                    <div className="font-semibold">{todayMealsForType.length}</div>
                    <div className="opacity-80">Items</div>
                  </div>
                </div>
                
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {todayMealsForType.map((meal, index) => (
                    <div key={index} className="text-xs bg-white/10 p-2 rounded flex justify-between">
                      <span className="truncate mr-2">{meal.name} ({meal.quantity} {meal.unit})</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-white/80 text-sm">No items added yet for {selectedMeal}</p>
            )}
          </div>

          {/* Image Upload Section */}
          {imagePreview && (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <img 
                  src={imagePreview} 
                  alt="Food preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Food image ready for analysis</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleImageAnalysis}
                      disabled={isAnalyzingImage}
                      size="sm"
                      className="gradient-primary text-white"
                    >
                      {isAnalyzingImage ? (
                        <>
                          <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3 mr-2" />
                          Analyze Food
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Food name (e.g., 2 chapati, banana)"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="compress-input"
              />
            </div>
            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="compress-input"
              step="0.1"
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="compress-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              onClick={handleAddFood}
              disabled={isProcessing || !foodName}
              className="gradient-primary text-white shadow-glow"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </>
              )}
            </Button>

            <Button 
              onClick={() => generateAIMealSuggestion(selectedMeal)}
              disabled={isProcessing}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggest
            </Button>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline"
                className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <Card className="professional-card border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-accent flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI {selectedMeal} Suggestions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="meal-suggestion-card">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-sm">{suggestion.name}</h5>
                      <Badge variant="secondary" className="ml-2">
                        {suggestion.calories} kcal
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                      <div>
                        <div className="font-medium">{suggestion.protein || 5}g</div>
                        <div>Protein</div>
                      </div>
                      <div>
                        <div className="font-medium">{suggestion.carbs || 15}g</div>
                        <div>Carbs</div>
                      </div>
                      <div>
                        <div className="font-medium">{suggestion.fat || 3}g</div>
                        <div>Fat</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {suggestion.quantity} {suggestion.unit}
                      </span>
                      <Button
                        onClick={() => handleAddSuggestedFood(suggestion)}
                        size="sm"
                        className="gradient-primary text-white"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};