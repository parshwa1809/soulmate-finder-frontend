
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart, Check, X } from "lucide-react";
import { config } from "../config/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailVerification = async (email: string) => {
    if (!email) return;
    
    setEmailChecking(true);
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(`${config.URL}/verify:email`, {
        method: 'POST',
        body: formData,
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
      const submitFormData = new FormData();
      
      const metadata = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      };

      submitFormData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${config.URL}/account:create`, {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();
      
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
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
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
