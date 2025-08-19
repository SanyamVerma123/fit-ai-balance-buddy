import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Utensils, Plus, Camera, Brain, Mic, X, Edit, Trash2, ArrowLeft, Sparkles, Upload } from "lucide-react";
import { FoodHistory } from "@/components/FoodHistory";
import { useToast } from "@/hooks/use-toast";
import breakfastImg from "@/assets/breakfast-foods.jpg";
import lunchImg from "@/assets/lunch-foods.jpg";
import dinnerImg from "@/assets/dinner-foods.jpg";

interface FoodRecord {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  mealType: string;
  date: string;
  time: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅', image: breakfastImg },
  { value: 'lunch', label: 'Lunch', icon: '☀️', image: lunchImg },
  { value: 'dinner', label: 'Dinner', icon: '🌙', image: dinnerImg },
  { value: 'snacks', label: 'Snacks', icon: '🍎', image: breakfastImg },
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

const RecordMeal = () => {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("piece");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleMealSelection = (mealType: string) => {
    setSelectedMeal(mealType);
  };

  const addFoodRecord = async () => {
    if (!foodName || !quantity || !selectedMeal) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Calculate calories using AI
    const nutrition = await calculateNutrition(foodName, quantity, unit);
    
    const newRecord: FoodRecord = {
      id: Date.now().toString(),
      name: foodName,
      quantity: Number(quantity),
      unit,
      calories: nutrition.calories,
      mealType: selectedMeal,
      date: new Date().toDateString(),
      time: new Date().toLocaleTimeString()
    };

    // Save to localStorage for dailyFoodLog (used by charts and dashboard)
    const existingLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const foodLogEntry = {
      ...newRecord,
      timestamp: new Date().toISOString(),
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    };
    localStorage.setItem('dailyFoodLog', JSON.stringify([...existingLog, foodLogEntry]));

    // Save to dailyMeals for meal tracker
    const existingMeals = JSON.parse(localStorage.getItem('dailyMeals') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const updatedMeals = {
      ...existingMeals,
      [today]: [...(existingMeals[today] || []), {
        ...newRecord,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat
      }]
    };
    localStorage.setItem('dailyMeals', JSON.stringify(updatedMeals));

    // Trigger storage events for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyFoodLog',
      newValue: JSON.stringify([...existingLog, foodLogEntry])
    }));

    toast({
      title: "Meal recorded! 🍽️",
      description: `Added ${foodName} to ${selectedMeal} (${nutrition.calories} kcal)`,
    });

    // Reset form
    setFoodName("");
    setQuantity("1");
  };

  const calculateNutrition = async (food: string, qty: string, unitType: string): Promise<{calories: number, protein: number, carbs: number, fat: number}> => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Analyze food and return detailed nutrition. Return ONLY JSON: {"calories": number, "protein": number, "carbs": number, "fat": number}'
            },
            {
              role: 'user',
              content: `Calculate nutrition for: ${food} - ${qty} ${unitType}`
            }
          ],
          temperature: 0.1,
          max_tokens: 150
        }),
      });

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
        return { calories: 100, protein: 5, carbs: 15, fat: 3 };
      }
    } catch {
      return { calories: 100, protein: 5, carbs: 15, fat: 3 };
    }
  };

  const generateAISuggestion = async () => {
    // AI suggestion logic here
    toast({
      title: "AI Suggestions coming soon!",
      description: "This feature will suggest meals based on your preferences",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setIsAnalyzing(true);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Analyze food images and return JSON: {"name": "food_name", "quantity": number, "unit": "unit_type", "calories": number}'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Identify this food and estimate quantity, unit, and calories.'
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

      const data = await response.json();
      const content = data.choices[0].message.content;
      
        try {
          const parsed = JSON.parse(content);
          setFoodName(parsed.name || 'Food from image');
          setQuantity(parsed.quantity?.toString() || '1');
          setUnit(parsed.unit || 'piece');
          
          // Also calculate nutrition if detected
          if (parsed.name) {
            const nutrition = await calculateNutrition(parsed.name, parsed.quantity?.toString() || '1', parsed.unit || 'piece');
            // Store the nutrition data for when user adds the food
          }
          
          toast({
            title: "Food Detected! 📸",
            description: `Found: ${parsed.name || 'Food from image'} (${parsed.calories || 0} kcal)`,
          });
        } catch {
          setFoodName('Food from image');
          toast({
            title: "Photo uploaded! 📸",
            description: "Please enter food details manually",
          });
        }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please enter food details manually",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadedImage(null);
    }
  };
  
  if (!selectedMeal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 w-full overflow-x-hidden">
        <div className="p-3 sm:p-4 lg:p-6 max-w-full">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                Record Your Meals
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Choose a meal type to start recording</p>
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            {mealTypes.map((meal) => (
              <Card 
                key={meal.value}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md"
                onClick={() => handleMealSelection(meal.value)}
              >
                <div 
                  className="h-32 bg-cover bg-center rounded-t-lg relative"
                  style={{ backgroundImage: `url(${meal.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">{meal.icon}</span>
                      {meal.label}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Track your {meal.label.toLowerCase()} intake</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedMealData = mealTypes.find(m => m.value === selectedMeal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 lg:p-6 max-w-full">
        {/* Header with Banner */}
        <div 
          className="relative mb-4 sm:mb-6 lg:mb-8 rounded-xl overflow-hidden shadow-xl"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${selectedMealData?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '120px'
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
            <SidebarTrigger className="text-white" />
            <Button
              variant="ghost"
              onClick={() => setSelectedMeal(null)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-tight drop-shadow-lg flex items-center gap-2">
                <span className="text-2xl">{selectedMealData?.icon}</span>
                {selectedMealData?.label} Recording
              </h1>
              <p className="text-xs sm:text-sm text-gray-200 truncate drop-shadow-md">Add foods to your {selectedMealData?.label.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Food Input Form */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Add Food Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Food name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={addFoodRecord} className="flex-1 gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
              <Button 
                variant="outline"
                onClick={() => generateAISuggestion()}
                className="hover:shadow-glow transition-all"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Suggest
              </Button>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('photo-input')?.click()}
                className="hover:shadow-glow transition-all"
              >
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food History Section */}
      <div className="max-w-2xl mx-auto">
        <FoodHistory onAddFood={(food) => {
          // When user adds food from history, redirect and populate form
          const todayKey = new Date().toISOString().split('T')[0];
          const mealTime = new Date().toLocaleTimeString();
          
          // Add to storage
          const existingMeals = JSON.parse(localStorage.getItem('dailyMeals') || '{}');
          const updatedMeals = {
            ...existingMeals,
            [todayKey]: [...(existingMeals[todayKey] || []), {
              ...food,
              date: todayKey,
              time: mealTime
            }]
          };
          localStorage.setItem('dailyMeals', JSON.stringify(updatedMeals));
          
          // Also add to dailyFoodLog for consistency
          const existingLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
          existingLog.push({
            ...food,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('dailyFoodLog', JSON.stringify(existingLog));
          
          // Trigger storage events
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'dailyMeals',
            newValue: JSON.stringify(updatedMeals)
          }));
        }} />
      </div>
    </div>
  );
};

export default RecordMeal;