
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/api";
import ProfileView from "../components/ProfileView";
import UserActions from "../components/UserActions";

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

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userUID');
    setUserUID(uid);
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        await loadUsersForCategory(parsedData.recommendations || [], setRecommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersForCategory = async (userList: any[], setter: (users: User[]) => void) => {
    try {
      const userPromises = userList.map(async (item) => {
        const uid = item.UID || item;
        const response = await fetch(`${config.URL}/get:${uid}`, {
          method: 'POST',
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      });

      const users = (await Promise.all(userPromises)).filter(Boolean);
      setter(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setter([]);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleActionComplete = () => {
    loadRecommendations();
    setSelectedUser(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-card border-border cursor-pointer hover:border-primary/20">
      <CardContent className="p-6" onClick={() => handleUserClick(user)}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16 ring-2 ring-border group-hover:ring-primary/20 transition-all">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {user.name || 'Unknown User'}
            </h3>
            {user.city && user.country && (
              <p className="text-sm text-muted-foreground truncate">
                {user.city}, {user.country}
              </p>
            )}
            {user.age && (
              <p className="text-sm text-muted-foreground">
                {user.age} years old
              </p>
            )}
            {user.hobbies && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {user.hobbies.split(',').slice(0, 3).map((hobby, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {hobby.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No recommendations</h3>
      <p className="text-muted-foreground max-w-md mx-auto">We're finding the perfect people for you! Check back soon for new recommendations.</p>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <ProfileView user={selectedUser} onBack={handleBackToList}>
            <UserActions 
              userUID={selectedUser.UID} 
              currentUserUID={userUID}
              onActionComplete={handleActionComplete}
            />
          </ProfileView>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={handleBackToDashboard}
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-foreground">Discover</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Discover New People</h2>
          </div>
          <p className="text-muted-foreground">Profiles our algorithm thinks you'll love</p>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((user) => (
              <UserCard key={user.UID} user={user} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Recommendations;
