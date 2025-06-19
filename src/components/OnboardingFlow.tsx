
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, User, Target, Activity, MapPin, Utensils } from "lucide-react";

interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  goal: 'gain' | 'loss' | 'maintain';
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  dietPreference: 'vegetarian' | 'non-vegetarian' | 'mixed';
  workoutLocation: 'gym' | 'home' | 'outdoor';
}

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(profile as UserProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.name && profile.age && profile.gender;
      case 2:
        return profile.height && profile.weight;
      case 3:
        return profile.goal && profile.targetWeight;
      case 4:
        return profile.activityLevel;
      case 5:
        return profile.dietPreference;
      case 6:
        return profile.workoutLocation;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to FitTracker AI
          </CardTitle>
          <CardDescription>
            Let's personalize your fitness journey
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                  placeholder="Enter your age"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup 
                  value={profile.gender} 
                  onValueChange={(value: 'male' | 'female' | 'other') => setProfile({...profile, gender: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Physical Details</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({...profile, height: Number(e.target.value)})}
                  placeholder="Enter your height in cm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({...profile, weight: Number(e.target.value)})}
                  placeholder="Enter your current weight in kg"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Your Goals</h3>
              </div>
              
              <div className="space-y-3">
                <Label>What's your primary goal?</Label>
                <RadioGroup 
                  value={profile.goal} 
                  onValueChange={(value: 'gain' | 'loss' | 'maintain') => setProfile({...profile, goal: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gain" id="gain" />
                    <Label htmlFor="gain">Gain Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loss" id="loss" />
                    <Label htmlFor="loss">Lose Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maintain" id="maintain" />
                    <Label htmlFor="maintain">Maintain Weight</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={profile.targetWeight || ''}
                  onChange={(e) => setProfile({...profile, targetWeight: Number(e.target.value)})}
                  placeholder="Enter your target weight"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Activity Level</h3>
              </div>
              
              <div className="space-y-2">
                <Label>How active are you?</Label>
                <Select value={profile.activityLevel} onValueChange={(value: any) => setProfile({...profile, activityLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="very">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra">Extremely Active (2x/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Diet Preference</h3>
              </div>
              
              <div className="space-y-3">
                <Label>What's your diet preference?</Label>
                <RadioGroup 
                  value={profile.dietPreference} 
                  onValueChange={(value: 'vegetarian' | 'non-vegetarian' | 'mixed') => setProfile({...profile, dietPreference: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vegetarian" id="vegetarian" />
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-vegetarian" id="non-vegetarian" />
                    <Label htmlFor="non-vegetarian">Non-Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed">Mixed (Both)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold">Workout Preference</h3>
              </div>
              
              <div className="space-y-3">
                <Label>Where do you prefer to workout?</Label>
                <RadioGroup 
                  value={profile.workoutLocation} 
                  onValueChange={(value: 'gym' | 'home' | 'outdoor') => setProfile({...profile, workoutLocation: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gym" id="gym" />
                    <Label htmlFor="gym">Gym</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home">Home</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outdoor" id="outdoor" />
                    <Label htmlFor="outdoor">Outdoor</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {step === totalSteps ? 'Complete Setup' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
