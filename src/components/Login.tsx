import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Heart, Lock, User, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({ email, password }));

      const response = await fetch(`${config.URL}/account:login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.LOGIN === "SUCCESSFUL") {
        // Fetch user profile after successful login
        const profileData = await fetchUserProfile(data.UID);
        
        // Extract UIDs from recommendations (first item in each array)
        const recommendationUIDs = data.RECOMMENDATIONS?.map((rec: any[]) => rec[0]) || [];
        console.log('Extracted recommendation UIDs:', recommendationUIDs);
        
        // Fetch profiles for each recommendation UID
        const recommendationProfiles = await Promise.all(
          recommendationUIDs.map((uid: string) => fetchUserProfile(uid))
        );
        
        // Filter out null responses
        const validRecommendations = recommendationProfiles.filter(profile => profile !== null);
        console.log('Fetched recommendation profiles:', validRecommendations);

        // Transform the backend data structure to match the frontend expectations
        const transformedUserData = {
          UID: data.UID,
          LOGIN: data.LOGIN,
          ERROR: data.ERROR,
          profile: profileData,
          matches: data.MATCHED || [],
          recommendations: validRecommendations,
          notifications: data.NOTIFICATIONS || [],
          awaiting: data.AWAITING || []
        };

        console.log('Transformed user data:', transformedUserData);

        setUserUID(data.UID);
        localStorage.setItem('userUID', data.UID);
        localStorage.setItem('userData', JSON.stringify(transformedUserData));
        setIsLoggedIn(true);
      } else {
        // Handle unsuccessful login response
        if (data.LOGIN === "UNSUCCESSFUL" || data.ERROR !== "OK") {
          setError(data.ERROR || 'Invalid email or password. Please try again.');
        } else {
          setError('Login failed');
        }
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card shadow-lg border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in to find your perfect match
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background border-border focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full h-11 border-border text-foreground hover:bg-muted font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Demo Login
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
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
