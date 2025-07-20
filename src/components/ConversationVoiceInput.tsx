import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Phone, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ConversationVoiceInputProps {
  onClose: () => void;
  onDataSaved: (data: any) => void;
}

export const ConversationVoiceInput = ({ onClose, onDataSaved }: ConversationVoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isInConversation, setIsInConversation] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationLog, setConversationLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    const initSpeechRecognition = async () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Speech recognition not supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let fullTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript.trim() && !fullTranscript.includes(finalTranscript.trim())) {
          fullTranscript += finalTranscript;
        }
        
        setTranscript(fullTranscript + interimTranscript);
      };

      recognition.onspeechend = () => {
        if (fullTranscript.trim() && isInConversation) {
          processConversationInput(fullTranscript.trim());
          fullTranscript = '';
        }
        if (isInConversation) {
          // Keep listening in conversation mode
          setTimeout(() => {
            if (isInConversation) {
              recognition.start();
            }
          }, 1000);
        } else {
          recognition.stop();
        }
      };

      recognition.onend = () => {
        if (!isInConversation) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    };

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [isInConversation]);

  const startConversation = () => {
    setIsInConversation(true);
    setIsListening(true);
    setConversationLog(["🤖 AI: Hello! I'm your fitness coach. How can I help you today? You can tell me about your meals, workouts, or ask any fitness questions."]);
    
    // Speak the greeting
    speak("Hello! I'm your fitness coach. How can I help you today? You can tell me about your meals, workouts, or ask any fitness questions.");
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const endConversation = () => {
    setIsInConversation(false);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Process and save conversation data
    saveConversationData();
    
    toast({
      title: "Conversation ended! 💬",
      description: "All data has been saved to your records",
    });
  };

  const speak = (text: string) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const processConversationInput = async (text: string) => {
    setIsProcessing(true);
    setConversationLog(prev => [...prev, `👤 You: ${text}`]);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a friendly AI fitness coach having a voice conversation. Keep responses conversational, concise (2-3 sentences max), and helpful. 
              
              When users mention food, workouts, or water intake, acknowledge it and ask if they want to log it. End your response with a relevant question to continue the conversation.
              
              If they want to log something, format it as: LOG_FOOD:name:quantity:unit:calories or LOG_WORKOUT:name:duration:calories or LOG_WATER:amount
              
              Be encouraging and supportive in your tone.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      setConversationLog(prev => [...prev, `🤖 AI: ${aiResponse}`]);
      
      // Extract and clean response for speech
      const speechText = aiResponse.replace(/LOG_[A-Z_]+:.*?(?=\\s|$)/g, '').trim();
      if (speechText) {
        speak(speechText);
      }
      
      setTranscript('');
    } catch (error) {
      console.error('Conversation processing failed:', error);
      const errorMsg = "Sorry, I had trouble processing that. Could you try again?";
      setConversationLog(prev => [...prev, `🤖 AI: ${errorMsg}`]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveConversationData = () => {
    // Extract logged data from conversation
    const loggedData = {
      foods: [] as any[],
      workouts: [] as any[],
      water: [] as any[]
    };

    conversationLog.forEach(entry => {
      if (entry.includes('LOG_FOOD:')) {
        const match = entry.match(/LOG_FOOD:([^:]+):([^:]+):([^:]+):([^:]+)/);
        if (match) {
          loggedData.foods.push({
            name: match[1],
            quantity: parseFloat(match[2]),
            unit: match[3],
            calories: parseFloat(match[4]),
            timestamp: new Date().toISOString()
          });
        }
      } else if (entry.includes('LOG_WORKOUT:')) {
        const match = entry.match(/LOG_WORKOUT:([^:]+):([^:]+):([^:]+)/);
        if (match) {
          loggedData.workouts.push({
            name: match[1],
            duration: parseFloat(match[2]),
            calories: parseFloat(match[3]),
            timestamp: new Date().toISOString()
          });
        }
      } else if (entry.includes('LOG_WATER:')) {
        const match = entry.match(/LOG_WATER:([^:]+)/);
        if (match) {
          loggedData.water.push({
            amount: parseFloat(match[1]),
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Save conversation log
    const existingConversations = JSON.parse(localStorage.getItem('conversationLogs') || '[]');
    existingConversations.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      log: conversationLog,
      extractedData: loggedData
    });
    localStorage.setItem('conversationLogs', JSON.stringify(existingConversations));

    onDataSaved(loggedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 via-purple-800 to-black border-0 shadow-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 text-center space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">AI Voice Conversation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversation Visualization */}
          <div className="relative w-32 h-32 mx-auto">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 opacity-20 ${isInConversation ? 'animate-pulse' : ''}`}></div>
            <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-green-300 via-blue-400 to-purple-500 opacity-40 ${isListening ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-green-200 via-blue-300 to-purple-400 opacity-60 ${isProcessing ? 'animate-spin' : ''}`}></div>
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white via-green-100 to-blue-200 flex items-center justify-center">
              {isInConversation ? (
                <PhoneCall className="w-8 h-8 text-green-600 animate-bounce" />
              ) : (
                <Phone className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-white/80 text-sm">
              {isProcessing ? "AI is thinking..." : 
               isInConversation ? (isListening ? "Listening..." : "AI is speaking...") : 
               "Ready to start conversation"}
            </p>
            
            {transcript && (
              <div className="bg-white/10 rounded-lg p-3 text-white text-sm max-h-20 overflow-y-auto">
                "{transcript}"
              </div>
            )}
          </div>

          {/* Conversation Log */}
          {conversationLog.length > 0 && (
            <div className="bg-white/10 rounded-lg p-3 max-h-40 overflow-y-auto text-white text-xs space-y-1">
              {conversationLog.slice(-3).map((entry, index) => (
                <div key={index} className="text-left">{entry}</div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isInConversation ? (
              <Button
                onClick={startConversation}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            ) : (
              <Button
                onClick={endConversation}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                End Call & Save
              </Button>
            )}
          </div>

          <p className="text-xs text-white/60">
            Have a natural conversation with AI! Mention your meals, workouts, and water intake.
          </p>
        </div>
      </Card>
    </div>
  );
};
