
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalorieCounterProps {
  onCaloriesAdd: (calories: number) => void;
}

export const CalorieCounter = ({ onCaloriesAdd }: CalorieCounterProps) => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [recentFoods, setRecentFoods] = useState<Array<{name: string, calories: number}>>([]);
  const { toast } = useToast();

  const handleAddFood = () => {
    if (!foodName || !calories) {
      toast({
        title: "Missing information",
        description: "Please enter both food name and calories",
        variant: "destructive",
      });
      return;
    }

    const calorieValue = Number(calories);
    onCaloriesAdd(calorieValue);
    setRecentFoods(prev => [...prev, { name: foodName, calories: calorieValue }].slice(-5));
    
    toast({
      title: "Food added!",
      description: `Added ${foodName} (${calories} kcal) to your daily intake`,
    });

    setFoodName("");
    setCalories("");
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-600" />
          Add Food Manually
        </CardTitle>
        <CardDescription>
          Track your calories by adding foods manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodName">Food Name</Label>
          <Input
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="e.g., Banana, Rice, Chicken"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="calories">Calories (kcal)</Label>
          <Input
            id="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 150"
          />
        </div>

        <Button 
          onClick={handleAddFood}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Food
        </Button>

        {recentFoods.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Foods:</h4>
            <div className="space-y-1">
              {recentFoods.map((food, index) => (
                <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                  <span>{food.name}</span>
                  <span className="text-green-600 font-medium">{food.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
