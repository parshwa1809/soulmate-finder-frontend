import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Bell, Clock, Users, User, LogOut } from "lucide-react";
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
  const navigate = useNavigate();
  const [matches, setMatches] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<User[]>([]);
  const [awaiting, setAwaiting] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const transformUserData = (apiData: any): User => {
    // Parse hobbies if it's a JSON string
    let hobbies = '';
    if (apiData.HOBBIES) {
      try {
        const hobbiesArray = JSON.parse(apiData.HOBBIES);
        hobbies = Array.isArray(hobbiesArray) ? hobbiesArray.join(', ') : apiData.HOBBIES;
      } catch {
        hobbies = apiData.HOBBIES;
      }
    }

    // Calculate age from DOB if available
    let age = undefined;
    if (apiData.DOB) {
      try {
        const dobData = JSON.parse(apiData.DOB);
        const birthDate = new Date(dobData.year, dobData.month - 1, dobData.day);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      } catch {
        // If DOB parsing fails, leave age undefined
      }
    }

    return {
      UID: apiData.UID,
      name: apiData.NAME || 'Unknown User',
      email: apiData.EMAIL,
      city: apiData.CITY,
      country: apiData.COUNTRY,
      age: age,
      gender: apiData.GENDER,
      hobbies: hobbies,
      profilePicture: apiData.profilePicture || '',
      bio: apiData.BIO || apiData.bio
    };
  };

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('Loading user data from localStorage:', parsedData);
        
        // Process the data arrays from the API response
        if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
          console.log('Processing recommendations:', parsedData.recommendations);
          await loadUsersForCategory(parsedData.recommendations, setRecommendations);
        }
        
        if (parsedData.matches && Array.isArray(parsedData.matches)) {
          console.log('Processing matches:', parsedData.matches);
          await loadUsersForCategory(parsedData.matches, setMatches);
        }
        
        if (parsedData.notifications && Array.isArray(parsedData.notifications)) {
          console.log('Processing notifications:', parsedData.notifications);
          await loadUsersForCategory(parsedData.notifications, setNotifications);
        }
        
        if (parsedData.awaiting && Array.isArray(parsedData.awaiting)) {
          console.log('Processing awaiting:', parsedData.awaiting);
          await loadUsersForCategory(parsedData.awaiting, setAwaiting);
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
      console.log('Loading users for category:', userList);
      
      const userPromises = userList.map(async (item) => {
        // Handle both array format [UID, score, date, ...] and object format
        const uid = Array.isArray(item) ? item[0] : (item.UID || item);
        console.log(`Fetching user data for UID: ${uid}`);
        
        const response = await fetch(`${config.URL}${config.ENDPOINTS.GET_PROFILE}/${uid}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log(`Successfully fetched user data for ${uid}:`, userData);
          return transformUserData(userData);
        } else {
          console.error(`Failed to fetch user ${uid}, status: ${response.status}`);
        }
        return null;
      });

      const users = (await Promise.all(userPromises)).filter(Boolean);
      console.log(`Setting ${users.length} users for category`);
      setter(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setter([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleActionComplete = () => {
    loadUserData();
    setSelectedUser(null);
  };

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
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
                    <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white">
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
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-white/70" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 max-w-md mx-auto">{description}</p>
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
      <div className="border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Lovable Dating</h1>
            <p className="text-white/70 mt-1">Discover your perfect matches</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleViewProfile}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-300/30 text-red-100 hover:bg-red-500/20 bg-red-500/10 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="recommendations" className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Discover ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Heart className="w-4 h-4" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Bell className="w-4 h-4" />
              Notifications ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="awaiting" className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Clock className="w-4 h-4" />
              Awaiting ({awaiting.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Discover New People</CardTitle>
                    <CardDescription className="text-white/70">
                      Profiles our algorithm thinks you'll love
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Your Matches</CardTitle>
                    <CardDescription className="text-white/70">
                      People who liked you back - it's a match!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Notifications</CardTitle>
                    <CardDescription className="text-white/70">
                      Recent activity and updates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <TabsContent value="awaiting" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Awaiting Response</CardTitle>
                    <CardDescription className="text-white/70">
                      People waiting for your response
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {awaiting.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
