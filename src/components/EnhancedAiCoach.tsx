import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bot, MessageCircle, Mic, MicOff, Send, User, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// Enhanced food database with more comprehensive nutrition data
const FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number; unit: string; category: string }> = {
  'chapati': { calories: 104, protein: 3, carbs: 18, fat: 2, unit: 'piece', category: 'grain' },
  'roti': { calories: 104, protein: 3, carbs: 18, fat: 2, unit: 'piece', category: 'grain' },
  'rice': { calories: 130, protein: 3, carbs: 28, fat: 0.3, unit: 'cup', category: 'grain' },
  'dal': { calories: 115, protein: 8, carbs: 20, fat: 0.4, unit: 'cup', category: 'protein' },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g', category: 'protein' },
  'fish': { calories: 150, protein: 30, carbs: 0, fat: 3, unit: '100g', category: 'protein' },
  'egg': { calories: 70, protein: 6, carbs: 0.6, fat: 5, unit: 'piece', category: 'protein' },
  'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.3, unit: 'piece', category: 'fruit' },
  'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, unit: 'piece', category: 'fruit' },
  'milk': { calories: 150, protein: 8, carbs: 12, fat: 8, unit: 'glass', category: 'dairy' },
  'yogurt': { calories: 100, protein: 10, carbs: 16, fat: 0.4, unit: 'cup', category: 'dairy' },
  'bread': { calories: 80, protein: 3, carbs: 15, fat: 1, unit: 'slice', category: 'grain' },
  'pasta': { calories: 200, protein: 7, carbs: 40, fat: 1, unit: 'cup', category: 'grain' },
  'pizza': { calories: 300, protein: 12, carbs: 30, fat: 12, unit: 'slice', category: 'mixed' },
  'burger': { calories: 550, protein: 25, carbs: 40, fat: 31, unit: 'piece', category: 'mixed' },
  'salad': { calories: 150, protein: 5, carbs: 20, fat: 7, unit: 'bowl', category: 'vegetable' },
  'sandwich': { calories: 250, protein: 12, carbs: 30, fat: 8, unit: 'piece', category: 'mixed' }
};

