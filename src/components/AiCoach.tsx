
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Mic, MicOff, AlertCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const PERMANENT_API_KEY = "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";

const AiCoach = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hey! I'm your personal AI fitness coach and calculator. I can help you with all kinds of calculations, track your food, workouts, weight, and answer any fitness questions. I excel at math - just ask me to calculate anything! What would you like to do today?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
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
              quantity: 1,
              unit: 'serving',
              mealType: 'snack',
              date: today,
              timestamp: new Date().toISOString()
            };
            currentFoodLog.push(newFood);
          }
        });
        
        localStorage.setItem('dailyFoodLog', JSON.stringify(currentFoodLog));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'dailyFoodLog',
          newValue: JSON.stringify(currentFoodLog)
        }));
        
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
              caloriesBurned: Math.round((parseInt(duration) || 30) * 5),
              date: today,
              timestamp: new Date().toISOString()
            };
            currentWorkoutLog.push(newWorkout);
          }
        });
        
        localStorage.setItem('dailyWorkoutLog', JSON.stringify(currentWorkoutLog));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'dailyWorkoutLog',
          newValue: JSON.stringify(currentWorkoutLog)
        }));
        
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
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const foodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    const workoutLog = JSON.parse(localStorage.getItem('dailyWorkoutLog') || '[]');
    const weightEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');

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
          'Authorization': `Bearer ${PERMANENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            { role: 'system', content: context },
            ...recentHistory,
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error details:', errorData);
        
        if (response.status === 401) {
          throw new Error('Your API key seems to be invalid or expired. Please get a new API key from https://console.groq.com/');
        }
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full px-3 sm:px-4 py-4 sm:py-6 max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <SidebarTrigger />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              AI Fitness Coach & Calculator
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Your intelligent fitness companion with advanced calculation abilities</p>
          </div>
        </div>

        <Card className="w-full border-0 shadow-lg max-w-none">
          <CardHeader className="px-3 sm:px-6 pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Smart AI Assistant - Ready to Help!</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Chat with your AI coach for fitness guidance, advanced calculations, and personalized advice!
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <ScrollArea className="h-64 sm:h-80 mb-3 sm:mb-4 p-2 sm:p-3 border rounded-lg bg-gray-50 w-full overflow-x-hidden" ref={scrollRef}>
              <div className="space-y-2 sm:space-y-3 w-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 w-full max-w-full ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.sender === 'user' ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <div className={`flex-1 min-w-0 max-w-[calc(100%-3rem)] px-2 sm:px-3 py-2 rounded-lg word-wrap overflow-wrap ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words hyphens-auto">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2 w-full">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="bg-white border shadow-sm px-2 sm:px-3 py-2 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500">Calculating and thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 w-full max-w-full">
              <Input
                placeholder={isListening ? "Listening..." : "Ask me anything - calculations, fitness advice, tracking..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-w-0 text-xs sm:text-sm"
                disabled={isLoading}
              />
              
              {isSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 ${isListening ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
              )}
              
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !newMessage.trim()}
                className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                size="icon"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            
            <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed break-words">
                <strong>Try asking:</strong> "Calculate my BMI", "What's 25% of 2400 calories?", "I had eggs for breakfast", "Did 30 minutes of yoga", "Calculate protein needs for 70kg person"
                {isSupported && <span className="hidden sm:inline"> - or use the mic button to speak!</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiCoach;
