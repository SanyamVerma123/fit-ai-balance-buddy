import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, MapPin, Clock, Star, Send, Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Message Sent! 📧",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: "onlyforwork658@gmail.com",
      description: "Get help within 24 hours"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "Available in app",
      description: "Instant AI assistance"
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "< 24 hours",
      description: "Average support response"
    },
    {
      icon: Star,
      title: "User Rating",
      value: "4.9/5 stars",
      description: "Based on user feedback"
    }
  ];

  const categories = [
    { value: "bug", label: "🐛 Bug Report" },
    { value: "feature", label: "💡 Feature Request" },
    { value: "support", label: "🆘 Technical Support" },
    { value: "feedback", label: "💭 General Feedback" },
    { value: "business", label: "💼 Business Inquiry" },
    { value: "other", label: "❓ Other" }
  ];

  const faqs = [
    {
      question: "How do I reset my data?",
      answer: "Go to Settings > Data Management > Reset All Data"
    },
    {
      question: "Why isn't my food being recognized?",
      answer: "Ensure good lighting and clear images. Try manual entry if issues persist."
    },
    {
      question: "How do I change my fitness goals?",
      answer: "Navigate to Profile > Goals and update your preferences."
    },
    {
      question: "Is there a premium version?",
      answer: "All features are currently free. Premium features may be added in future updates."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contact & Support
            </h1>
            <p className="text-gray-600">We're here to help you succeed</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="professional-card text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-1">{info.title}</h3>
                  <div className="text-lg font-bold text-foreground mb-1">{info.value}</div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Send className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Have a question or feedback? We'd love to hear from you!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-white shadow-glow"
                    disabled={!formData.name || !formData.email || !formData.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Help & FAQ */}
            <div className="space-y-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <MessageSquare className="w-5 h-5" />
                    Quick Help
                  </CardTitle>
                  <CardDescription>
                    Common questions and instant solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-sm text-accent mb-1">{faq.question}</h4>
                        <p className="text-xs text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Heart className="w-5 h-5" />
                    Community Support
                  </CardTitle>
                  <CardDescription>
                    Connect with other FitTracker AI users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">💬</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-600">User Forum</h4>
                      <p className="text-xs text-muted-foreground">Share tips and get advice from the community</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">📚</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-600">Knowledge Base</h4>
                      <p className="text-xs text-muted-foreground">Comprehensive guides and tutorials</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">🎥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600">Video Tutorials</h4>
                      <p className="text-xs text-muted-foreground">Step-by-step video guides</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Message */}
          <Card className="professional-card gradient-accent text-white">
            <CardContent className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">We Value Your Feedback</h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-4">
                Your input helps us improve FitTracker AI for everyone. Whether it's a bug report, 
                feature suggestion, or just saying hello, we appreciate every message.
              </p>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                ⚡ Usually respond within 24 hours
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}