
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar } from "lucide-react";

export const QuickStats = () => {
  const stats = [
    {
      title: "Today's Calories",
      value: "1,247",
      subtitle: "kcal consumed",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "Weekly Average",
      value: "1,856",
      subtitle: "kcal per day",
      icon: Calendar,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      title: "Progress",
      value: "+2.1kg",
      subtitle: "this month",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br ${stat.bgColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-600 mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
