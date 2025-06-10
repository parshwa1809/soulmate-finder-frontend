
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const sendOTP = async () => {
    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a 10 digit phone number",
      });
      return;
    }
    setLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setShowOTPInput(true);
      setLoading(false);
      toast({
        title: "OTP sent",
        description: "Please enter the OTP sent to your phone number",
      });
    }, 1000);
  };

  const verifyOTP = async () => {
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      if (otp === "123456") {
        localStorage.setItem("authToken", "demo-token");
        toast({
          title: "Success",
          description: "Phone auth successful",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP. Try 123456",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Add logo at the top to test */}
      <div className="flex justify-center pt-8 pb-4">
        <Logo size="lg" />
      </div>
      
      {/* Test font separately */}
      <div className="text-center pb-8">
        <h1 className="font-antrokas text-4xl text-white">Antrokas Font Test</h1>
      </div>
      
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md bg-gradient-card nebula-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Welcome to Aligned
            </CardTitle>
            <CardDescription className="text-center">
              Enter your phone number to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="555-555-5555"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={showOTPInput}
              />
            </div>
            {showOTPInput && (
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={showOTPInput ? verifyOTP : sendOTP}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {showOTPInput ? "Verify OTP" : "Send OTP"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
