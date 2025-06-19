
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutItem {
  name: string;
  duration: number;
  calories: number;
  date: string;
}

interface AiWorkoutTrackerProps {
  onWorkoutAdd: (workout: WorkoutItem) => void;
}

export const AiWorkoutTracker = ({ onWorkoutAdd }: AiWorkoutTrackerProps) => {
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const analyzeWorkoutWithAI = async (exercise: string, time: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness expert. Calculate calories burned for exercises. Return ONLY a JSON object with this exact format: {"calories": number, "exercise_name": "string"}. Be precise based on average person weight (70kg) and exercise intensity.'
            },
            {
              role: 'user',
              content: `Calculate calories burned for: ${exercise} for ${time} minutes. Consider moderate intensity for average 70kg person.`
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze workout');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        return {
          calories: parsed.calories || 0,
          name: parsed.exercise_name || exercise
        };
      } catch {
        const calorieMatch = content.match(/(\d+)/);
        return {
          calories: calorieMatch ? parseInt(calorieMatch[1]) : Math.floor(parseInt(time) * 5),
          name: exercise
        };
      }
    } catch (error) {
      console.error('AI workout analysis failed:', error);
      return {
        calories: Math.floor(parseInt(time) * 5),
        name: exercise
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddWorkout = async () => {
    if (!workoutName || !duration) {
      toast({
        title: "Missing information",
        description: "Please enter workout name and duration",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeWorkoutWithAI(workoutName, duration);
    const workoutItem: WorkoutItem = {
      name: result.name,
      duration: Number(duration),
      calories: result.calories,
      date: new Date().toISOString().split('T')[0]
    };

    onWorkoutAdd(workoutItem);

    toast({
      title: "Workout added!",
      description: `Added ${result.name} (${result.calories} calories burned)`,
    });

    setWorkoutName("");
    setDuration("");
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-orange-600" />
          AI Workout Tracker
        </CardTitle>
        <CardDescription>
          Track workouts with AI-powered calorie calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workoutName">Exercise Name</Label>
          <Input
            id="workoutName"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Running, Push-ups, Yoga"
            disabled={isProcessing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
            disabled={isProcessing}
            min="1"
          />
        </div>

        <Button 
          onClick={handleAddWorkout}
          disabled={isProcessing || !workoutName || !duration}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
