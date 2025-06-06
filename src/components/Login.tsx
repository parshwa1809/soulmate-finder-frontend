
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Heart, Lock, User } from "lucide-react";
import { config } from "../config/api";

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setUserUID: (uid: string) => void;
}

const Login = ({ setIsLoggedIn, setUserUID }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.URL}/account:login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserUID(data.UID);
        localStorage.setItem('userUID', data.UID);
        localStorage.setItem('userData', JSON.stringify(data));
        setIsLoggedIn(true);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Clear any existing data first
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    
    const tempUserData = {
      UID: "demo-user-123",
      name: "Demo User",
      email: "demo@example.com",
      city: "San Francisco",
      country: "USA",
      age: 25,
      gender: "Other",
      hobbies: "Reading, Traveling, Photography",
      bio: "This is a demo account for testing purposes",
      profilePicture: "",
      matches: [
        {
          UID: "match1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          city: "Los Angeles",
          country: "USA",
          age: 28,
          gender: "Female",
          hobbies: "Yoga, Cooking, Hiking",
          bio: "Love exploring new places and trying different cuisines!",
          profilePicture: ""
        },
        {
          UID: "match2",
          name: "Michael Chen",
          email: "michael@example.com",
          city: "Seattle",
          country: "USA",
          age: 30,
          gender: "Male",
          hobbies: "Rock Climbing, Gaming, Coffee",
          bio: "Software developer who loves outdoor adventures and great coffee.",
          profilePicture: ""
        }
      ],
      recommendations: [
        {
          UID: "rec1",
          name: "Emma Thompson",
          email: "emma@example.com",
          city: "Portland",
          country: "USA",
          age: 26,
          gender: "Female",
          hobbies: "Art, Music, Dancing",
          bio: "Artist and musician looking for someone who appreciates creativity and good vibes.",
          profilePicture: ""
        },
        {
          UID: "rec2",
          name: "David Rodriguez",
          email: "david@example.com",
          city: "Austin",
          country: "USA",
          age: 29,
          gender: "Male",
          hobbies: "Fitness, Travel, Photography",
          bio: "Fitness enthusiast and travel photographer. Always planning the next adventure!",
          profilePicture: ""
        },
        {
          UID: "rec3",
          name: "Lisa Park",
          email: "lisa@example.com",
          city: "Denver",
          country: "USA",
          age: 27,
          gender: "Female",
          hobbies: "Skiing, Books, Wine Tasting",
          bio: "Book lover and wine enthusiast. Spend winters on the slopes and summers hiking.",
          profilePicture: ""
        },
        {
          UID: "rec4",
          name: "James Wilson",
          email: "james@example.com",
          city: "Miami",
          country: "USA",
          age: 31,
          gender: "Male",
          hobbies: "Surfing, Music Production, Cooking",
          bio: "Music producer who loves surfing and creating amazing dishes. Let's vibe together!",
          profilePicture: ""
        },
        {
          UID: "rec5",
          name: "Anna Martinez",
          email: "anna@example.com",
          city: "Chicago",
          country: "USA",
          age: 24,
          gender: "Female",
          hobbies: "Theater, Volunteering, Yoga",
          bio: "Theater enthusiast who believes in giving back to the community. Namaste!",
          profilePicture: ""
        },
        {
          UID: "rec6",
          name: "Ryan O'Connor",
          email: "ryan@example.com",
          city: "Boston",
          country: "USA",
          age: 28,
          gender: "Male",
          hobbies: "Basketball, Tech, Craft Beer",
          bio: "Tech professional who loves basketball and exploring local breweries.",
          profilePicture: ""
        }
      ],
      notifications: [
        {
          UID: "notif1",
          name: "Jessica Brown",
          email: "jessica@example.com",
          city: "New York",
          country: "USA",
          age: 25,
          gender: "Female",
          hobbies: "Fashion, Art, Brunch",
          bio: "Fashion designer who loves art galleries and weekend brunches.",
          profilePicture: ""
        }
      ],
      awaiting: [
        {
          UID: "await1",
          name: "Alex Kim",
          email: "alex@example.com",
          city: "San Diego",
          country: "USA",
          age: 32,
          gender: "Non-binary",
          hobbies: "Meditation, Gardening, Board Games",
          bio: "Peaceful soul who loves growing plants and strategic board games.",
          profilePicture: ""
        },
        {
          UID: "await2",
          name: "Sophie Turner",
          email: "sophie@example.com",
          city: "Nashville",
          country: "USA",
          age: 26,
          gender: "Female",
          hobbies: "Music, Writing, Coffee Shops",
          bio: "Singer-songwriter who finds inspiration in cozy coffee shops.",
          profilePicture: ""
        }
      ]
    };

    console.log('Setting demo user data:', tempUserData);
    setUserUID(tempUserData.UID);
    localStorage.setItem('userUID', tempUserData.UID);
    localStorage.setItem('userData', JSON.stringify(tempUserData));
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to find your perfect match
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full h-12 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium rounded-md transition-all duration-200"
            >
              <User className="w-4 h-4 mr-2" />
              Demo Login
            </Button>

            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
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
