import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Utensils, Dumbbell, Target, Brain, Camera, Users, MessageCircle } from "lucide-react";

export default function Help() {
  const faqs = [
    {
      question: "How do I track my meals effectively?",
      answer: "Use our AI-powered meal tracker to log your food. You can type food names (like '2 chapati'), take photos of your meals, or get AI suggestions. The system automatically calculates calories, protein, carbs, and fat content for accurate nutrition tracking."
    },
    {
      question: "How does the AI food recognition work?",
      answer: "Our AI uses advanced computer vision to analyze food photos and identify ingredients. Simply take a photo of your meal, and the AI will recognize the food items and estimate their nutritional content. For best results, ensure good lighting and clear images."
    },
    {
      question: "How do I set and track my fitness goals?",
      answer: "Navigate to your profile to set your fitness goals (weight loss, gain, or maintenance). The app will calculate your daily calorie needs and track your progress. Monitor your weight changes and nutrition intake through the Progress section."
    },
    {
      question: "What workout tracking features are available?",
      answer: "Track various exercises with duration, intensity, and calories burned. The AI can suggest workouts based on your goals and fitness level. All workout data is integrated with your nutrition tracking for comprehensive health monitoring."
    },
    {
      question: "How does the AI coaching work?",
      answer: "Our AI coach provides personalized advice based on your goals, current progress, and dietary preferences. Ask questions about nutrition, exercise, or general fitness. The AI remembers your conversation history for better context."
    },
    {
      question: "Can I track water intake?",
      answer: "Yes! Use the water tracker to log your daily hydration. Set reminders and track your progress toward daily hydration goals. Proper hydration is essential for optimal fitness results."
    },
    {
      question: "How accurate are the calorie calculations?",
      answer: "Our AI provides estimates based on standard nutritional data and food recognition. For precise tracking, you can manually adjust values. The system learns from your inputs to improve accuracy over time."
    },
    {
      question: "Can I export my data?",
      answer: "Your data is stored locally on your device for privacy. You can view detailed progress reports and weekly summaries. Future updates will include data export features."
    },
    {
      question: "How do I get the most accurate AI suggestions?",
      answer: "Be specific when describing foods (include quantity and preparation method). For photos, ensure good lighting and include the entire meal. The AI works better with clear, detailed inputs."
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes! All your data is stored locally on your device. We don't collect or store personal information on external servers. Your privacy and data security are our top priorities."
    }
  ];

  const features = [
    {
      icon: Utensils,
      title: "Smart Meal Tracking",
      description: "AI-powered food recognition and nutrition analysis",
      tips: ["Take clear photos for better recognition", "Be specific with quantities", "Use voice input for quick logging"]
    },
    {
      icon: Brain,
      title: "AI Coaching",
      description: "Personalized fitness and nutrition guidance",
      tips: ["Ask specific questions for better advice", "Mention your goals in conversations", "Regular check-ins improve recommendations"]
    },
    {
      icon: Dumbbell,
      title: "Workout Tracking",
      description: "Comprehensive exercise monitoring",
      tips: ["Log workouts immediately after completion", "Include intensity levels", "Track rest periods between sets"]
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Personalized targets and progress tracking",
      tips: ["Set realistic, achievable goals", "Update goals as you progress", "Review weekly reports for insights"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
            <p className="text-gray-600">Get the most out of FitTracker AI</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Start Guide */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <HelpCircle className="w-5 h-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get started with FitTracker AI in just a few steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    <div className="space-y-1">
                      {feature.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="text-xs bg-muted/50 p-2 rounded-lg">
                          💡 {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about using FitTracker AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Tips & Tricks */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Camera className="w-5 h-5" />
                Pro Tips for Better Results
              </CardTitle>
              <CardDescription>
                Advanced techniques to maximize your fitness tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Food Photography Tips</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">📸</Badge>
                      <p className="text-sm">Use natural lighting when possible for clearer food recognition</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">🍽️</Badge>
                      <p className="text-sm">Include the entire plate or bowl in your photo</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">📐</Badge>
                      <p className="text-sm">Take photos from directly above for best portion estimation</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Tracking Accuracy</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">⚖️</Badge>
                      <p className="text-sm">Weigh ingredients when possible for precise tracking</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">📝</Badge>
                      <p className="text-sm">Log meals immediately after eating for better consistency</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">🔄</Badge>
                      <p className="text-sm">Review and adjust AI suggestions based on your knowledge</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Steps */}
          <Card className="professional-card border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Users className="w-5 h-5" />
                Getting Started Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Complete your profile setup with goals and preferences",
                  "Take your first meal photo to test AI recognition",
                  "Set up your daily calorie and water intake goals",
                  "Try the AI coach by asking a fitness question",
                  "Log your first workout to start tracking progress",
                  "Check your weekly report to review your progress"
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                    <div className="w-6 h-6 gradient-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}