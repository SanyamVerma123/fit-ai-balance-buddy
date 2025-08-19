
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiFoodRecognitionProps {
  onCaloriesDetected: (calories: number) => void;
}

export const AiFoodRecognition = ({ onCaloriesDetected }: AiFoodRecognitionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState("");
  const [detectedFood, setDetectedFood] = useState<{name: string, calories: number, protein?: number, carbs?: number, fat?: number, category?: string} | null>(null);
  const { toast } = useToast();

  const analyzeWithAI = async (input: string) => {
    setIsProcessing(true);
    
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
              content: 'Analyze food descriptions and return JSON: {"name": "food_name", "quantity": number, "unit": "unit_type", "calories": number, "protein": number, "carbs": number, "fat": number, "category": "food_category"}. Be accurate with nutrition data.'
            },
            {
              role: 'user',
              content: `Analyze this food description and estimate nutrition: ${input}`
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze food');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        setDetectedFood({ 
          name: parsed.name || input, 
          calories: parsed.calories || 150,
          protein: parsed.protein || 0,
          carbs: parsed.carbs || 0,
          fat: parsed.fat || 0,
          category: parsed.category || 'other'
        });
      } catch {
        // Fallback to simple estimation
        const foodDatabase: Record<string, number> = {
          'apple': 95, 'banana': 105, 'rice': 130, 'chicken': 165, 'bread': 80,
          'egg': 70, 'pasta': 200, 'pizza': 300, 'burger': 550, 'salad': 150,
        };

        const words = input.toLowerCase().split(' ');
        let detectedItem = null;
        let calories = 0;

        for (const word of words) {
          for (const [food, cal] of Object.entries(foodDatabase)) {
            if (word.includes(food) || food.includes(word)) {
              detectedItem = food;
              calories = cal;
              break;
            }
          }
          if (detectedItem) break;
        }

        if (!detectedItem) {
          detectedItem = input;
          calories = Math.floor(Math.random() * 300) + 100;
        }

        setDetectedFood({ name: detectedItem, calories });
      }
    } catch (error) {
      console.error('AI food analysis failed:', error);
      // Use fallback method
      const foodDatabase: Record<string, number> = {
        'apple': 95, 'banana': 105, 'rice': 130, 'chicken': 165, 'bread': 80,
        'egg': 70, 'pasta': 200, 'pizza': 300, 'burger': 550, 'salad': 150,
      };

      const words = input.toLowerCase().split(' ');
      let detectedItem = null;
      let calories = 0;

      for (const word of words) {
        for (const [food, cal] of Object.entries(foodDatabase)) {
          if (word.includes(food) || food.includes(word)) {
            detectedItem = food;
            calories = cal;
            break;
          }
        }
        if (detectedItem) break;
      }

      if (!detectedItem) {
        detectedItem = input;
        calories = Math.floor(Math.random() * 300) + 100;
      }

      setDetectedFood({ name: detectedItem, calories });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!description.trim()) {
      toast({
        title: "No description provided",
        description: "Please describe the food you want to analyze",
        variant: "destructive",
      });
      return;
    }

    await analyzeWithAI(description);
  };

  const handleAddDetectedFood = () => {
    if (detectedFood) {
      const foodItem = {
        name: detectedFood.name,
        calories: detectedFood.calories,
        protein: detectedFood.protein || 0,
        carbs: detectedFood.carbs || 0,
        fat: detectedFood.fat || 0,
        quantity: 1,
        unit: 'serving',
        mealType: 'snack'
      };
      
      // Save to localStorage with proper structure
      const existingLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
      const newFood = {
        id: Date.now(),
        ...foodItem,
        timestamp: new Date().toISOString()
      };
      existingLog.push(newFood);
      localStorage.setItem('dailyFoodLog', JSON.stringify(existingLog));
      
      // Also save to dailyMeals for record section
      const existingMeals = JSON.parse(localStorage.getItem('dailyMeals') || '{}');
      const todayKey = new Date().toISOString().split('T')[0];
      const updatedMeals = {
        ...existingMeals,
        [todayKey]: [...(existingMeals[todayKey] || []), {
          ...foodItem,
          date: todayKey,
          time: new Date().toLocaleTimeString()
        }]
      };
      localStorage.setItem('dailyMeals', JSON.stringify(updatedMeals));
      
      // Trigger storage events
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dailyFoodLog',
        newValue: JSON.stringify(existingLog)
      }));
      
      onCaloriesDetected(detectedFood.calories);
      toast({
        title: "Food Added Successfully! 🍽️",
        description: `Added ${detectedFood.name} (${detectedFood.calories} kcal) to your daily intake`,
      });
      setDetectedFood(null);
      setDescription("");
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Food Recognition
        </CardTitle>
        <CardDescription>
          Describe your food and let AI estimate the calories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodDescription">Describe your food</Label>
          <Input
            id="foodDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., grilled chicken breast with rice and vegetables"
            disabled={isProcessing}
          />
        </div>

        <Button 
          onClick={handleAIAnalysis}
          disabled={isProcessing || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Analyze with AI
            </>
          )}
        </Button>

        {detectedFood && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-700 mb-2">AI Detection Result:</h4>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 capitalize font-medium">{detectedFood.name}</span>
                <span className="text-purple-600 font-bold">{detectedFood.calories} kcal</span>
              </div>
              {(detectedFood.protein || detectedFood.carbs || detectedFood.fat) && (
                <div className="text-xs text-gray-600 grid grid-cols-3 gap-2">
                  {detectedFood.protein && <div>Protein: {detectedFood.protein}g</div>}
                  {detectedFood.carbs && <div>Carbs: {detectedFood.carbs}g</div>}
                  {detectedFood.fat && <div>Fat: {detectedFood.fat}g</div>}
                </div>
              )}
              {detectedFood.category && (
                <div className="text-xs text-purple-600 capitalize">Category: {detectedFood.category}</div>
              )}
            </div>
            <Button 
              onClick={handleAddDetectedFood}
              size="sm"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Add to Daily Intake
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: For more accurate results, be specific about portion sizes and cooking methods
        </div>
      </CardContent>
    </Card>
  );
};
