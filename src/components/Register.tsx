import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Check, X, Calendar as CalendarIcon, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { config } from "../config/api";

const hobbiesOptions = [
  "Reading", "Traveling", "Cooking", "Sports", "Music", "Movies", 
  "Photography", "Dancing", "Fitness", "Gaming", "Art", "Gardening",
  "Writing", "Technology", "Fashion", "Yoga", "Swimming", "Hiking"
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    cityOfResidence: "",
    countryOfResidence: "",
    cityOfBirth: "",
    countryOfBirth: "",
    dateOfBirth: null as Date | null,
    gender: "",
    hobbies: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string | Date | null | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };

  const handleEmailVerification = async (email: string) => {
    if (!email) return;
    
    setEmailChecking(true);
    try {
      const response = await fetch(`${config.URL}/verify:email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const isAvailable = await response.json();
      setEmailVerified(isAvailable);
      
      if (!isAvailable) {
        setError('Email already exists. Please use a different email.');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError('Failed to verify email. Please try again.');
    } finally {
      setEmailChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!emailVerified) {
      setError('Please verify your email first');
      setIsLoading(false);
      return;
    }

    try {
      const jsonData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        cityOfResidence: formData.cityOfResidence,
        countryOfResidence: formData.countryOfResidence,
        cityOfBirth: formData.cityOfBirth,
        countryOfBirth: formData.countryOfBirth,
        dateOfBirth: formData.dateOfBirth ? format(formData.dateOfBirth, 'MM/dd/yyyy') : '',
        gender: formData.gender,
        hobbies: formData.hobbies,
      };

      console.log('Sending registration data:', jsonData);

      const response = await fetch(`${config.URL}/account:create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      const data = await response.json();
      console.log('Backend response:', data);
      
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Join Love Bhagya
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Create your profile and find your soulmate
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    if (e.target.value) {
                      handleEmailVerification(e.target.value);
                    }
                  }}
                  className="h-12 pr-10"
                  required
                />
                {emailChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                )}
                {!emailChecking && formData.email && emailVerified && (
                  <Check className="absolute right-3 top-3 h-6 w-6 text-green-500" />
                )}
                {!emailChecking && formData.email && !emailVerified && (
                  <X className="absolute right-3 top-3 h-6 w-6 text-red-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-12 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cityOfResidence">City of Residence</Label>
                <Input
                  id="cityOfResidence"
                  value={formData.cityOfResidence}
                  onChange={(e) => handleInputChange('cityOfResidence', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryOfResidence">Country of Residence</Label>
                <Input
                  id="countryOfResidence"
                  value={formData.countryOfResidence}
                  onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cityOfBirth">City of Birth</Label>
                <Input
                  id="cityOfBirth"
                  value={formData.cityOfBirth}
                  onChange={(e) => handleInputChange('cityOfBirth', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryOfBirth">Country of Birth</Label>
                <Input
                  id="countryOfBirth"
                  value={formData.countryOfBirth}
                  onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-12 w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? format(formData.dateOfBirth, "MM/dd/yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth || undefined}
                      onSelect={(date) => handleInputChange('dateOfBirth', date || null)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="flex flex-row space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hobbies & Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {hobbiesOptions.map((hobby) => (
                  <div key={hobby} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={hobby}
                      checked={formData.hobbies.includes(hobby)}
                      onChange={() => handleHobbyToggle(hobby)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={hobby} className="text-sm">{hobby}</Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !emailVerified}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium rounded-md transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
