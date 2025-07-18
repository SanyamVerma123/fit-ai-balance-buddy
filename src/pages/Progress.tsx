
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Scale, Target, Calendar as CalendarIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { WeeklyReport } from "@/components/WeeklyReport";

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
    
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    
    const monthData: {[key: string]: DayData} = {};
    const dataIndicators: Date[] = [];
    
    for (let day = 1; day <= new Date(currentYear, currentMonth + 1, 0).getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayFoodItems = foodLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === date.toDateString()
      );
      
      const dayWorkouts = workoutLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === date.toDateString()
      );
      
      const weightEntry = weightEntries.find(entry => 
        new Date(entry.date).toDateString() === date.toDateString()
      );
      
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
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : userProfile?.weight || 0;
  const firstWeight = weightEntries.length > 0 ? weightEntries[0].weight : userProfile?.weight || 0;
  const weightChange = latestWeight - firstWeight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Progress Tracker
            </h1>
            <p className="text-gray-600">Track your fitness journey</p>
          </div>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily Progress</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {/* Progress Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
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
                    Current: {latestWeight} kg
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Target className="w-5 h-5" />
                    Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.goal === 'gain' ? 'Gaining' : userProfile?.goal === 'loss' ? 'Losing' : 'Maintaining'}
                  </div>
                  <p className="text-sm text-gray-600">
                    Target: {userProfile?.targetWeight || 0} kg
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <TrendingUp className="w-5 h-5" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.abs(weightChange).toFixed(1)} kg
                  </div>
                  <p className="text-sm text-gray-600">
                    {userProfile?.goal === 'gain' ? 'gained' : 'lost'} so far
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Calendar
                  </CardTitle>
                  <CardDescription>
                    Dates with ✓ have recorded data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
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
                      placeholder="Enter your weight"
                      step="0.1"
                    />
                  </div>
                  <Button onClick={handleAddWeight} className="w-full">
                    Record Weight
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Selected Date Details */}
            {selectedDateData && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50 to-blue-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Detailed Analytics for {selectedDate.toDateString()}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Complete nutritional breakdown and activity summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nutrition Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {selectedDateData.totalCalories}
                      </div>
                      <div className="text-sm font-medium text-blue-600">Total Calories</div>
                      <div className="text-xs text-blue-500 mt-1">Energy Intake</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md border border-green-200">
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {selectedDateData.totalProtein}g
                      </div>
                      <div className="text-sm font-medium text-green-600">Protein</div>
                      <div className="text-xs text-green-500 mt-1">Muscle Building</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md border border-orange-200">
                      <div className="text-2xl font-bold text-orange-700 mb-1">
                        {selectedDateData.totalCarbs}g
                      </div>
                      <div className="text-sm font-medium text-orange-600">Carbohydrates</div>
                      <div className="text-xs text-orange-500 mt-1">Quick Energy</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md border border-purple-200">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        {selectedDateData.caloriesBurned}
                      </div>
                      <div className="text-sm font-medium text-purple-600">Calories Burned</div>
                      <div className="text-xs text-purple-500 mt-1">Through Exercise</div>
                    </div>
                  </div>
                  
                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-cyan-700">Exercise Type</span>
                        <span className="text-lg font-bold text-cyan-600">{selectedDateData.exerciseType}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-pink-700">Net Calories</span>
                        <span className="text-lg font-bold text-pink-600">
                          {selectedDateData.totalCalories - selectedDateData.caloriesBurned}
                        </span>
                      </div>
                    </div>
                    
                    {selectedDateData.weight && (
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-emerald-700">Weight Recorded</span>
                          <span className="text-lg font-bold text-emerald-600">{selectedDateData.weight} kg</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nutritional Balance */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <h4 className="font-semibold text-indigo-700 mb-3">Nutritional Balance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Protein %</span>
                        <span className="font-medium text-indigo-600">
                          {selectedDateData.totalCalories > 0 ? Math.round((selectedDateData.totalProtein * 4 / selectedDateData.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Carbs %</span>
                        <span className="font-medium text-indigo-600">
                          {selectedDateData.totalCalories > 0 ? Math.round((selectedDateData.totalCarbs * 4 / selectedDateData.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calorie Deficit/Surplus</span>
                        <span className={`font-medium ${selectedDateData.totalCalories - selectedDateData.caloriesBurned > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {selectedDateData.totalCalories - selectedDateData.caloriesBurned > 0 ? '+' : ''}{selectedDateData.totalCalories - selectedDateData.caloriesBurned}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
