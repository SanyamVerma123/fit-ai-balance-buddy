
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CalorieCounter } from "@/components/CalorieCounter";
import { AiFoodRecognition } from "@/components/AiFoodRecognition";
import { QuickStats } from "@/components/QuickStats";
import { TrendingUp, Target, Activity } from "lucide-react";

const Index = () => {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const calorieProgress = (dailyCalories / calorieGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600">Track your calories and fitness journey with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickStats />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Daily Calorie Goal
              </CardTitle>
              <CardDescription>
                {dailyCalories} / {calorieGoal} calories consumed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={calorieProgress} className="mb-4" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Consumed: {dailyCalories} kcal</span>
                <span>Remaining: {calorieGoal - dailyCalories} kcal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Quick Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="goal">Daily Goal (kcal)</Label>
                <Input
                  id="goal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  placeholder="2000"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CalorieCounter 
            onCaloriesAdd={(calories) => setDailyCalories(prev => prev + calories)}
          />
          <AiFoodRecognition 
            onCaloriesDetected={(calories) => setDailyCalories(prev => prev + calories)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
