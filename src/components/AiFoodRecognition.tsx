
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
  const [detectedFood, setDetectedFood] = useState<{name: string, calories: number} | null>(null);
  const { toast } = useToast();

  const simulateAIRecognition = async (input: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI response based on input
    const foodDatabase: Record<string, number> = {
      'apple': 95,
      'banana': 105,
      'rice': 130,
      'chicken': 165,
      'bread': 80,
      'egg': 70,
      'pasta': 200,
      'pizza': 300,
      'burger': 550,
      'salad': 150,
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
      // Default estimation for unknown foods
      detectedItem = input;
      calories = Math.floor(Math.random() * 300) + 100;
    }

    setDetectedFood({ name: detectedItem, calories });
    setIsProcessing(false);
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

    await simulateAIRecognition(description);
  };

  const handleAddDetectedFood = () => {
    if (detectedFood) {
      onCaloriesDetected(detectedFood.calories);
      toast({
        title: "AI Detection Added!",
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
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 capitalize">{detectedFood.name}</span>
              <span className="text-purple-600 font-bold">{detectedFood.calories} kcal</span>
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
