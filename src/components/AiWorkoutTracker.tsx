
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Brain, Home, Building, TreePine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface WorkoutItem {
  name: string;
  duration: number;
  calories: number;
  date: string;
  sets?: number;
  reps?: number;
  weight?: number;
  location: string;
}

interface WorkoutSuggestion {
  name: string;
  sets: number;
  reps: number;
  rest_time: string;
  instructions: string;
  calories_per_hour: number;
}

interface AiWorkoutTrackerProps {
  onWorkoutAdd: (workout: WorkoutItem) => void;
}

export const AiWorkoutTracker = ({ onWorkoutAdd }: AiWorkoutTrackerProps) => {
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  const workoutTypes = [
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'sports', label: 'Sports' }
  ];

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'gym': return <Building className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'outdoor': return <TreePine className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const analyzeWorkoutWithAI = async (exercise: string, time: string, workoutSets?: string, workoutReps?: string) => {
    setIsProcessing(true);
    try {
      const location = userProfile?.workoutLocation || 'gym';
      const goal = userProfile?.goal || 'maintain';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness expert. Calculate calories burned for exercises and provide exercise details. Return ONLY a JSON object with this exact format: {"calories": number, "exercise_name": "string", "suggested_sets": number, "suggested_reps": number}. Be precise based on average person weight (70kg) and exercise intensity.'
            },
            {
              role: 'user',
              content: `Calculate calories burned for: ${exercise} for ${time} minutes at ${location}. Goal: ${goal} weight. ${workoutSets ? `Sets: ${workoutSets}` : ''} ${workoutReps ? `Reps: ${workoutReps}` : ''}`
            }
          ],
          temperature: 0.1,
          max_tokens: 150
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
          name: parsed.exercise_name || exercise,
          suggestedSets: parsed.suggested_sets || 0,
          suggestedReps: parsed.suggested_reps || 0
        };
      } catch {
        const calorieMatch = content.match(/(\d+)/);
        return {
          calories: calorieMatch ? parseInt(calorieMatch[1]) : Math.floor(parseInt(time) * 5),
          name: exercise,
          suggestedSets: parseInt(workoutSets || '0'),
          suggestedReps: parseInt(workoutReps || '0')
        };
      }
    } catch (error) {
      console.error('AI workout analysis failed:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Using estimated calories. Please check your internet connection.",
        variant: "destructive"
      });
      return {
        calories: Math.floor(parseInt(time) * 5),
        name: exercise,
        suggestedSets: parseInt(workoutSets || '0'),
        suggestedReps: parseInt(workoutReps || '0')
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const getAIWorkoutSuggestions = async (workoutType: string) => {
    setIsGettingSuggestions(true);
    try {
      const location = userProfile?.workoutLocation || 'gym';
      const goal = userProfile?.goal || 'maintain';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness trainer. Suggest specific exercises with detailed instructions. Return ONLY a JSON array with this exact format: [{"name": "exercise_name", "sets": number, "reps": number, "rest_time": "time", "instructions": "brief_instruction", "calories_per_hour": number}]. Maximum 4 exercises.'
            },
            {
              role: 'user',
              content: `Suggest ${workoutType} exercises for ${location} workout. Goal: ${goal} weight. Include sets, reps, rest time, and brief instructions.`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const suggestions = JSON.parse(content);
        setAiSuggestions(suggestions);
        
        toast({
          title: "AI Workout Suggestions Ready!",
          description: `Generated ${suggestions.length} ${workoutType} exercises for ${location}`,
        });
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError);
        // Fallback suggestions
        const fallbackSuggestions = [
          {
            name: "Push-ups",
            sets: 3,
            reps: 12,
            rest_time: "30 seconds",
            instructions: "Keep body straight, lower to chest",
            calories_per_hour: 300
          },
          {
            name: "Squats",
            sets: 3,
            reps: 15,
            rest_time: "45 seconds",
            instructions: "Feet shoulder-width apart, lower to 90 degrees",
            calories_per_hour: 250
          }
        ];
        setAiSuggestions(fallbackSuggestions);
        
        toast({
          title: "Workout Suggestions Ready!",
          description: `Generated workout suggestions`,
        });
      }
    } catch (error) {
      console.error('AI suggestions failed:', error);
      toast({
        title: "Network Error",
        description: "Failed to get AI suggestions. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGettingSuggestions(false);
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

    const result = await analyzeWorkoutWithAI(workoutName, duration, sets, reps);
    const workoutItem: WorkoutItem = {
      name: result.name,
      duration: Number(duration),
      calories: result.calories,
      date: new Date().toISOString().split('T')[0],
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      weight: weight ? Number(weight) : undefined,
      location: userProfile?.workoutLocation || 'gym'
    };

    onWorkoutAdd(workoutItem);

    toast({
      title: "Workout added!",
      description: `Added ${result.name} (${result.calories} calories burned)`,
    });

    setWorkoutName("");
    setDuration("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const addSuggestedWorkout = async (suggestion: WorkoutSuggestion) => {
    const estimatedDuration = 30; // Default 30 minutes
    const caloriesBurned = Math.round((suggestion.calories_per_hour / 60) * estimatedDuration);
    
    const workoutItem: WorkoutItem = {
      name: suggestion.name,
      duration: estimatedDuration,
      calories: caloriesBurned,
      date: new Date().toISOString().split('T')[0],
      sets: suggestion.sets,
      reps: suggestion.reps,
      location: userProfile?.workoutLocation || 'gym'
    };

    onWorkoutAdd(workoutItem);

    toast({
      title: "AI Workout Added!",
      description: `Added ${suggestion.name} (${caloriesBurned} calories)`,
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <span className="truncate">AI Workout Tracker</span>
          {userProfile?.workoutLocation && (
            <Badge variant="secondary" className="ml-2 hidden sm:flex">
              {getLocationIcon(userProfile.workoutLocation)}
              <span className="ml-1 capitalize">{userProfile.workoutLocation}</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Get AI exercise suggestions and track workouts with calorie calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 w-full overflow-x-hidden">
        {/* AI Exercise Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            Get AI Exercise Suggestions
          </h4>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {workoutTypes.map((type) => (
              <Button
                key={type.value}
                onClick={() => getAIWorkoutSuggestions(type.value)}
                disabled={isGettingSuggestions}
                variant="outline"
                className="bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-xs sm:text-sm p-2 h-auto"
              >
                {isGettingSuggestions ? (
                  <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
                ) : (
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                )}
                <span className="truncate">{type.label}</span>
              </Button>
            ))}
          </div>

          {/* Display AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto border-t pt-3">
              <h5 className="font-medium text-gray-800 text-sm sm:text-base">AI Exercise Suggestions:</h5>
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium text-orange-700 text-xs sm:text-sm truncate mr-2">{suggestion.name}</h6>
                    <Button
                      size="sm"
                      onClick={() => addSuggestedWorkout(suggestion)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 flex-shrink-0"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Sets:</strong> {suggestion.sets} | <strong>Reps:</strong> {suggestion.reps}</div>
                    <div><strong>Rest:</strong> {suggestion.rest_time}</div>
                    <div><strong>Instructions:</strong> {suggestion.instructions}</div>
                    <div><strong>Calories/hour:</strong> {suggestion.calories_per_hour}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Workout Entry */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            Add Custom Workout
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="workoutName" className="text-xs sm:text-sm">Exercise Name</Label>
              <Input
                id="workoutName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Running, Push-ups, Yoga"
                disabled={isProcessing}
                className="text-xs sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="duration" className="text-xs sm:text-sm">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  disabled={isProcessing}
                  min="1"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="sets" className="text-xs sm:text-sm">Sets (optional)</Label>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="3"
                  disabled={isProcessing}
                  min="1"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="reps" className="text-xs sm:text-sm">Reps (optional)</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="12"
                  disabled={isProcessing}
                  min="1"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-xs sm:text-sm">Weight kg (optional)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="20"
                  disabled={isProcessing}
                  min="0.5"
                  step="0.5"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            <Button 
              onClick={handleAddWorkout}
              disabled={isProcessing || !workoutName || !duration}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs sm:text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Workout
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
