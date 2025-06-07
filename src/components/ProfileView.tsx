
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
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-border">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user.name?.charAt(0) || <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {user.name || 'Unknown User'}
            </h1>
            
            <div className="flex items-center justify-center flex-wrap gap-4 text-muted-foreground mb-6">
              {user.age && (
                <div className="flex items-center bg-muted rounded-full px-3 py-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {user.age} years old
                </div>
              )}
              {user.city && user.country && (
                <div className="flex items-center bg-muted rounded-full px-3 py-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.city}, {user.country}
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-4">
                {user.bio}
              </p>
            </div>
          )}

          {user.hobbies && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.split(',').map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {hobby.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {children && (
            <div className="border-t border-border pt-6">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
