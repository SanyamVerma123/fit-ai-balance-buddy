import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { TrendingUp, Scale, Target, Calendar as CalendarIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface WeightEntry {
  date: string;
  weight: number;
  timestamp: string;
}

interface DayData {
  date: string;
  weight?: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  caloriesBurned: number;
  exerciseType: string;
}

export default function Progress() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newWeight, setNewWeight] = useState("");
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<{[key: string]: DayData}>({});
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  useEffect(() => {
    loadStoredData();
    calculateMonthlyData();
  }, []);

  useEffect(() => {
    calculateMonthlyData();
  }, [selectedDate]);

  const loadStoredData = () => {
    const stored = localStorage.getItem('weightEntries');
    if (stored) {
      setWeightEntries(JSON.parse(stored));
    }
  };

  const calculateMonthlyData = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    // Load food and workout data
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    
    const monthData: {[key: string]: DayData} = {};
    const dataIndicators: Date[] = [];
    
    // Process each day in the current month
    for (let day = 1; day <= new Date(currentYear, currentMonth + 1, 0).getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Filter data for this specific date
      const dayFoodItems = foodLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === date.toDateString()
      );
      
      const dayWorkouts = workoutLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === date.toDateString()
      );
      
      const weightEntry = weightEntries.find(entry => 
        new Date(entry.date).toDateString() === date.toDateString()
      );
      
      // Calculate daily totals
      const totalCalories = dayFoodItems.reduce((sum: number, item: any) => sum + item.calories, 0);
      const totalProtein = dayFoodItems.reduce((sum: number, item: any) => sum + (item.protein || item.calories * 0.2), 0);
      const totalCarbs = dayFoodItems.reduce((sum: number, item: any) => sum + (item.carbs || item.calories * 0.5), 0);
      const caloriesBurned = dayWorkouts.reduce((sum: number, item: any) => sum + item.caloriesBurned, 0);
      const exerciseType = dayWorkouts.length > 0 ? 
        (dayWorkouts.some((w: any) => w.duration > 45) ? 'Extensive' : 'Normal') : 'None';
      
      if (totalCalories > 0 || caloriesBurned > 0 || weightEntry) {
        monthData[dateString] = {
          date: dateString,
          weight: weightEntry?.weight,
          totalCalories,
          totalProtein: Math.round(totalProtein),
          totalCarbs: Math.round(totalCarbs),
          caloriesBurned,
          exerciseType
        };
        
        dataIndicators.push(date);
      }
    }
    
    setMonthlyData(monthData);
    setDatesWithData(dataIndicators);
  };

  const handleAddWeight = () => {
    if (!newWeight) {
      toast({
        title: "Missing weight",
        description: "Please enter your current weight",
        variant: "destructive",
      });
      return;
    }

    const weightEntry: WeightEntry = {
      date: selectedDate.toISOString().split('T')[0],
      weight: Number(newWeight),
      timestamp: new Date().toISOString()
    };

    const updatedEntries = [...weightEntries.filter(entry => entry.date !== weightEntry.date), weightEntry];
    setWeightEntries(updatedEntries);
    localStorage.setItem('weightEntries', JSON.stringify(updatedEntries));
    
    calculateMonthlyData();
    
    toast({
      title: "Weight recorded!",
      description: `Weight updated to ${newWeight} kg for ${selectedDate.toDateString()}`,
    });

    setNewWeight("");
  };

  const selectedDateData = monthlyData[selectedDate.toISOString().split('T')[0]];
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const firstWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const weightChange = latestWeight - firstWeight;

  // AI-powered weekly adjustment logic
  const getWeeklyCalorieAdjustment = () => {
    const last7Days = Object.values(monthlyData)
      .filter(day => {
        const dayDate = new Date(day.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return dayDate >= weekAgo;
      });

    if (last7Days.length === 0) return 0;

    const avgCalories = last7Days.reduce((sum, day) => sum + day.totalCalories, 0) / last7Days.length;
    const avgBurned = last7Days.reduce((sum, day) => sum + day.caloriesBurned, 0) / last7Days.length;
    const netCalories = avgCalories - avgBurned;

    // AI logic for calorie adjustment based on goal
    if (userProfile?.goal === 'gain' && weightChange < 0.2) {
      return Math.round(netCalories * 0.1); // Increase calories by 10%
    } else if (userProfile?.goal === 'loss' && weightChange > -0.2) {
      return Math.round(netCalories * -0.1); // Decrease calories by 10%
    }
    
    return 0;
  };

  const calorieAdjustment = getWeeklyCalorieAdjustment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Progress Tracker
            </h1>
            <p className="text-gray-600">AI-powered real-time progress monitoring</p>
          </div>
        </div>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Scale className="w-5 h-5" />
                Weight Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </div>
              <p className="text-sm text-gray-600">
                Current: {latestWeight} kg | Started: {firstWeight} kg
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Target className="w-5 h-5" />
                Goal Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userProfile?.goal === 'gain' ? 'Gaining' : userProfile?.goal === 'loss' ? 'Losing' : 'Maintaining'}
              </div>
              <p className="text-sm text-gray-600">
                {Math.abs(weightChange)} kg {userProfile?.goal === 'gain' ? 'gained' : 'lost'} so far
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                AI Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {calorieAdjustment > 0 ? '+' : ''}{calorieAdjustment} kcal
              </div>
              <p className="text-sm text-gray-600">
                Recommended weekly adjustment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar with Data Indicators */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Data Calendar
              </CardTitle>
              <CardDescription>
                Dates with checkmarks have recorded data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasData: datesWithData
                }}
                modifiersStyles={{
                  hasData: { 
                    position: 'relative',
                  }
                }}
                components={{
                  DayContent: ({ date }) => {
                    const hasData = datesWithData.some(dataDate => 
                      dataDate.toDateString() === date.toDateString()
                    );
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {hasData && (
                          <Check className="w-3 h-3 text-green-600 absolute -top-1 -right-1" />
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Weight Entry */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Record Weight</CardTitle>
              <CardDescription>
                Add weight for {selectedDate.toDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Enter current weight"
                  step="0.1"
                />
              </div>
              <Button onClick={handleAddWeight} className="w-full">
                Record Weight
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        {selectedDateData && (
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Data for {selectedDate.toDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {selectedDateData.totalCalories}
                  </div>
                  <div className="text-sm text-gray-600">Calories Intake</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {selectedDateData.totalProtein}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {selectedDateData.totalCarbs}g
                  </div>
                  <div className="text-sm text-gray-600">Carbohydrates</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {selectedDateData.caloriesBurned}
                  </div>
                  <div className="text-sm text-gray-600">Calories Burned</div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <Badge variant={selectedDateData.exerciseType === 'Extensive' ? 'default' : 'secondary'}>
                  {selectedDateData.exerciseType} Exercise
                </Badge>
                {selectedDateData.weight && (
                  <div className="text-lg font-medium">
                    Weight: {selectedDateData.weight} kg
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
