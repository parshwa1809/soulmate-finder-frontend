
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
        className="mb-6 text-white/70 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-white/20">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-2xl">
                {user.name?.charAt(0) || <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {user.name || 'Unknown User'}
            </h1>
            
            <div className="flex items-center justify-center flex-wrap gap-4 text-white/70 mb-6">
              {user.age && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {user.age} years old
                </div>
              )}
              {user.city && user.country && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.city}, {user.country}
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <p className="text-white/80 leading-relaxed bg-white/10 backdrop-blur-sm rounded-lg p-4">
                {user.bio}
              </p>
            </div>
          )}

          {user.hobbies && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.split(',').map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white/90 hover:bg-white/30">
                    {hobby.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {children && (
            <div className="border-t border-white/20 pt-6">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