const AiCoach = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [fullTranscript, setFullTranscript] = useState('');
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let tempTranscript = '';
      let hasProcessedFinal = false;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Only process final transcript once
        if (finalTranscript.trim() && !hasProcessedFinal) {
          tempTranscript = finalTranscript.trim();
          hasProcessedFinal = true;
          setFullTranscript(tempTranscript);
        }
        
        // Show live transcript (interim + final)
        const displayText = tempTranscript + (hasProcessedFinal ? '' : interimTranscript);
        setNewMessage(displayText);
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setIsListening(false);
        if (tempTranscript.trim()) {
          setNewMessage(tempTranscript.trim());
          setFullTranscript('');
          tempTranscript = '';
          hasProcessedFinal = false;
        }
      };

      recognition.onerror = (event: any) => {
        toast({
          title: "Speech recognition error",
          description: "Please try again or type your message",
          variant: "destructive",
        });
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, [toast]);

  // Load conversation on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiCoachMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        initializeConversation();
      }
    } else {
      initializeConversation();
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiCoachMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const initializeConversation = () => {
    setMessages([{
      id: '1',
      text: "Hello! I'm your AI fitness coach with voice conversation capabilities. I can help you track meals, calculate nutrition, plan workouts, and answer fitness questions. I can also automatically log food when you mention eating something. Try saying 'I ate 2 chapatis' or ask me any fitness question!",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);
  };

  const detectFoodMentions = (text: string): Array<{ food: string; quantity: number; data: any }> => {
    const detectedFoods: Array<{ food: string; quantity: number; data: any }> = [];
    const lowerText = text.toLowerCase();
    
    const quantityPattern = /(\d+)\s*(\w+)|ate\s+(\w+)|had\s+(\w+)|eating\s+(\w+)|consumed\s+(\w+)/g;
    let match;

    while ((match = quantityPattern.exec(lowerText)) !== null) {
      let quantity = 1;
      let foodName = '';

      if (match[1] && match[2]) {
        quantity = parseInt(match[1]);
        foodName = match[2];
      } else if (match[3] || match[4] || match[5] || match[6]) {
        foodName = match[3] || match[4] || match[5] || match[6];
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

    return detectedFoods;
  };

  const addFoodToLog = (foodItems: Array<{ food: string; quantity: number; data: any }>) => {
    const today = new Date().toDateString();
    
    foodItems.forEach(({ food, quantity, data }) => {
      const totalCalories = data.calories * quantity;
      const totalProtein = data.protein * quantity;
      const totalCarbs = data.carbs * quantity;
      const totalFat = data.fat * quantity;
      
      const newFood = {
        id: Date.now() + Math.random(),
        name: food,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        quantity: quantity,
        unit: data.unit,
        mealType: 'snack',
        timestamp: new Date().toISOString()
      };

      // Add to dailyFoodLog
      const currentFoodLog = JSON.parse(localStorage.getItem('dailyFoodLog') || '[]');
      currentFoodLog.push(newFood);
      localStorage.setItem('dailyFoodLog', JSON.stringify(currentFoodLog));

      // Add to dailyMeals
      const existingMeals = JSON.parse(localStorage.getItem('dailyMeals') || '{}');
      const todayKey = new Date().toISOString().split('T')[0];
      const updatedMeals = {
        ...existingMeals,
        [todayKey]: [...(existingMeals[todayKey] || []), {
          name: food,
          quantity,
          unit: data.unit,
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          mealType: 'snack',
          date: todayKey,
          time: new Date().toLocaleTimeString()
        }]
      };
      localStorage.setItem('dailyMeals', JSON.stringify(updatedMeals));

      // Trigger storage events
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dailyFoodLog',
        newValue: JSON.stringify(currentFoodLog)
      }));
    });
    
    const foodNames = foodItems.map(f => `${f.quantity} ${f.food}`).join(', ');
    const totalCals = foodItems.reduce((sum, f) => sum + (f.data.calories * f.quantity), 0);
    
    toast({
      title: "Food Automatically Added! 🍽️",
      description: `Added ${foodNames} (${totalCals} calories) to your log`,
    });
  };

  const getAIResponse = async (userMessage: string) => {
    try {
      const context = `You are a friendly AI fitness coach with voice conversation capabilities. You can:
1. Track meals and automatically detect food mentions
2. Calculate nutrition and calories  
3. Provide fitness advice and workout plans
4. Answer health and nutrition questions
5. Help with weight management goals

When users mention eating food, automatically detect and log it. Be conversational, helpful, and encouraging. Keep responses concise but informative.

IMPORTANT: If you detect food mentions, format them as: FOOD_DETECTED: foodname:quantity:unit
For example: FOOD_DETECTED: chapati:2:piece

Current conversation context: The user can speak to you using voice input and you should respond naturally as if having a real conversation.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I had trouble understanding that. Could you try again?';
    } catch (error) {
      throw new Error('Failed to get AI response. Please check your connection.');
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
      // Detect food mentions
      const detectedFoods = detectFoodMentions(currentMessage);
      if (detectedFoods.length > 0) {
        addFoodToLog(detectedFoods);
      }

      const aiResponse = await getAIResponse(currentMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.replace(/FOOD_DETECTED:.*?(?=\n|$)/g, '').trim(),
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
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

  const handleVoiceInput = () => {
    if (!speechRecognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      setNewMessage('');
      setFullTranscript('');
      speechRecognition.start();
      setIsListening(true);
    }
  };

  const clearConversation = () => {
    localStorage.removeItem('aiCoachMessages');
    initializeConversation();
    toast({
      title: "Conversation cleared! 🗑️",
      description: "Chat history has been reset",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-x-hidden">
      <div className="w-full px-2 sm:px-4 py-2 sm:py-4 max-w-full">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <SidebarTrigger />
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              AI Voice Coach
            </h1>
            <p className="text-xs text-gray-600 truncate">Chat with voice - your intelligent fitness companion</p>
          </div>
          <Button
            onClick={clearConversation}
            variant="outline"
            size="sm"
            className="flex-shrink-0 text-xs h-7"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="w-full border-0 shadow-lg max-w-none h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)]">
          <CardHeader className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-sm sm:text-base truncate">Voice-Enabled AI Coach</CardTitle>
              </div>
              {speechRecognition && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleVoiceInput}
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    {isListening ? 'Stop' : 'Speak'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 h-full flex flex-col relative">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-20 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Status */}
            {isListening && (
              <Alert className="absolute bottom-20 left-4 right-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-700">
                  Listening... Speak your message now
                </AlertDescription>
              </Alert>
            )}

            {/* WhatsApp-style Input Area - Fixed to bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 safe-area-padding">
              <div className="flex gap-2 items-end max-w-full">
                <div className="flex-1 min-w-0">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message or use voice input..."
                    disabled={isLoading}
                    className="min-h-[2.5rem] max-h-20 text-sm resize-none border border-gray-300 dark:border-gray-600 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 px-4 py-2"
                    rows={1}
                  />
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {speechRecognition && (
                    <Button
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile safe area padding */}
      <div className="h-16 mobile-safe"></div>
    </div>
  );
};

export default AiCoach;