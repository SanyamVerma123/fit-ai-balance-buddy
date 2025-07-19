import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Utensils, Plus, Camera, Brain, Mic, X, Edit, Trash2 } from "lucide-react";
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
    const calories = await calculateCalories(foodName, quantity, unit);
    
    const newRecord: FoodRecord = {
      id: Date.now().toString(),
      name: foodName,
      quantity: Number(quantity),
      unit,
      calories,
      mealType: selectedMeal,
      date: new Date().toDateString(),
      time: new Date().toLocaleTimeString()
    };

    // Save to localStorage
    const existingRecords = JSON.parse(localStorage.getItem('mealRecords') || '[]');
    localStorage.setItem('mealRecords', JSON.stringify([...existingRecords, newRecord]));

    toast({
      title: "Meal recorded! 🍽️",
      description: `Added ${foodName} to ${selectedMeal}`,
    });

    // Reset form
    setFoodName("");
    setQuantity("1");
  };

  const calculateCalories = async (food: string, qty: string, unitType: string): Promise<number> => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            {
              role: 'system',
              content: 'Calculate calories for food items. Return only the number.'
            },
            {
              role: 'user',
              content: `Calculate calories for: ${food} - ${qty} ${unitType}`
            }
          ],
          temperature: 0.1,
          max_tokens: 50
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const calorieMatch = content.match(/(\d+)/);
      return calorieMatch ? parseInt(calorieMatch[1]) : 100;
    } catch {
      return 100;
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
              <Button onClick={addFoodRecord} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Suggest
              </Button>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button variant="outline">
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordMeal;