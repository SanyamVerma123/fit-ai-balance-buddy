
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Minus, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import waterBanner from "@/assets/water-banner.jpg";

interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

interface WaterIntakeTrackerProps {
  onWaterAdd: (amount: number) => void;
}

const waterSizes = [
  { label: "Small Glass", amount: 200, icon: "🥛" },
  { label: "Large Glass", amount: 350, icon: "🥤" },
  { label: "Bottle", amount: 500, icon: "🍼" },
  { label: "Large Bottle", amount: 750, icon: "🍶" }
];

export const WaterIntakeTracker = ({ onWaterAdd }: WaterIntakeTrackerProps) => {
  const [todayWater, setTodayWater] = useState<WaterEntry[]>([]);
  const [customAmount, setCustomAmount] = useState(250);
  const { toast } = useToast();

  const today = new Date().toDateString();

  useEffect(() => {
    const waterLog = JSON.parse(localStorage.getItem('dailyWaterLog') || '[]')
      .filter((entry: WaterEntry) => new Date(entry.timestamp).toDateString() === today);
    setTodayWater(waterLog);
  }, [today]);

  const addWater = (amount: number) => {
    const waterEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date().toISOString()
    };

    const updatedWater = [...todayWater, waterEntry];
    setTodayWater(updatedWater);

    // Save to localStorage
    const existingLog = JSON.parse(localStorage.getItem('dailyWaterLog') || '[]');
    const newLog = [...existingLog, waterEntry];
    localStorage.setItem('dailyWaterLog', JSON.stringify(newLog));

    // Trigger storage event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dailyWaterLog',
      newValue: JSON.stringify(newLog)
    }));

    onWaterAdd(amount);

    toast({
      title: "Water Added!",
      description: `Added ${amount}ml to your daily intake`,
    });
  };

  const totalWater = todayWater.reduce((sum, entry) => sum + entry.amount, 0);
  const waterGoal = 2000; // 2L daily goal
  const progressPercentage = Math.min((totalWater / waterGoal) * 100, 100);

  return (
    <div className="space-y-4 w-full">
      {/* Hero Banner */}
      <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden shadow-elegant">
        <img 
          src={waterBanner} 
          alt="Water hydration banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-dark opacity-60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 justify-center">
              <Waves className="w-4 h-4" />
              Water Intake
            </h2>
            <p className="text-xs opacity-90">Stay hydrated</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 w-full professional-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <Droplets className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Daily Hydration</span>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Animated Water Level */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Today's Progress</span>
            <Badge variant="secondary" className="text-xs gradient-primary text-white">
              {totalWater}ml / {waterGoal}ml
            </Badge>
          </div>
          
          {/* Water Glass Animation */}
          <div className="relative mx-auto w-24 h-32 border-2 border-blue-300 rounded-b-3xl bg-gradient-to-b from-transparent to-blue-50">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-cyan-300 rounded-b-3xl transition-all duration-1000 ease-out"
              style={{ height: `${progressPercentage}%` }}
            >
              <div className="absolute top-0 w-full h-2 bg-white/20 animate-pulse"></div>
              <div className="absolute top-1 w-full h-1 bg-white/40 animate-bounce"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className={`w-6 h-6 ${progressPercentage > 50 ? 'text-white' : 'text-blue-400'} animate-pulse`} />
            </div>
          </div>
          
          <p className="text-xs text-gray-600 text-center font-medium">
            {progressPercentage.toFixed(0)}% of daily goal
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {waterSizes.map((size, index) => (
            <Button
              key={index}
              onClick={() => addWater(size.amount)}
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-3 h-auto flex-col gap-1"
            >
              <span className="text-lg">{size.icon}</span>
              <span className="text-xs font-medium">{size.label}</span>
              <span className="text-xs text-gray-600">{size.amount}ml</span>
            </Button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Custom Amount</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCustomAmount(Math.max(50, customAmount - 50))}
                disabled={customAmount <= 50}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {customAmount}ml
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCustomAmount(Math.min(1000, customAmount + 50))}
                disabled={customAmount >= 1000}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Button
            onClick={() => addWater(customAmount)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Droplets className="w-4 h-4 mr-2" />
            Add {customAmount}ml
          </Button>
        </div>

        {/* Recent entries */}
        {todayWater.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Recent Intake</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {todayWater.slice(-3).reverse().map((entry) => (
                <div key={entry.id} className="flex justify-between text-xs text-gray-600">
                  <span>{entry.amount}ml</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
