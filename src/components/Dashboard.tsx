import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Bell, Clock, Users, User } from "lucide-react";
import { config } from "../config/api";
import UserActions from "./UserActions";
import ProfileView from "./ProfileView";

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

interface DashboardProps {
  userUID: string | null;
  setIsLoggedIn: (value: boolean) => void;
}

const Dashboard = ({ userUID, setIsLoggedIn }: DashboardProps) => {
  const [matches, setMatches] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<User[]>([]);
  const [awaiting, setAwaiting] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('Loading user data from localStorage:', parsedData);
        
        // For demo mode, use the data directly from localStorage
        if (userUID === "demo-user-123") {
          setMatches(parsedData.matches || []);
          setRecommendations(parsedData.recommendations || []);
          setNotifications(parsedData.notifications || []);
          setAwaiting(parsedData.awaiting || []);
        } else {
          // For real users, fetch from API with HTTP support
          await Promise.all([
            loadUsersForCategory(parsedData.matches || [], setMatches),
            loadUsersForCategory(parsedData.recommendations || [], setRecommendations), 
            loadUsersForCategory(parsedData.notifications || [], setNotifications),
            loadUsersForCategory(parsedData.awaiting || [], setAwaiting)
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersForCategory = async (userList: any[], setter: (users: User[]) => void) => {
    try {
      const userPromises = userList.map(async (item) => {
        const uid = item.UID || item;
        console.log(`Fetching user data for UID: ${uid} from ${config.URL}/get:${uid}`);
        
        const response = await fetch(`${config.URL}/get:${uid}`, {
          method: 'POST',
          mode: 'cors', // Enable CORS
          headers: {
            'Content-Type': 'application/json',
          },
          // Note: SSL verification handling is done at browser level
          // For development with self-signed certificates, user may need to visit the URL first
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log(`Successfully fetched user data for ${uid}:`, userData);
          return userData;
        } else {
          console.error(`Failed to fetch user ${uid}, status: ${response.status}`);
        }
        return null;
      });

      const users = (await Promise.all(userPromises)).filter(Boolean);
      setter(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      // If HTTPS fails due to SSL issues, log helpful message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('SSL/TLS connection failed. For development, you may need to visit', config.URL, 'directly in your browser and accept the certificate first.');
      }
      setter([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleActionComplete = () => {
    loadUserData(); // Reload data after action
    setSelectedUser(null); // Go back to list
  };

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm cursor-pointer">
      <CardContent className="p-6" onClick={() => handleUserClick(user)}>
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              {user.name?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {user.name || 'Unknown User'}
            </h3>
            {user.city && user.country && (
              <p className="text-sm text-gray-600 truncate">
                {user.city}, {user.country}
              </p>
            )}
            {user.age && (
              <p className="text-sm text-gray-600">
                {user.age} years old
              </p>
            )}
            {user.hobbies && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {user.hobbies.split(',').slice(0, 3).map((hobby, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {hobby.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {showActions && (
          <div onClick={(e) => e.stopPropagation()}>
            <UserActions 
              userUID={user.UID} 
              currentUserUID={userUID}
              onActionComplete={handleActionComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, title, description }: { 
    icon: any; 
    title: string; 
    description: string; 
  }) => (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Your Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Discover your perfect matches</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Discover ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="awaiting" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Awaiting ({awaiting.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Users className="w-5 h-5" />
                  Discover New People
                </CardTitle>
                <CardDescription>
                  Profiles our algorithm thinks you'll love
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((user) => (
                      <UserCard key={user.UID} user={user} showActions={true} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No recommendations"
                    description="We're finding the perfect people for you!"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Heart className="w-5 h-5" />
                  Your Matches
                </CardTitle>
                <CardDescription>
                  People who liked you back - it's a match!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((user) => (
                      <UserCard key={user.UID} user={user} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Heart}
                    title="No matches yet"
                    description="Keep swiping to find your perfect match!"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Recent activity and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notifications.map((user) => (
                      <UserCard key={user.UID} user={user} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="No notifications"
                    description="You're all caught up!"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awaiting" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-5 h-5" />
                  Awaiting Response
                </CardTitle>
                <CardDescription>
                  People waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {awaiting.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {awaiting.map((user) => (
                      <UserCard key={user.UID} user={user} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No pending responses"
                    description="You're all up to date with your responses!"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
