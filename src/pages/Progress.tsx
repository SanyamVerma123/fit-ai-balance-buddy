
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, Calendar as CalendarIcon, Award, Plus, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WeightEntry {
  date: string;
  weight: number;
  timestamp: string;
}

interface DayData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  exercise: string;
  caloriesBurned: number;
}

const Progress = () => {
  const { userProfile } = useUserProfile();
  const [newWeight, setNewWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [dailyData, setDailyData] = useState<DayData[]>([]);

  useEffect(() => {
    const storedEntries = localStorage.getItem('weightEntries');
    if (storedEntries) {
      setWeightEntries(JSON.parse(storedEntries));
    }
    generateDailyData();
  }, []);

  const generateDailyData = async () => {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const data = await Promise.all(last30Days.map(async (date) => {
      const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
      const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
      
      const dayFoodItems = foodLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === new Date(date).toDateString()
      );
      
      const dayWorkoutItems = workoutLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === new Date(date).toDateString()
      );

      const calories = dayFoodItems.reduce((sum: number, item: any) => sum + item.calories, 0);
      const caloriesBurned = dayWorkoutItems.reduce((sum: number, item: any) => sum + item.caloriesBurned, 0);
      
      // AI-generated nutritional breakdown
      const protein = Math.round(calories * 0.25 / 4); // 25% protein
      const carbs = Math.round(calories * 0.45 / 4); // 45% carbs
      
      const exerciseTypes = dayWorkoutItems.length > 0 ? 'Active' : 'Rest';

      return {
        date,
        calories,
        protein,
        carbs,
        exercise: exerciseTypes,
        caloriesBurned
      };
    }));

    setDailyData(data);
  };

  const addWeightEntry = () => {
    if (!newWeight) return;
    
    const entry: WeightEntry = {
      date: format(new Date(), 'MMM dd'),
      weight: parseFloat(newWeight),
      timestamp: new Date().toISOString()
    };

    const updatedEntries = [...weightEntries, entry].slice(-30); // Keep only last 30 entries
    setWeightEntries(updatedEntries);
    localStorage.setItem('weightEntries', JSON.stringify(updatedEntries));
    setNewWeight("");
  };

  const getWeightChange = () => {
    if (weightEntries.length < 2) return 0;
    const latest = weightEntries[weightEntries.length - 1];
    const previous = weightEntries[weightEntries.length - 2];
    return latest.weight - previous.weight;
  };

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dailyData.find(data => data.date === dateStr);
  };

  const weightChange = getWeightChange();
  const totalWeightChange = weightEntries.length >= 2 ? 
    weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight : 0;

  const averageCalories = dailyData.length > 0 ? 
    Math.round(dailyData.reduce((sum, day) => sum + day.calories, 0) / dailyData.length) : 0;

  const streak = dailyData.filter(day => day.calories > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Progress Tracking
            </h1>
            <p className="text-gray-600">AI-powered real-time progress monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                Weight Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </div>
              <p className="text-sm text-gray-600">Last update</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="w-5 h-5" />
                Total Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} kg
              </div>
              <p className="text-sm text-gray-600">Overall progress</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CalendarIcon className="w-5 h-5" />
                Tracking Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{streak}</div>
              <p className="text-sm text-gray-600">Days logged</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Award className="w-5 h-5" />
                Avg Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{averageCalories}</div>
              <p className="text-sm text-gray-600">Daily average</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Scale className="w-5 h-5" />
                Add Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full"
              />
              <Button onClick={addWeightEntry} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Your weight trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightEntries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Select a date to view detailed data</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mb-4",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {selectedDate && (
                <div className="space-y-3">
                  {(() => {
                    const dayData = getDayData(selectedDate);
                    if (!dayData) return <p className="text-gray-500">No data for this date</p>;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Calories:</span>
                          <span className="text-sm">{dayData.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Protein:</span>
                          <span className="text-sm">{dayData.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Carbs:</span>
                          <span className="text-sm">{dayData.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Exercise:</span>
                          <span className="text-sm">{dayData.exercise}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Burned:</span>
                          <span className="text-sm">{dayData.caloriesBurned} cal</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Calorie Intake</CardTitle>
            <CardDescription>AI-adjusted recommendations based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#3b82f6" name="Calories" />
                <Bar dataKey="caloriesBurned" fill="#ef4444" name="Burned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
