
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { User, Settings, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { userProfile, updateProfile, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    targetWeight: '',
    activityLevel: '',
    dietPreference: '',
    workoutLocation: '',
  });

  // Load profile data when component mounts or userProfile changes
  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age?.toString() || '',
        gender: userProfile.gender || '',
        height: userProfile.height?.toString() || '',
        weight: userProfile.weight?.toString() || '',
        goal: userProfile.goal || '',
        targetWeight: userProfile.targetWeight?.toString() || '',
        activityLevel: userProfile.activityLevel || '',
        dietPreference: userProfile.dietPreference || '',
        workoutLocation: userProfile.workoutLocation || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedProfile = {
      name: formData.name,
      age: Number(formData.age) || 25,
      gender: formData.gender as 'male' | 'female' | 'other',
      height: Number(formData.height) || 170,
      weight: Number(formData.weight) || 70,
      goal: formData.goal as 'gain' | 'loss' | 'maintain',
      targetWeight: Number(formData.targetWeight) || 70,
      activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'very' | 'extra',
      dietPreference: formData.dietPreference as 'vegetarian' | 'non-vegetarian' | 'mixed',
      workoutLocation: formData.workoutLocation as 'gym' | 'home' | 'outdoor',
    };

    updateProfile(updatedProfile);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated!",
    });
  };

  const handleClearAllData = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('dailyFoodLog');
    localStorage.removeItem('dailyWorkoutLog');
    localStorage.removeItem('weightEntries');
    
    toast({
      title: "All Data Cleared",
      description: "All your data has been permanently deleted.",
      variant: "destructive",
    });
    
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="Enter your height"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Enter your weight"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                    placeholder="Enter target weight"
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Fitness Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your fitness goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gain">Weight Gain</SelectItem>
                      <SelectItem value="loss">Weight Loss</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="very">Very Active</SelectItem>
                      <SelectItem value="extra">Extra Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dietPreference">Diet Preference</Label>
                  <Select value={formData.dietPreference} onValueChange={(value) => handleInputChange('dietPreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your diet preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workoutLocation">Workout Location</Label>
                  <Select value={formData.workoutLocation} onValueChange={(value) => handleInputChange('workoutLocation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your workout location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data including profile, food logs, workout logs, and weight entries. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
