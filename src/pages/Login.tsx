import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, Crown, Sparkles, Gem, Star } from "lucide-react";

interface LoginProps {
  onAuthSuccess: () => void;
}

export const Login = ({ onAuthSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials.');
          }
          throw error;
        }
        
        if (data.user) {
          toast({
            title: "Welcome back! 👑",
            description: "Successfully signed in to your premium account",
          });
          onAuthSuccess();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Account already exists. Please sign in instead.');
          }
          throw error;
        }
        
        if (data.user) {
          if (!data.user.email_confirmed_at) {
            toast({
              title: "Premium Account Created! 💎",
              description: "Please check your email and click the verification link to activate your premium account.",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Premium Account Created! 🌟",
              description: "Welcome to FitAI Premium - Your luxury fitness journey begins!",
            });
            onAuthSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),rgba(0,0,0,0))]"></div>
      
      {/* Floating Luxury Elements */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute top-32 right-32 w-20 h-20 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 rounded-full opacity-15 animate-ping"></div>
      
      <Card className="w-full max-w-md border-0 shadow-2xl bg-black/20 backdrop-blur-2xl relative z-10 overflow-hidden">
        {/* Premium Card Header */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
        
        <CardHeader className="text-center pb-8 relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
            <Crown className="w-10 h-10 text-white relative z-10" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            FitAI Premium
          </CardTitle>
          <CardDescription className="text-purple-100/80 text-lg leading-relaxed">
            {isLogin ? (
              <span className="flex items-center justify-center gap-2">
                <Gem className="w-4 h-4" />
                Welcome back to luxury fitness
                <Gem className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Join the elite fitness experience
                <Star className="w-4 h-4" />
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-semibold text-sm uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your premium email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-purple-200/70 focus:border-purple-400 focus:ring-purple-400 focus:ring-2 backdrop-blur-sm rounded-xl transition-all duration-300 group-focus-within:bg-white/15"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-focus-within:from-purple-500/20 group-focus-within:via-pink-500/10 group-focus-within:to-blue-500/20 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-semibold text-sm uppercase tracking-wider">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-12 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-purple-200/70 focus:border-purple-400 focus:ring-purple-400 focus:ring-2 backdrop-blur-sm rounded-xl transition-all duration-300 group-focus-within:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-focus-within:from-purple-500/20 group-focus-within:via-pink-500/10 group-focus-within:to-blue-500/20 transition-all duration-300 pointer-events-none"></div>
              </div>
              {!isLogin && (
                <p className="text-xs text-purple-200/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-[1.02] rounded-xl relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 relative z-10">
                  <Crown className="w-6 h-6" />
                  <span>{isLogin ? "Access Premium" : "Join Premium"}</span>
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="text-center pt-4">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
              }}
              className="text-purple-200 hover:text-white font-semibold transition-colors text-base"
            >
              {isLogin ? (
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Don't have a premium account? Join now
                  <Star className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gem className="w-4 h-4" />
                  Already have premium access? Sign in
                  <Gem className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
          
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-xs text-purple-200/70 leading-relaxed">
              By continuing, you agree to our <span className="text-white">Terms of Service</span> and <span className="text-white">Privacy Policy</span>
            </p>
            <div className="flex items-center justify-center gap-1 mt-2 text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs text-purple-200/70 ml-2">Premium Experience</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};