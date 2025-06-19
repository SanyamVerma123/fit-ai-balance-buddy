
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { User, Target, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: 'gain' | 'loss' | 'maintain';
  activityLevel: string;
  targetWeight: string;
}

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: 'maintain',
    activityLevel: '',
    targetWeight: ''
  });
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (!profile.name || !profile.age || !profile.height || !profile.weight) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold">Let's get to know you</h2>
              <p className="text-gray-600">Tell us about yourself to personalize your experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <RadioGroup 
                    value={profile.gender} 
                    onValueChange={(value) => setProfile({...profile, gender: value})}
                    className="flex flex-row space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Activity className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold">Your Current Stats</h2>
              <p className="text-gray-600">Help us understand your current physical state</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  placeholder="175"
                />
              </div>
              <div>
                <Label htmlFor="weight">Current Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: e.target.value})}
                  placeholder="70"
                />
              </div>
            </div>
            <div>
              <Label>Activity Level</Label>
              <RadioGroup 
                value={profile.activityLevel} 
                onValueChange={(value) => setProfile({...profile, activityLevel: value})}
                className="space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (little or no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Lightly active (light exercise 1-3 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderately active (moderate exercise 3-5 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very" id="very" />
                  <Label htmlFor="very">Very active (hard exercise 6-7 days/week)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Target className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold">What's Your Goal?</h2>
              <p className="text-gray-600">Choose your primary fitness objective</p>
            </div>
            <div className="space-y-3">
              <Card 
                className={`cursor-pointer transition-all ${profile.goal === 'gain' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'}`}
                onClick={() => setProfile({...profile, goal: 'gain'})}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Gain Weight</h3>
                    <p className="text-sm text-gray-600">Build muscle and increase body mass</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${profile.goal === 'loss' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-md'}`}
                onClick={() => setProfile({...profile, goal: 'loss'})}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold">Lose Weight</h3>
                    <p className="text-sm text-gray-600">Burn fat and reduce body weight</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${profile.goal === 'maintain' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                onClick={() => setProfile({...profile, goal: 'maintain'})}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Maintain Weight</h3>
                    <p className="text-sm text-gray-600">Stay healthy and maintain current weight</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Target className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold">Set Your Target</h2>
              <p className="text-gray-600">What's your target weight?</p>
            </div>
            <div>
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={profile.targetWeight}
                onChange={(e) => setProfile({...profile, targetWeight: e.target.value})}
                placeholder="Enter your target weight"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Name:</span> {profile.name}</p>
                <p><span className="font-medium">Current Weight:</span> {profile.weight} kg</p>
                <p><span className="font-medium">Goal:</span> {profile.goal === 'gain' ? 'Gain Weight' : profile.goal === 'loss' ? 'Lose Weight' : 'Maintain Weight'}</p>
                <p><span className="font-medium">Target Weight:</span> {profile.targetWeight} kg</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitTracker AI Setup
              </CardTitle>
              <CardDescription>Step {step} of {totalSteps}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {step === totalSteps ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
