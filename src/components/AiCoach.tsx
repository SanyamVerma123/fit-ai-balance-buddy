
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const AiCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI fitness coach. I can help you with fitness advice AND automatically update your daily data. Just tell me what you ate, your workouts, weight changes, or ask me to update your profile - I'll handle it all for you!",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateProfile } = useUserProfile();

  const updateUserData = (aiResponse: string, userMessage: string) => {
    try {
      // Check if AI response contains data updates
      const today = new Date().toDateString();
      
      // Parse food data
      const foodRegex = /FOOD_UPDATE:\s*(.+?)(?=\n|$)/g;
      let match = foodRegex.exec(aiResponse);
      if (match) {
        const foodData = match[1].split(',').map(item => item.trim());
        const currentFoodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
        
        foodData.forEach(food => {
          if (food) {
            const [name, calories] = food.split(':').map(s => s.trim());
            const newFood = {
              id: Date.now() + Math.random(),
              name: name || food,
              calories: parseInt(calories) || 100,
              date: today,
              timestamp: new Date().toISOString()
            };
            currentFoodLog.push(newFood);
          }
        });
        
        localStorage.setItem('dailyFoodLog', JSON.stringify(currentFoodLog));
        toast({
          title: "Food Updated",
          description: "Added new food items to your daily log",
        });
      }

      // Parse workout data
      const workoutRegex = /WORKOUT_UPDATE:\s*(.+?)(?=\n|$)/g;
      match = workoutRegex.exec(aiResponse);
      if (match) {
        const workoutData = match[1].split(',').map(item => item.trim());
        const currentWorkoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
        
        workoutData.forEach(workout => {
          if (workout) {
            const [name, duration] = workout.split(':').map(s => s.trim());
            const newWorkout = {
              id: Date.now() + Math.random(),
              name: name || workout,
              duration: parseInt(duration) || 30,
              date: today,
              timestamp: new Date().toISOString()
            };
            currentWorkoutLog.push(newWorkout);
          }
        });
        
        localStorage.setItem('dailyWorkoutLog', JSON.stringify(currentWorkoutLog));
        toast({
          title: "Workout Updated",
          description: "Added new workout to your daily log",
        });
      }

      // Parse weight data
      const weightRegex = /WEIGHT_UPDATE:\s*(\d+\.?\d*)/g;
      match = weightRegex.exec(aiResponse);
      if (match) {
        const weight = parseFloat(match[1]);
        const currentWeightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');
        
        const newWeight = {
          id: Date.now(),
          weight: weight,
          date: today,
          timestamp: new Date().toISOString()
        };
        
        currentWeightEntries.push(newWeight);
        localStorage.setItem('weightEntries', JSON.stringify(currentWeightEntries));
        
        // Also update profile weight
        updateProfile({ weight });
        
        toast({
          title: "Weight Updated",
          description: `Updated your weight to ${weight} kg`,
        });
      }

      // Parse profile updates
      const profileRegex = /PROFILE_UPDATE:\s*(.+?)(?=\n|$)/g;
      match = profileRegex.exec(aiResponse);
      if (match) {
        const profileData = match[1];
        const updates: any = {};
        
        if (profileData.includes('goal:')) {
          const goalMatch = profileData.match(/goal:\s*(\w+)/);
          if (goalMatch) updates.goal = goalMatch[1];
        }
        
        if (profileData.includes('targetWeight:')) {
          const targetMatch = profileData.match(/targetWeight:\s*(\d+\.?\d*)/);
          if (targetMatch) updates.targetWeight = parseFloat(targetMatch[1]);
        }
        
        if (profileData.includes('activityLevel:')) {
          const activityMatch = profileData.match(/activityLevel:\s*(\w+)/);
          if (activityMatch) updates.activityLevel = activityMatch[1];
        }
        
        if (Object.keys(updates).length > 0) {
          updateProfile(updates);
          toast({
            title: "Profile Updated",
            description: "Updated your profile settings",
          });
        }
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const getAIResponse = async (userMessage: string) => {
    const API_KEY = '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';
    
    // Get user context
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const weightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');

    const context = `You are a professional fitness coach and nutritionist with the ability to update user data. User profile: Goal: ${userProfile.goal}, Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm, Activity Level: ${userProfile.activityLevel}, Diet: ${userProfile.dietPreference}. Recent food intake: ${foodLog.slice(-5).map((f: any) => f.name).join(', ')}. Recent workouts: ${workoutLog.slice(-3).map((w: any) => w.name).join(', ')}. Current weight trend: ${weightEntries.slice(-3).map((w: any) => w.weight).join(', ')}kg.

IMPORTANT: When the user tells you about food they ate, workouts they did, weight changes, or wants to update their profile, you MUST include special commands in your response:

- For food: FOOD_UPDATE: foodname:calories, foodname2:calories2
- For workouts: WORKOUT_UPDATE: workoutname:duration, workoutname2:duration2
- For weight: WEIGHT_UPDATE: weightvalue
- For profile: PROFILE_UPDATE: goal:value, targetWeight:value, activityLevel:value

Examples:
User: "I ate an apple and a banana"
Your response: "Great healthy choices! FOOD_UPDATE: Apple:80, Banana:105 These fruits provide good natural sugars and fiber."

User: "I did 30 minutes of running"
Your response: "Excellent cardio workout! WORKOUT_UPDATE: Running:30 That should burn approximately 300-400 calories."

User: "My weight today is 72kg"
Your response: "Thanks for the update! WEIGHT_UPDATE: 72 I've recorded your current weight."

Always provide helpful advice along with the data updates. Be encouraging and specific.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I cannot process your request right now. Please try again.';
    } catch (error) {
      console.error('AI Coach API Error:', error);
      return 'I apologize, but I cannot connect right now. Please check your connection and try again.';
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(currentMessage);
      
      // Update user data based on AI response
      updateUserData(aiResponse, currentMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.replace(/FOOD_UPDATE:.*?(?=\n|$)/g, '')
                      .replace(/WORKOUT_UPDATE:.*?(?=\n|$)/g, '')
                      .replace(/WEIGHT_UPDATE:.*?(?=\n|$)/g, '')
                      .replace(/PROFILE_UPDATE:.*?(?=\n|$)/g, '')
                      .trim(),
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Fitness Coach
            </h1>
            <p className="text-gray-600">Your personal AI trainer that updates your data automatically</p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" />
              Smart Chat & Data Updates
            </CardTitle>
            <CardDescription>
              Tell me what you ate, your workouts, weight, or ask me to update your profile - I'll handle everything!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border shadow-sm px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-500">Coach is thinking and updating your data...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Tell me what you ate, your workout, weight, or ask anything..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !newMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Try saying:</strong> "I ate a chicken sandwich and salad", "I did 45 minutes of yoga", "My weight is 68kg", or "Change my goal to weight loss"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiCoach;
