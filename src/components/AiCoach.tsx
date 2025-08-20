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

// Food database for automatic recognition
const FOOD_DATABASE: Record<string, { calories: number; unit: string; category: string }> = {
  'chapati': { calories: 104, unit: 'piece', category: 'grain' },
  'roti': { calories: 104, unit: 'piece', category: 'grain' },
  'rice': { calories: 130, unit: 'cup', category: 'grain' },
  'dal': { calories: 115, unit: 'cup', category: 'protein' },
  'chicken': { calories: 165, unit: '100g', category: 'protein' },
  'fish': { calories: 150, unit: '100g', category: 'protein' },
  'egg': { calories: 70, unit: 'piece', category: 'protein' },
  'banana': { calories: 105, unit: 'piece', category: 'fruit' },
  'apple': { calories: 95, unit: 'piece', category: 'fruit' },
  'milk': { calories: 150, unit: 'glass', category: 'dairy' },
  'yogurt': { calories: 100, unit: 'cup', category: 'dairy' },
  'bread': { calories: 80, unit: 'slice', category: 'grain' },
  'pasta': { calories: 200, unit: 'cup', category: 'grain' },
  'pizza': { calories: 300, unit: 'slice', category: 'mixed' },
  'burger': { calories: 550, unit: 'piece', category: 'mixed' },
  'salad': { calories: 150, unit: 'bowl', category: 'vegetable' },
  'sandwich': { calories: 250, unit: 'piece', category: 'mixed' }
};

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

  // Load persistent conversation on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiCoachMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved messages:', error);
        initializeConversation();
      }
    } else {
      initializeConversation();
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiCoachMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const initializeConversation = () => {
    setMessages([{
      id: '1',
      text: "Hey! I'm your personal AI fitness coach and calculator. I can help you with all kinds of calculations, track your food, workouts, weight, and answer any fitness questions. I excel at math - just ask me to calculate anything! What would you like to do today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);
  };

  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectFoodMentions = (text: string): Array<{ food: string; quantity: number; data: any }> => {
    const detectedFoods: Array<{ food: string; quantity: number; data: any }> = [];
    const lowerText = text.toLowerCase();
    
    // Look for quantity patterns like "2 chapati", "1 apple", "ate chapati"
    const quantityPattern = /(\d+)\s*(\w+)|ate\s+(\w+)|had\s+(\w+)|eating\s+(\w+)/g;
    let match;

    while ((match = quantityPattern.exec(lowerText)) !== null) {
      let quantity = 1;
      let foodName = '';

      if (match[1] && match[2]) {
        // Pattern: "2 chapati"
        quantity = parseInt(match[1]);
        foodName = match[2];
      } else if (match[3] || match[4] || match[5]) {
        // Pattern: "ate chapati", "had apple", "eating rice"
        foodName = match[3] || match[4] || match[5];
        quantity = 1;
      }

      if (foodName && FOOD_DATABASE[foodName]) {
        detectedFoods.push({
          food: foodName,
          quantity,
          data: FOOD_DATABASE[foodName]
        });
      }
    }

    // Also check for simple mentions without quantity words
    Object.keys(FOOD_DATABASE).forEach(food => {
      if (lowerText.includes(food) && !detectedFoods.some(df => df.food === food)) {
        detectedFoods.push({
          food,
          quantity: 1,
          data: FOOD_DATABASE[food]
        });
      }
    });

    return detectedFoods;
  };

  const addFoodToLog = (foodItems: Array<{ food: string; quantity: number; data: any }>) => {
    const today = new Date().toDateString();
    const currentFoodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
    
    foodItems.forEach(({ food, quantity, data }) => {
      const totalCalories = data.calories * quantity;
      const newFood = {
        id: Date.now() + Math.random(),
        name: food,
        calories: totalCalories,
        quantity: quantity,
        unit: data.unit,
        mealType: 'snack',
        date: today,
        timestamp: new Date().toISOString()
      };
      currentFoodLog.push(newFood);
    });
    
    localStorage.setItem('dailyFoodLog', JSON.stringify(currentFoodLog));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyFoodLog',
      newValue: JSON.stringify(currentFoodLog)
    }));
    
    const foodNames = foodItems.map(f => `${f.quantity} ${f.food}`).join(', ');
    const totalCals = foodItems.reduce((sum, f) => sum + (f.data.calories * f.quantity), 0);
    
    toast({
      title: "Food Automatically Added!",
      description: `Added ${foodNames} (${totalCals} calories) to your daily log`,
    });
  };

  const updateUserData = (aiResponse: string, userMessage: string) => {
    try {
      const today = new Date().toDateString();
      
      // Check for food mentions in user message
      const detectedFoods = detectFoodMentions(userMessage);
      if (detectedFoods.length > 0) {
        addFoodToLog(detectedFoods);
      }
      
      // Parse food data from AI response
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

IMPORTANT: When users mention eating food (like "I had chapati" or "ate 2 apples"), automatically detect and log the food. You don't need to ask for confirmation.

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

  const clearConversation = () => {
    localStorage.removeItem('aiCoachMessages');
    initializeConversation();
    toast({
      title: "Conversation Cleared",
      description: "Chat history has been reset.",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-x-hidden">
      <div className="w-full px-2 sm:px-3 py-2 sm:py-4 max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <SidebarTrigger />
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              AI Fitness Coach & Calculator
            </h1>
            <p className="text-xs text-gray-600 truncate">Your intelligent fitness companion with advanced calculation abilities</p>
          </div>
        </div>

        <Card className="w-full border-0 shadow-lg max-w-none h-[calc(100vh-120px)]">
          <CardHeader className="px-3 sm:px-4 pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-sm sm:text-base truncate">Smart AI Assistant - Ready to Help!</CardTitle>
              </div>
              <Button
                onClick={clearConversation}
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs h-7"
              >
                Clear Chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-4 pt-0 flex flex-col h-[calc(100vh-180px)]">
            {!isSupported && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Voice input is not supported in your browser. You can still type your messages.
                </AlertDescription>
              </Alert>
            )}
            
            <ScrollArea ref={scrollRef} className="flex-1 pr-2 mb-3">
              <div className="space-y-2 sm:space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-2 sm:p-3 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 p-2 sm:p-3 rounded-2xl shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 items-end relative">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your message or use voice input..."}
                  disabled={isLoading}
                  className="min-h-[36px] text-sm resize-none pr-16"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {isSupported && (
                    <Button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      size="sm"
                      variant={isListening ? "destructive" : "ghost"}
                      className={`h-6 w-6 p-0 ${
                        isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="h-3 w-3" />
                      ) : (
                        <Mic className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim()}
                size="sm"
                className="h-9 px-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiCoach;