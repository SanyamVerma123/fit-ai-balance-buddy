
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Brain, Zap } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import goalBanner from "@/assets/goal-banner.jpg";

interface AiCalorieGoalCalculatorProps {
  onGoalCalculated: (goal: number) => void;
}

export const AiCalorieGoalCalculator = ({ onGoalCalculated }: AiCalorieGoalCalculatorProps) => {
  const { userProfile } = useUserProfile();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedGoal, setCalculatedGoal] = useState<number | null>(null);
  const { toast } = useToast();

  const calculateCalorieGoalWithAI = async () => {
    if (!userProfile) return;

    setIsCalculating(true);
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
              content: 'You are a nutritionist. Calculate daily calorie goals based on user profile. Return ONLY a JSON object with this exact format: {"daily_calories": number}. Use standard formulas like BMR and activity level.'
            },
            {
              role: 'user',
              content: `Calculate daily calorie goal for: 
              - Gender: ${userProfile.gender}
              - Age: ${userProfile.age} years
              - Height: ${userProfile.height} cm
              - Weight: ${userProfile.weight} kg
              - Goal: ${userProfile.goal} weight
              - Activity Level: ${userProfile.activityLevel}
              - Target Weight: ${userProfile.targetWeight} kg`
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate goal');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        const goal = parsed.daily_calories || 2000;
        setCalculatedGoal(goal);
        onGoalCalculated(goal);
        
        toast({
          title: "AI Goal Calculated!",
          description: `Your personalized daily calorie goal: ${goal} kcal`,
        });
      } catch {
        const fallbackGoal = userProfile.goal === 'gain' ? 2500 : userProfile.goal === 'loss' ? 1800 : 2200;
        setCalculatedGoal(fallbackGoal);
        onGoalCalculated(fallbackGoal);
        
        toast({
          title: "Goal Calculated",
          description: `Estimated daily calorie goal: ${fallbackGoal} kcal`,
        });
      }
    } catch (error) {
      console.error('AI goal calculation failed:', error);
      const fallbackGoal = userProfile.goal === 'gain' ? 2500 : userProfile.goal === 'loss' ? 1800 : 2200;
      setCalculatedGoal(fallbackGoal);
      onGoalCalculated(fallbackGoal);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (userProfile && !calculatedGoal) {
      calculateCalorieGoalWithAI();
    }
  }, [userProfile]);

  return (
    <div className="space-y-3 w-full">
      {/* Compact Banner */}
      <div className="relative h-16 rounded-lg overflow-hidden shadow-glow">
        <img 
          src={goalBanner} 
          alt="AI calorie goal" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-dark opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xs font-bold flex items-center gap-1 justify-center">
              <Zap className="w-3 h-3" />
              AI Goal
            </h2>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 professional-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-purple-600" />
            Daily Target
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {calculatedGoal ? (
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 mb-1">
                {calculatedGoal} kcal
              </div>
              <p className="text-xs text-gray-600 mb-2">
                For {userProfile?.goal} weight
              </p>
              <Button 
                onClick={calculateCalorieGoalWithAI}
                disabled={isCalculating}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                <Target className="w-3 h-3 mr-1" />
                Recalculate
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Button 
                onClick={calculateCalorieGoalWithAI}
                disabled={isCalculating}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-xs h-8"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Brain className="w-3 h-3 mr-1" />
                    Calculate
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
