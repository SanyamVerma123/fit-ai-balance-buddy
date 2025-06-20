import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Camera, Brain, Clock, Upload, X, Check } from "lucide-react";
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

interface SuggestedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
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
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedFood[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
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
              content: 'You are a nutrition expert. Suggest healthy meal items. Return ONLY a JSON array with this format: [{"name": "food_name", "quantity": number, "unit": "unit_type", "calories": number}]. Maximum 3-4 items. Keep responses short and practical.'
            },
            {
              role: 'user',
              content: `Suggest a healthy ${mealType} for someone who wants to ${goalInfo} weight. Diet: ${dietInfo}. Include portions and calories.`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
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
        return suggestions;
      } catch {
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
        const fallbackSuggestions = fallbacks[mealType as keyof typeof fallbacks] || fallbacks.breakfast;
        setAiSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
        return fallbackSuggestions;
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeImageWithAI = async (imageFile: File, description: string) => {
    setIsAnalyzingImage(true);
    try {
      // Convert image to base64
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
              content: 'Analyze food images and provide name and calories. Return ONLY JSON: {"name": "food_name", "calories": number}. Be precise with quantity described.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Identify this food and calculate calories. Additional info: ${description}. Consider the quantity mentioned.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 100
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
          name: parsed.name || 'Unknown food',
          calories: parsed.calories || 100
        };
      } catch {
        return {
          name: 'Food from image',
          calories: 150
        };
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        name: 'Food from image',
        calories: 150
      };
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
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

    const result = await analyzeImageWithAI(uploadedImage, imageDescription);
    setFoodName(result.name);
    
    toast({
      title: "Image analyzed!",
      description: `Detected: ${result.name} (${result.calories} kcal)`,
    });

    setUploadedImage(null);
    setImageDescription("");
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

  const handleAddSuggestedFood = (suggestion: SuggestedFood) => {
    const foodItem: FoodItem = {
      name: suggestion.name,
      quantity: suggestion.quantity,
      unit: suggestion.unit,
      calories: suggestion.calories,
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
      title: "Food added!",
      description: `Added ${suggestion.name} to ${selectedMeal} (${suggestion.calories} kcal)`,
    });
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
          onClick={() => generateAIMealSuggestion(selectedMeal)}
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

        {/* AI Suggestions Display */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-purple-700">AI {selectedMeal} Suggestions</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-600">
                      {suggestion.quantity} {suggestion.unit} • {suggestion.calories} kcal
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedSuggestions = aiSuggestions.filter((_, i) => i !== index);
                        setAiSuggestions(updatedSuggestions);
                        if (updatedSuggestions.length === 0) setShowSuggestions(false);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAddSuggestedFood(suggestion);
                        const updatedSuggestions = aiSuggestions.filter((_, i) => i !== index);
                        setAiSuggestions(updatedSuggestions);
                        if (updatedSuggestions.length === 0) setShowSuggestions(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Add Food by Image
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="imageUpload">Upload Food Image</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {uploadedImage && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="imageDescription">Describe quantity & details</Label>
                  <Input
                    id="imageDescription"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="e.g., 2 slices, 1 cup, medium size"
                  />
                </div>
                
                <Button
                  onClick={handleImageAnalysis}
                  disabled={isAnalyzingImage}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {isAnalyzingImage ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

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
