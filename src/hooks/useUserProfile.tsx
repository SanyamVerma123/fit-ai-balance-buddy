
import { useState, useEffect } from 'react';

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

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    if (stored && onboardingComplete) {
      setUserProfile(JSON.parse(stored));
      setIsOnboarded(true);
    }
  }, []);

  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsOnboarded(true);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('onboardingComplete', 'true');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      return updatedProfile;
    }
    return null;
  };

  const refreshProfile = () => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      setUserProfile(JSON.parse(stored));
    }
  };

  return {
    userProfile,
    isOnboarded,
    completeOnboarding,
    updateProfile,
    refreshProfile,
  };
};
