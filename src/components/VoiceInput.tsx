import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onClose: () => void;
  onFoodDetected: (food: { name: string; calories: number; quantity: number; unit: string }) => void;
  onWaterDetected: (amount: number) => void;
  onWorkoutDetected: (workout: { name: string; duration: number; calories: number }) => void;
}

export const VoiceInput = ({ onClose, onFoodDetected, onWaterDetected, onWorkoutDetected }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initSpeechRecognition = async () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Speech recognition not supported",
          description: "Your browser doesn't support speech recognition. Try using it as a website.",
          variant: "destructive",
        });
        return;
      }

      // Check if we're in a mobile app (Capacitor) context
      const isCapacitorApp = !!(window as any).Capacitor;
      if (isCapacitorApp) {
        // Request microphone permissions for mobile app
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (error) {
            toast({
              title: "Microphone permission denied",
              description: "Please enable microphone access in app settings",
              variant: "destructive",
            });
            return;
          }
        }
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
        
        // Only accumulate final results to prevent duplication
        if (finalTranscript.trim() && !fullTranscript.includes(finalTranscript.trim())) {
          fullTranscript += finalTranscript;
        }
        
        // Show current speaking progress
        setTranscript(fullTranscript + interimTranscript);
      };

      recognition.onspeechend = () => {
        // Process the complete transcript when speech ends
        if (fullTranscript.trim()) {
          processVoiceInput(fullTranscript.trim());
          fullTranscript = '';
        }
        recognition.stop();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      // Start listening immediately
      startListening();
    };

    initSpeechRecognition();


    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true);
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
              content: `Analyze voice input for fitness tracking. Extract food, water, or workout information. Return ONLY JSON:
              For food: {"type": "food", "name": "food_name", "calories": number, "quantity": number, "unit": "unit"}
              For water: {"type": "water", "amount": number}
              For workout: {"type": "workout", "name": "exercise_name", "duration": number, "calories": number}
              If unclear, return: {"type": "unclear", "message": "question to ask for clarification"}`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        
        switch (parsed.type) {
          case 'food':
            onFoodDetected({
              name: parsed.name,
              calories: parsed.calories || 100,
              quantity: parsed.quantity || 1,
              unit: parsed.unit || 'piece'
            });
            toast({
              title: "Food added! 🍽️",
              description: `Added ${parsed.name} to your meal tracker`,
            });
            break;
          case 'water':
            onWaterDetected(parsed.amount || 250);
            toast({
              title: "Water added! 💧",
              description: `Added ${parsed.amount || 250}ml to your water intake`,
            });
            break;
          case 'workout':
            onWorkoutDetected({
              name: parsed.name,
              duration: parsed.duration || 30,
              calories: parsed.calories || 100
            });
            toast({
              title: "Workout added! 💪",
              description: `Added ${parsed.name} to your workout log`,
            });
            break;
          case 'unclear':
            toast({
              title: "Need clarification",
              description: parsed.message || "Could you please be more specific?",
            });
            break;
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        toast({
          title: "Processing error",
          description: "Couldn't understand the input. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Voice processing failed:', error);
      toast({
        title: "Error",
        description: "Failed to process voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 via-purple-800 to-black border-0 shadow-2xl">
        <div className="p-6 text-center space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Voice Input</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Animated Water-like Visualization */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
            <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 opacity-40 ${isListening ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-cyan-200 via-blue-300 to-purple-400 opacity-60 ${isListening ? 'animate-pulse' : ''}`}></div>
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white via-cyan-100 to-blue-200 flex items-center justify-center">
              {isListening ? (
                <Mic className="w-8 h-8 text-blue-600 animate-bounce" />
              ) : (
                <MicOff className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/80 text-sm">
              {isProcessing ? "Processing..." : isListening ? "Listening..." : "Tap to speak"}
            </p>
            {transcript && (
              <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                "{transcript}"
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`${
                isListening 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              } text-white`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-white/60">
            Say things like "I ate two chapatis" or "I drank a glass of water" or "I did yoga for 30 minutes"
          </p>
        </div>
      </Card>
    </div>
  );
};