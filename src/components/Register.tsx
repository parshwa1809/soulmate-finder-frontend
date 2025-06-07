
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
import { Heart, Check, X, Calendar as CalendarIcon, Eye, EyeOff, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { config } from "../config/api";
import ImageUpload from "./ImageUpload";
import { countries, getCitiesForCountry } from "../data/locations";

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
    confirmPassword: "",
    city: "",
    country: "",
    profession: "",
    birth_city: "",
    birth_country: "",
    dob: null as Date | null,
    tob: "",
    gender: "",
    hobbies: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string | Date | null | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset city when country changes
      if (field === 'country') {
        newData.city = "";
      }
      
      // Reset birth_city when birth_country changes
      if (field === 'birth_country') {
        newData.birth_city = "";
      }
      
      return newData;
    });
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
      const response = await fetch(`${config.URL}${config.ENDPOINTS.VERIFY_EMAIL}`, {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one profile picture');
      setIsLoading(false);
      return;
    }

    try {
      const metadata = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        country: formData.country,
        profession: formData.profession,
        birth_city: formData.birth_city,
        birth_country: formData.birth_country,
        dob: formData.dob ? format(formData.dob, 'yyyy-MM-dd') : '',
        tob: formData.tob,
        gender: formData.gender,
        hobbies: formData.hobbies,
      };

      const formDataToSend = new FormData();
      formDataToSend.append('metadata', JSON.stringify(metadata));
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      console.log('Sending registration data to account:create endpoint:', metadata);

      const response = await fetch(`${config.URL}${config.ENDPOINTS.CREATE_ACCOUNT}`, {
        method: 'POST',
        body: formDataToSend,
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

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const availableCities = formData.country ? getCitiesForCountry(formData.country) : [];
  const availableBirthCities = formData.birth_country ? getCitiesForCountry(formData.birth_country) : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Join Love Bhagya
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-sm sm:text-base">
              Create your profile and find your soulmate
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Email with verification */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
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
                  className="h-10 sm:h-12 pr-10 text-sm sm:text-base"
                  required
                />
                {emailChecking && (
                  <div className="absolute right-3 top-2 sm:top-3">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-orange-500"></div>
                  </div>
                )}
                {!emailChecking && formData.email && emailVerified && (
                  <Check className="absolute right-3 top-2 sm:top-3 h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                )}
                {!emailChecking && formData.email && !emailVerified && (
                  <X className="absolute right-3 top-2 sm:top-3 h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                )}
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-10 sm:h-12 pr-10 text-sm sm:text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 sm:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Eye className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-10 sm:h-12 pr-10 text-sm sm:text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 sm:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Eye className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </button>
                  {formData.confirmPassword && (
                    <div className="absolute right-10 sm:right-12 top-2 sm:top-3">
                      {passwordsMatch && <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />}
                      {passwordsDontMatch && <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />}
                    </div>
                  )}
                </div>
                {passwordsDontMatch && (
                  <p className="text-xs sm:text-sm text-red-500">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Location information with dependent dropdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-50 bg-white">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country} className="text-sm sm:text-base">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => handleInputChange('city', value)}
                  disabled={!formData.country}
                >
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder={formData.country ? "Select your city" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-50 bg-white">
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city} className="text-sm sm:text-base">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-sm font-medium">Profession</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
                placeholder="e.g., Software Engineer, Doctor, Teacher"
                required
              />
            </div>

            {/* Birth location with dependent dropdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_country" className="text-sm font-medium">Country of Birth</Label>
                <Select value={formData.birth_country} onValueChange={(value) => handleInputChange('birth_country', value)}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder="Select country of birth" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-50 bg-white">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country} className="text-sm sm:text-base">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_city" className="text-sm font-medium">City of Birth</Label>
                <Select 
                  value={formData.birth_city} 
                  onValueChange={(value) => handleInputChange('birth_city', value)}
                  disabled={!formData.birth_country}
                >
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder={formData.birth_country ? "Select city of birth" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-50 bg-white">
                    {availableBirthCities.map((city) => (
                      <SelectItem key={city} value={city} className="text-sm sm:text-base">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and time of birth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 sm:h-12 w-full justify-start text-left font-normal text-sm sm:text-base",
                        !formData.dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob ? format(formData.dob, "yyyy-MM-dd") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dob || undefined}
                      onSelect={(date) => handleInputChange('dob', date || null)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tob" className="text-sm font-medium">Time of Birth</Label>
                <div className="relative">
                  <Input
                    id="tob"
                    type="time"
                    value={formData.tob}
                    onChange={(e) => handleInputChange('tob', e.target.value)}
                    className="h-10 sm:h-12 pr-10 text-sm sm:text-base"
                    placeholder="14:30"
                    required
                  />
                  <Clock className="absolute right-3 top-2 sm:top-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500">Format: 24-hour time (e.g., 14:30 for 2:30 PM)</p>
              </div>
            </div>

            {/* Gender selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="text-sm">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="text-sm">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-sm">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Hobbies selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hobbies & Interests</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {hobbiesOptions.map((hobby) => (
                  <div key={hobby} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={hobby}
                      checked={formData.hobbies.includes(hobby)}
                      onChange={() => handleHobbyToggle(hobby)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={hobby} className="text-xs sm:text-sm">{hobby}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Image upload section */}
            <ImageUpload images={images} onImagesChange={setImages} />

            {error && (
              <div className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !emailVerified || passwordsDontMatch || images.length === 0}
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium rounded-md transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center">
              <span className="text-gray-600 text-sm sm:text-base">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors text-sm sm:text-base"
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
