import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Target, Shield, Sparkles, Users, Trophy, Zap } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your food photos and provide accurate nutritional information instantly."
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Custom fitness targets based on your body type, lifestyle, and health objectives for optimal results."
    },
    {
      icon: Sparkles,
      title: "Smart Suggestions",
      description: "Intelligent meal and workout recommendations tailored to your preferences and dietary requirements."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays on your device. We prioritize your privacy and never share personal information."
    }
  ];

  const stats = [
    { label: "Foods Recognized", value: "10,000+", icon: "🍎" },
    { label: "Users Helped", value: "50,000+", icon: "👥" },
    { label: "Meals Tracked", value: "1M+", icon: "🍽️" },
    { label: "Goals Achieved", value: "25,000+", icon: "🎯" }
  ];

  const team = [
    {
      role: "AI Nutrition Expert",
      description: "Advanced food recognition and nutritional analysis powered by cutting-edge machine learning."
    },
    {
      role: "Fitness Coach",
      description: "Personalized workout recommendations and progress tracking for all fitness levels."
    },
    {
      role: "Health Advisor",
      description: "Evidence-based health guidance and goal-setting strategies for sustainable results."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              About FitTracker AI
            </h1>
            <p className="text-gray-600">Your intelligent fitness companion</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Mission Statement */}
          <Card className="professional-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary text-2xl">
                <Heart className="w-6 h-6" />
                Our Mission
              </CardTitle>
              <CardDescription className="text-lg max-w-3xl mx-auto">
                Empowering individuals to achieve their fitness goals through intelligent technology, 
                personalized guidance, and comprehensive health tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  FitTracker AI combines artificial intelligence with proven fitness science to create 
                  a personalized experience that adapts to your unique journey. Whether you're starting 
                  your fitness journey or optimizing your performance, our platform provides the tools 
                  and insights you need to succeed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                Key Features
              </CardTitle>
              <CardDescription>
                Discover what makes FitTracker AI unique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gradient-to-br from-white to-muted/30 rounded-xl border">
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-center">
                <Trophy className="w-5 h-5" />
                Our Impact
              </CardTitle>
              <CardDescription className="text-center">
                Numbers that showcase our community's success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 gradient-food rounded-full flex items-center justify-center mx-auto mb-3 shadow-food">
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Brain className="w-5 h-5" />
                Advanced Technology
              </CardTitle>
              <CardDescription>
                Cutting-edge AI that powers your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {team.map((member, index) => (
                  <div key={index} className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl">
                    <div className="w-16 h-16 gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-accent">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-accent mb-2">{member.role}</h3>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="professional-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary mb-3">Building a Healthier Future</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    We envision a world where achieving and maintaining optimal health is accessible to everyone. 
                    Through innovative AI technology and user-centric design, we're democratizing access to 
                    personalized fitness and nutrition guidance.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Accessibility</h4>
                    <p className="text-sm text-muted-foreground">
                      Making advanced fitness technology available to users of all backgrounds and abilities.
                    </p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold text-accent mb-2">Innovation</h4>
                    <p className="text-sm text-muted-foreground">
                      Continuously improving our AI to provide more accurate and helpful insights.
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-orange-600 mb-2">Community</h4>
                    <p className="text-sm text-muted-foreground">
                      Building a supportive ecosystem where users can achieve their goals together.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="professional-card gradient-primary text-white">
            <CardContent className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Join the FitTracker AI Community</h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-6">
                Start your personalized fitness journey today and experience the power of AI-driven health tracking. 
                Your goals are within reach with the right tools and guidance.
              </p>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 px-6 py-2">
                ✨ Begin Your Transformation
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}