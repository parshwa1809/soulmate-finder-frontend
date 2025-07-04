
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, User, ArrowLeft } from "lucide-react";
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

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userUID');
    setUserUID(uid);
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        await loadUsersForCategory(parsedData.matches || [], setMatches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
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
    loadMatches();
    setSelectedUser(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-white/40">
      <CardContent className="p-6" onClick={() => handleUserClick(user)}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              {user.name?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white truncate group-hover:text-violet-200 transition-colors">
              {user.name || 'Unknown User'}
            </h3>
            {user.city && user.country && (
              <p className="text-sm text-white/70 truncate">
                {user.city}, {user.country}
              </p>
            )}
            {user.age && (
              <p className="text-sm text-white/70">
                {user.age} years old
              </p>
            )}
            {user.hobbies && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {user.hobbies.split(',').slice(0, 3).map((hobby, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white/80">
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
      <div className="w-16 h-16 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
        <Heart className="w-8 h-8 text-white/70" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
      <p className="text-white/70 max-w-md mx-auto">Keep swiping to find your perfect match! When someone likes you back, they'll appear here.</p>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/70">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={handleBackToDashboard}
            variant="ghost" 
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-white">Matches</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-violet-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your Matches</h2>
          </div>
          <p className="text-white/70">People who liked you back - it's a match!</p>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matches.map((user) => (
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

export default Matches;
