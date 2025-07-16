
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Brain } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

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
          model: 'llama3-70b-8192',
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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Calorie Goal
        </CardTitle>
        <CardDescription>
          Personalized daily calorie target calculated by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculatedGoal ? (
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {calculatedGoal} kcal
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Daily calorie goal for {userProfile?.goal} weight
            </p>
            <Button 
              onClick={calculateCalorieGoalWithAI}
              disabled={isCalculating}
              variant="outline"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              onClick={calculateCalorieGoalWithAI}
              disabled={isCalculating}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Calculate AI Goal
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
