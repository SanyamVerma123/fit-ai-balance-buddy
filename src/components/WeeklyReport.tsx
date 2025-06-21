
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TrendingUp, TrendingDown, Scale, Target } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface DayData {
  date: string;
  weight?: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  caloriesBurned: number;
  exerciseType: string;
  foodItems: any[];
  workoutItems: any[];
}

export function WeeklyReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, [selectedDate]);

  const loadWeeklyData = () => {
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const weightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');

    // Get current week
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekData: DayData[] = [];
    const dataIndicators: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      const dayFoodItems = foodLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === currentDate.toDateString()
      );
      
      const dayWorkouts = workoutLog.filter((item: any) => 
        new Date(item.timestamp).toDateString() === currentDate.toDateString()
      );
      
      const weightEntry = weightEntries.find((entry: any) => 
        new Date(entry.date).toDateString() === currentDate.toDateString()
      );

      const totalCalories = dayFoodItems.reduce((sum: number, item: any) => sum + item.calories, 0);
      const totalProtein = dayFoodItems.reduce((sum: number, item: any) => sum + (item.protein || item.calories * 0.2), 0);
      const totalCarbs = dayFoodItems.reduce((sum: number, item: any) => sum + (item.carbs || item.calories * 0.5), 0);
      const totalFat = dayFoodItems.reduce((sum: number, item: any) => sum + (item.fat || item.calories * 0.3), 0);
      const caloriesBurned = dayWorkouts.reduce((sum: number, item: any) => sum + item.caloriesBurned, 0);

      if (totalCalories > 0 || caloriesBurned > 0 || weightEntry) {
        dataIndicators.push(currentDate);
      }

      weekData.push({
        date: dateString,
        weight: weightEntry?.weight,
        totalCalories,
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        caloriesBurned,
        exerciseType: dayWorkouts.length > 0 ? 
          (dayWorkouts.some((w: any) => w.duration > 45) ? 'Extensive' : 'Normal') : 'None',
        foodItems: dayFoodItems,
        workoutItems: dayWorkouts
      });
    }

    setWeeklyData(weekData);
    setDatesWithData(dataIndicators);
  };

  const getWeeklyAverages = () => {
    const daysWithData = weeklyData.filter(day => day.totalCalories > 0);
    if (daysWithData.length === 0) return null;

    const avgCalories = Math.round(daysWithData.reduce((sum, day) => sum + day.totalCalories, 0) / daysWithData.length);
    const avgProtein = Math.round(daysWithData.reduce((sum, day) => sum + day.totalProtein, 0) / daysWithData.length);
    const avgCarbs = Math.round(daysWithData.reduce((sum, day) => sum + day.totalCarbs, 0) / daysWithData.length);
    const avgBurned = Math.round(daysWithData.reduce((sum, day) => sum + day.caloriesBurned, 0) / daysWithData.length);

    return { avgCalories, avgProtein, avgCarbs, avgBurned };
  };

  const weeklyAverages = getWeeklyAverages();

  return (
    <div className="space-y-6">
      {/* Week Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Weekly Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
            >
              Previous Week
            </Button>
            <span className="font-medium">
              Week of {format(selectedDate, "MMM dd, yyyy")}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
            >
              Next Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Averages */}
      {weeklyAverages && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{weeklyAverages.avgCalories}</div>
              <p className="text-sm text-blue-700">Avg Calories/Day</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{weeklyAverages.avgProtein}g</div>
              <p className="text-sm text-green-700">Avg Protein/Day</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{weeklyAverages.avgCarbs}g</div>
              <p className="text-sm text-orange-700">Avg Carbs/Day</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{weeklyAverages.avgBurned}</div>
              <p className="text-sm text-purple-700">Avg Burned/Day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date for Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDayData ? format(new Date(selectedDayData.date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDayData ? new Date(selectedDayData.date) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const dateString = date.toISOString().split('T')[0];
                    const dayData = weeklyData.find(d => d.date === dateString) || 
                      weeklyData.find(d => new Date(d.date).toDateString() === date.toDateString());
                    setSelectedDayData(dayData || null);
                  }
                }}
                modifiers={{
                  hasData: datesWithData
                }}
                modifiersStyles={{
                  hasData: { 
                    backgroundColor: '#dcfce7',
                    color: '#166534'
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDayData && (
        <Card>
          <CardHeader>
            <CardTitle>Details for {format(new Date(selectedDayData.date), "EEEE, MMMM dd, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{selectedDayData.totalCalories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{selectedDayData.totalProtein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{selectedDayData.totalCarbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{selectedDayData.totalFat}g</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{selectedDayData.caloriesBurned}</div>
                <div className="text-sm text-gray-600">Burned</div>
              </div>
            </div>
            
            {selectedDayData.weight && (
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span className="font-medium">Weight: {selectedDayData.weight} kg</span>
              </div>
            )}

            <Badge variant={selectedDayData.exerciseType === 'Extensive' ? 'default' : 'secondary'}>
              {selectedDayData.exerciseType} Exercise
            </Badge>

            {/* Food Items */}
            {selectedDayData.foodItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Food Items:</h4>
                <div className="space-y-1">
                  {selectedDayData.foodItems.map((item: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {item.name} - {item.calories} cal ({item.mealType})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout Items */}
            {selectedDayData.workoutItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Workouts:</h4>
                <div className="space-y-1">
                  {selectedDayData.workoutItems.map((item: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {item.name} - {item.duration} min ({item.caloriesBurned} cal burned)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
