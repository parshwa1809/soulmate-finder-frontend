
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, ArrowLeft } from "lucide-react";

interface User {
  UID: string;
  name: string;
  email?: string;
  city?: string;
  country?: string;
  age?: number;
  gender?: string;
  hobbies?: string;
  profilePicture?: string;
  bio?: string;
}

interface ProfileViewProps {
  user: User;
  onBack: () => void;
  children?: React.ReactNode;
}

const ProfileView = ({ user, onBack, children }: ProfileViewProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        onClick={onBack}
        variant="ghost" 
        className="mb-4 text-orange-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-2xl">
                {user.name?.charAt(0) || <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name || 'Unknown User'}
            </h1>
            
            <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
              {user.age && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {user.age} years old
                </div>
              )}
              {user.city && user.country && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.city}, {user.country}
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">{user.bio}</p>
            </div>
          )}

          {user.hobbies && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.split(',').map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
                    {hobby.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
