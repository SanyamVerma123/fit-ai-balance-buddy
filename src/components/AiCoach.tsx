import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Mic, MicOff, AlertCircle, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// Your permanent API key for personal use
const PERMANENT_API_KEY = "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";

const AiCoach = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();
  const { updateProfile } = useUserProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    // Initialize with welcome message and set API key
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hey! I'm your personal AI fitness coach and calculator. I can help you with all kinds of calculations, track your food, workouts, weight, and answer any fitness questions. I excel at math - just ask me to calculate anything! What would you like to do today?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
      
      // Use permanent API key
      setApiKey(PERMANENT_API_KEY);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const updateUserData = (aiResponse: string, userMessage: string) => {
    try {
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
          title: "Food Added",
          description: "Updated your daily food log",
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
          title: "Workout Added",
          description: "Updated your workout log",
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

  const getAIResponse = async (userMessage: string, conversationHistory: Message[]) => {
    const currentApiKey = PERMANENT_API_KEY;

    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const weightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');

    // Build conversation context from history
    const recentHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const context = `You are a friendly AI fitness coach and advanced calculator. You excel at all types of mathematical calculations and fitness guidance. Always show your calculation work step-by-step when doing math. Keep responses conversational and helpful.

User profile: Goal: ${userProfile.goal}, Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm, Activity Level: ${userProfile.activityLevel}, Diet: ${userProfile.dietPreference}.

For calculations: Always show step-by-step math clearly with proper formatting.
For fitness tracking, include these commands when relevant:
- FOOD_UPDATE: foodname:calories, foodname2:calories2
- WORKOUT_UPDATE: workoutname:duration, workoutname2:duration2  
- WEIGHT_UPDATE: weightvalue
- PROFILE_UPDATE: goal:value, targetWeight:value, activityLevel:value

Be encouraging, provide clear helpful responses with accurate calculations, and help manage their fitness journey.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: context },
            ...recentHistory,
            { role: 'user', content: userMessage }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key authentication failed. Please check your API key.');
        }
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I had trouble understanding that. Could you try again?';
    } catch (error) {
      console.error('AI Coach API Error:', error);
      throw error;
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
    resetTranscript();
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(currentMessage, messages);
      
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Fitness Coach & Calculator
          </h1>
          <p className="text-gray-600">Your intelligent fitness companion with advanced calculation abilities</p>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            Smart AI Assistant - Ready to Help!
          </CardTitle>
          <CardDescription>
            Chat with your AI coach for fitness guidance, advanced calculations, and personalized advice!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 mb-4 p-4 border rounded-lg bg-gray-50" ref={scrollRef}>
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
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
                    <p className="text-sm text-gray-500">Calculating and thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder={isListening ? "Listening..." : "Ask me anything - calculations, fitness advice, tracking..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              className="flex-1"
              disabled={isLoading}
            />
            
            {isSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={`${isListening ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
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
              <strong>Try asking:</strong> "Calculate my BMI", "What's 25% of 2400 calories?", "I had eggs for breakfast", "Did 30 minutes of yoga", "Calculate protein needs for 70kg person"
              {isSupported && <span> - or use the mic button to speak!</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCoach;
