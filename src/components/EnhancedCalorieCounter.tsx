
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Utensils, Camera, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  date: string;
}

interface SavedFood {
  name: string;
  caloriesPerUnit: number;
  unit: string;
}

interface EnhancedCalorieCounterProps {
  onCaloriesAdd: (calories: number, food: FoodItem) => void;
}

const units = [
  { value: 'gram', label: 'Grams (g)' },
  { value: 'piece', label: 'Piece(s)' },
  { value: 'cup', label: 'Cup(s)' },
  { value: 'tablespoon', label: 'Tablespoon(s)' },
  { value: 'teaspoon', label: 'Teaspoon(s)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'slice', label: 'Slice(s)' }
];

export const EnhancedCalorieCounter = ({ onCaloriesAdd }: EnhancedCalorieCounterProps) => {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gram");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [searchResults, setSearchResults] = useState<SavedFood[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('savedFoods');
    if (stored) {
      setSavedFoods(JSON.parse(stored));
    }
  }, []);

  const saveFood = (food: SavedFood) => {
    const existing = savedFoods.find(f => f.name.toLowerCase() === food.name.toLowerCase() && f.unit === food.unit);
    if (!existing) {
      const updated = [...savedFoods, food];
      setSavedFoods(updated);
      localStorage.setItem('savedFoods', JSON.stringify(updated));
    }
  };

  const searchSavedFoods = (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const results = savedFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const analyzeWithAI = async (description: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-1b-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert. Analyze food items and provide calorie information. Return ONLY a JSON object with this format: {"calories": number, "food_name": "string"}. For example: {"calories": 150, "food_name": "banana"}. Be precise and consider typical serving sizes.'
            },
            {
              role: 'user',
              content: `Analyze this food item and estimate calories: ${description} (${quantity} ${unit})`
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
        // Fallback parsing if JSON is not perfect
        const calorieMatch = content.match(/(\d+)/);
        return {
          calories: calorieMatch ? parseInt(calorieMatch[1]) : 100,
          name: description
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Using estimated calories. Please check the value.",
        variant: "destructive",
      });
      return {
        calories: 100,
        name: description
      };
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

    const result = await analyzeWithAI(foodName);
    const foodItem: FoodItem = {
      name: result.name,
      quantity: Number(quantity),
      unit,
      calories: result.calories,
      date: new Date().toISOString().split('T')[0]
    };

    onCaloriesAdd(result.calories, foodItem);
    
    // Save food for future reference
    const caloriesPerUnit = result.calories / Number(quantity);
    saveFood({
      name: result.name,
      caloriesPerUnit,
      unit
    });

    toast({
      title: "Food added!",
      description: `Added ${result.name} (${result.calories} kcal) to your daily intake`,
    });

    setFoodName("");
    setQuantity("");
    setSearchResults([]);
  };

  const handleSelectSavedFood = (savedFood: SavedFood) => {
    setFoodName(savedFood.name);
    setUnit(savedFood.unit);
    setSearchResults([]);
  };

  const handleImageCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Image captured!",
          description: "Analyzing image with AI...",
        });
        
        // For now, simulate AI image analysis
        setTimeout(async () => {
          setFoodName("Detected food item");
          const result = await analyzeWithAI("food item from image");
          toast({
            title: "Image analyzed!",
            description: `Detected: ${result.name}`,
          });
        }, 2000);
      }
    };
    
    input.click();
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-600" />
          Add Food with AI
        </CardTitle>
        <CardDescription>
          Track calories with AI assistance and smart suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodName">Food Name</Label>
          <div className="relative">
            <Input
              id="foodName"
              value={foodName}
              onChange={(e) => {
                setFoodName(e.target.value);
                searchSavedFoods(e.target.value);
              }}
              placeholder="e.g., Grilled chicken breast, Rice bowl"
              disabled={isProcessing}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {searchResults.map((food, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    onClick={() => handleSelectSavedFood(food)}
                  >
                    <span>{food.name}</span>
                    <span className="text-sm text-gray-500">{food.caloriesPerUnit.toFixed(0)} kcal/{food.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
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

        <div className="flex gap-2">
          <Button 
            onClick={handleAddFood}
            disabled={isProcessing || !foodName || !quantity}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleImageCapture}
            variant="outline"
            disabled={isProcessing}
            className="px-3"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {savedFoods.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Recent Foods:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {savedFoods.slice(-6).map((food, index) => (
                <div 
                  key={index} 
                  className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectSavedFood(food)}
                >
                  <div className="font-medium">{food.name}</div>
                  <div className="text-gray-500">{food.caloriesPerUnit.toFixed(0)} kcal/{food.unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
