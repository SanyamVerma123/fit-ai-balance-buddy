
import { useState, useEffect } from 'react';

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

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    const onboarded = localStorage.getItem('isOnboarded');
    
    if (stored && onboarded === 'true') {
      setUserProfile(JSON.parse(stored));
      setIsOnboarded(true);
    }
  }, []);

  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsOnboarded(true);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('isOnboarded', 'true');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updated = { ...userProfile, ...updates };
      setUserProfile(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
    }
  };

  const resetOnboarding = () => {
    setUserProfile(null);
    setIsOnboarded(false);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isOnboarded');
  };

  return {
    userProfile,
    isOnboarded,
    completeOnboarding,
    updateProfile,
    resetOnboarding
  };
};
