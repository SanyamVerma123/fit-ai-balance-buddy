
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Clock, Target, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Workouts = () => {
  const [workouts, setWorkouts] = useState([
    { name: "Morning Run", duration: 30, calories: 300, date: "2024-01-15" },
    { name: "Strength Training", duration: 45, calories: 250, date: "2024-01-14" },
    { name: "Yoga Session", duration: 60, calories: 180, date: "2024-01-13" },
  ]);

  const [newWorkout, setNewWorkout] = useState({
    name: "",
    duration: "",
    calories: "",
  });

  const { toast } = useToast();

  const handleAddWorkout = () => {
    if (!newWorkout.name || !newWorkout.duration || !newWorkout.calories) {
      toast({
        title: "Missing information",
        description: "Please fill in all workout details",
        variant: "destructive",
      });
      return;
    }

    const workout = {
      name: newWorkout.name,
      duration: Number(newWorkout.duration),
      calories: Number(newWorkout.calories),
      date: new Date().toISOString().split('T')[0],
    };

    setWorkouts(prev => [workout, ...prev]);
    setNewWorkout({ name: "", duration: "", calories: "" });
    
    toast({
      title: "Workout added!",
      description: `Added ${workout.name} to your workout history`,
    });
  };

  const workoutTemplates = [
    { name: "Full Body Strength", duration: 45, calories: 300 },
    { name: "Cardio HIIT", duration: 20, calories: 250 },
    { name: "Yoga Flow", duration: 60, calories: 180 },
    { name: "Running", duration: 30, calories: 300 },
    { name: "Cycling", duration: 40, calories: 350 },
    { name: "Swimming", duration: 30, calories: 400 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Workout Tracker
            </h1>
            <p className="text-gray-600">Track your exercises and calories burned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Dumbbell className="w-5 h-5" />
                Today's Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {workouts.filter(w => w.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="text-sm text-gray-600">Sessions completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Clock className="w-5 h-5" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {workouts.reduce((sum, w) => sum + w.duration, 0)} min
              </div>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Target className="w-5 h-5" />
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {workouts.reduce((sum, w) => sum + w.calories, 0)}
              </div>
              <p className="text-sm text-gray-600">Total this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                Add New Workout
              </CardTitle>
              <CardDescription>
                Log your exercise session manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workoutName">Workout Name</Label>
                <Input
                  id="workoutName"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Run, Push Day"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workoutCalories">Calories Burned</Label>
                  <Input
                    id="workoutCalories"
                    type="number"
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="250"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddWorkout}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>

              <div className="mt-6">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Quick Templates:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {workoutTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewWorkout({
                        name: template.name,
                        duration: template.duration.toString(),
                        calories: template.calories.toString(),
                      })}
                      className="text-xs hover:bg-orange-50"
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>
                Your workout history and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workouts.map((workout, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{workout.name}</h4>
                      <p className="text-sm text-gray-600">
                        {workout.duration} min • {workout.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 font-semibold">{workout.calories}</span>
                      <p className="text-xs text-gray-500">calories</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {workouts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No workouts logged yet</p>
                  <p className="text-sm">Add your first workout to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
