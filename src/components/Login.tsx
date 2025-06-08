import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Heart, Lock, Eye, EyeOff } from "lucide-react";
import { config } from "../config/api";
import { useToast } from "@/components/ui/use-toast";

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setUserUID: (uid: string) => void;
}

const Login = ({ setIsLoggedIn, setUserUID }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log(`Fetching user profile for UID: ${uid}`);

      const response = await fetch(`${config.URL}${config.ENDPOINTS.GET_PROFILE}/${uid}`, {
        method: 'GET',
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log('User profile fetched successfully:', profileData);
        return profileData;
      } else {
        console.error(`Failed to fetch user profile, status: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const safeSetLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('LocalStorage quota exceeded:', error);
      toast({
        title: "Storage Warning",
        description: "Unable to cache user data. You may need to login again after closing the browser.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('Attempting login with email:', email);
      
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({ email, password }));

      console.log('Sending login request to:', `${config.URL}/account:login`);
      
      const response = await fetch(`${config.URL}/account:login`, {
        method: 'POST',
        body: formData,
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (response.ok && data.LOGIN === "SUCCESSFUL") {
        console.log('Login successful for UID:', data.UID);
        
        // Store user UID
        setUserUID(data.UID);
        safeSetLocalStorage('userUID', data.UID);
        
        // Process and store the complete user data from API response
        const userData = {
          UID: data.UID,
          LOGIN: data.LOGIN,
          recommendations: data.RECOMMENDATIONS || [],
          matches: data.MATCHED || [],
          notifications: data.NOTIFICATIONS || [],
          awaiting: data.AWAITING || []
        };
        
        console.log('Storing user data:', userData);
        safeSetLocalStorage('userData', JSON.stringify(userData));
        
        setIsLoggedIn(true);
        
        toast({
          title: "Login Successful",
          description: `Welcome back! Found ${userData.recommendations.length} recommendations.`,
        });
        
      } else {
        console.error('Login failed:', data);
        if (data.LOGIN === "UNSUCCESSFUL" || data.ERROR !== "OK") {
          setError(data.ERROR || 'Invalid email or password. Please try again.');
        } else {
          setError('Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md shadow-2xl border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/70 mt-2">
              Sign in to find your perfect match
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-200 text-sm text-center bg-red-500/20 p-3 rounded-md border border-red-300/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center">
              <span className="text-white/70">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-violet-200 hover:text-white font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
