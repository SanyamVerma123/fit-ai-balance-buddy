import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, Clock, Flame, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import workoutBanner from "@/assets/workout-banner.jpg";

interface WorkoutItem {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  timestamp: string;
  type: string;
}

interface WorkoutTrackerProps {
  onWorkoutAdd?: (workout: WorkoutItem) => void;
}

const workoutTypes = [
  { value: 'cardio', label: 'Cardio', icon: '🏃', calories: 8 },
  { value: 'strength', label: 'Strength', icon: '💪', calories: 6 },
  { value: 'yoga', label: 'Yoga', icon: '🧘', calories: 3 },
  { value: 'sports', label: 'Sports', icon: '⚽', calories: 10 },
  { value: 'walking', label: 'Walking', icon: '🚶', calories: 4 },
  { value: 'cycling', label: 'Cycling', icon: '🚴', calories: 7 },
  { value: 'swimming', label: 'Swimming', icon: '🏊', calories: 11 },
  { value: 'dancing', label: 'Dancing', icon: '💃', calories: 5 }
];

export const WorkoutTracker = ({ onWorkoutAdd }: WorkoutTrackerProps) => {
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState("cardio");
  const [duration, setDuration] = useState("30");
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutItem[]>([]);
  const { toast } = useToast();

  const today = new Date().toDateString();

  useEffect(() => {
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]')
      .filter((item: WorkoutItem) => new Date(item.timestamp).toDateString() === today);
    setTodayWorkouts(workoutLog);
  }, [today]);

  const addWorkout = () => {
    if (!workoutName || !duration) {
      toast({
        title: "Missing information",
        description: "Please enter workout name and duration",
        variant: "destructive",
      });
      return;
    }

    const selectedType = workoutTypes.find(type => type.value === workoutType);
    const caloriesBurned = Math.round((selectedType?.calories || 6) * parseInt(duration));

    const workoutItem: WorkoutItem = {
      id: Date.now().toString(),
      name: workoutName,
      duration: parseInt(duration),
      caloriesBurned,
      timestamp: new Date().toISOString(),
      type: workoutType
    };

    const updatedWorkouts = [...todayWorkouts, workoutItem];
    setTodayWorkouts(updatedWorkouts);

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const newLog = [...existingLog, workoutItem];
    localStorage.setItem('dailyWorkoutLog', JSON.stringify(newLog));

    // Trigger storage event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyWorkoutLog',
      newValue: JSON.stringify(newLog)
    }));

    if (onWorkoutAdd) {
      onWorkoutAdd(workoutItem);
    }

    toast({
      title: "Workout Added! 💪",
      description: `Added ${workoutName} (${caloriesBurned} calories burned)`,
    });

    setWorkoutName("");
    setDuration("30");
  };

  const removeWorkout = (id: string) => {
    const updatedWorkouts = todayWorkouts.filter(workout => workout.id !== id);
    setTodayWorkouts(updatedWorkouts);

    // Update localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const newLog = existingLog.filter((workout: WorkoutItem) => workout.id !== id);
    localStorage.setItem('dailyWorkoutLog', JSON.stringify(newLog));

    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyWorkoutLog',
      newValue: JSON.stringify(newLog)
    }));

    toast({
      title: "Workout Removed",
      description: "Workout has been removed from your log",
    });
  };

  const totalCaloriesBurned = todayWorkouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
  const totalDuration = todayWorkouts.reduce((sum, workout) => sum + workout.duration, 0);

  return (
    <div className="space-y-4 w-full">
      {/* Hero Banner */}
      <div className="relative h-32 sm:h-40 rounded-xl overflow-hidden shadow-elegant">
        <img 
          src={workoutBanner} 
          alt="Workout fitness banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-dark opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 justify-center">
              <Dumbbell className="w-5 h-5" />
              Workout Tracker
            </h2>
            <p className="text-xs sm:text-sm opacity-90">Track your fitness activities</p>
          </div>
        </div>
      </div>

      <Card className="professional-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="w-5 h-5" />
            Track Your Workouts
          </CardTitle>
          <CardDescription>
            Log your exercises and track calories burned
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Summary */}
          <div className="gradient-workout p-4 rounded-xl text-white">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Today's Activity</h4>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {todayWorkouts.length} workouts
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{totalDuration}</div>
                <div className="text-xs opacity-80">Minutes</div>
              </div>
              <div>
                <div className="text-xl font-bold">{totalCaloriesBurned}</div>
                <div className="text-xs opacity-80">Calories</div>
              </div>
            </div>
          </div>

          {/* Add Workout Form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Workout Name</label>
              <Input
                placeholder="e.g., Morning run, Push-ups, etc."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select value={workoutType} onValueChange={setWorkoutType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="300"
                />
              </div>
            </div>

            <Button
              onClick={addWorkout}
              className="w-full gradient-primary text-white shadow-glow hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>

          {/* Today's Workouts */}
          {todayWorkouts.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm">Today's Workouts</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayWorkouts.map((workout) => {
                  const type = workoutTypes.find(t => t.value === workout.type);
                  return (
                    <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{type?.icon || '💪'}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{workout.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {workout.duration}min
                            <Flame className="w-3 h-3 ml-1" />
                            {workout.caloriesBurned} cal
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkout(workout.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};