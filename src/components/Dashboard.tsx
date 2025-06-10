
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Bell, Clock, Users, User, LogOut, Star } from "lucide-react";
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
  images?: string[];
  kundliScore?: number;
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
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const transformUserData = (apiData: any, kundliScore?: number): User => {
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

    // Parse images from API response
    let images: string[] = [];
    let profilePicture = '';
    
    if (apiData.IMAGES) {
      try {
        // Check if IMAGES is already an object/array or a JSON string
        let parsedImages;
        if (typeof apiData.IMAGES === 'string') {
          parsedImages = JSON.parse(apiData.IMAGES);
        } else {
          parsedImages = apiData.IMAGES;
        }
        
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          // Process all images, not just the first one
          images = parsedImages
            .filter(img => img && img.data) // Only include images with data
            .map(img => `data:image/jpeg;base64,${img.data}`);
          
          // Set the first image as profile picture
          if (images.length > 0) {
            profilePicture = images[0];
            console.log(`Successfully processed ${images.length} images for user:`, apiData.UID);
          }
        }
      } catch (error) {
        console.error('Failed to parse images for user:', apiData.UID, error);
        console.log('Raw IMAGES data:', apiData.IMAGES);
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

    const userData = {
      UID: apiData.UID,
      name: apiData.NAME || 'Unknown User',
      email: apiData.EMAIL,
      city: apiData.CITY,
      country: apiData.COUNTRY,
      age: age,
      gender: apiData.GENDER,
      hobbies: hobbies,
      profilePicture: profilePicture,
      bio: apiData.BIO || apiData.bio,
      images: images,
      kundliScore: kundliScore
    };

    // Log the transformed user data with kundliScore
    console.log(`Transformed user ${apiData.UID} with kundliScore:`, kundliScore, userData);
    
    return userData;
  };

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('=== LOADING USER DATA FROM LOCALSTORAGE ===');
        console.log('Full parsed data:', parsedData);
        
        // Process the data arrays from the API response
        if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
          console.log('Raw recommendations array:', parsedData.recommendations);
          await loadUsersForCategory(parsedData.recommendations, setRecommendations, 'recommendations');
        }
        
        if (parsedData.matches && Array.isArray(parsedData.matches)) {
          console.log('Raw matches array:', parsedData.matches);
          await loadUsersForCategory(parsedData.matches, setMatches, 'matches');
        }
        
        if (parsedData.notifications && Array.isArray(parsedData.notifications)) {
          console.log('Raw notifications array:', parsedData.notifications);
          await loadUsersForCategory(parsedData.notifications, setNotifications, 'notifications');
        }
        
        if (parsedData.awaiting && Array.isArray(parsedData.awaiting)) {
          console.log('Raw awaiting array:', parsedData.awaiting);
          await loadUsersForCategory(parsedData.awaiting, setAwaiting, 'awaiting');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersForCategory = async (userList: any[], setter: (users: User[]) => void, categoryName: string) => {
    try {
      console.log(`=== LOADING USERS FOR CATEGORY: ${categoryName.toUpperCase()} ===`);
      console.log(`User list for ${categoryName}:`, userList);
      
      const userPromises = userList.map(async (item, index) => {
        // Handle both array format [UID, score, date, ...] and object format
        const uid = Array.isArray(item) ? item[0] : (item.UID || item);
        const kundliScore = Array.isArray(item) && item.length > 1 ? item[1] : undefined;
        
        console.log(`${categoryName}[${index}]:`, {
          rawItem: item,
          extractedUID: uid,
          extractedKundliScore: kundliScore,
          isArray: Array.isArray(item),
          itemLength: Array.isArray(item) ? item.length : 'not array'
        });
        
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
          return transformUserData(userData, kundliScore);
        } else {
          console.error(`Failed to fetch user ${uid}, status: ${response.status}`);
        }
        return null;
      });

      const users = (await Promise.all(userPromises)).filter(Boolean);
      console.log(`Final processed users for ${categoryName}:`, users.map(u => ({ UID: u.UID, name: u.name, kundliScore: u.kundliScore })));
      setter(users);
    } catch (error) {
      console.error(`Error fetching users for ${categoryName}:`, error);
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

  const handleActionComplete = (action: 'skip' | 'align', queue?: string, message?: string) => {
    if (!selectedUser) return;

    // Remove user from current list first
    const userUID = selectedUser.UID;
    setRecommendations(prev => prev.filter(user => user.UID !== userUID));
    setMatches(prev => prev.filter(user => user.UID !== userUID));
    setNotifications(prev => prev.filter(user => user.UID !== userUID));
    setAwaiting(prev => prev.filter(user => user.UID !== userUID));

    // Handle queue management based on API response
    if (queue && queue !== 'None') {
      switch (queue) {
        case 'MATCHED':
        case 'Matched':
          // Move to matches (Aligned queue - the heart button on top left)
          setMatches(prev => [...prev, selectedUser]);
          console.log(`Moving user ${selectedUser.name} to matches queue`);
          break;
        case 'AWAITING':
        case 'Awaiting':
          // Move to awaiting (Pending tab)
          setAwaiting(prev => [...prev, selectedUser]);
          console.log(`Moving user ${selectedUser.name} to awaiting queue`);
          break;
        default:
          console.log(`Unknown queue type: ${queue}, removing user from all queues`);
          break;
      }
    } else {
      console.log(`Queue is None or undefined, removing user ${selectedUser.name} from all queues`);
    }

    // Close the profile view
    setSelectedUser(null);
  };

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] shadow-xl hover:shadow-2xl cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-6 relative z-10" onClick={() => handleUserClick(user)}>
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
              <AvatarImage 
                src={user.profilePicture} 
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold text-xl">
                {user.name?.charAt(0) || <User className="w-10 h-10" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white/90 truncate group-hover:text-white transition-colors mb-1">
              {user.name || 'Unknown User'}
            </h3>
            {user.city && user.country && (
              <p className="text-sm text-white/60 truncate mb-1">
                📍 {user.city}, {user.country}
              </p>
            )}
            {user.age && (
              <p className="text-sm text-white/60 mb-1">
                🎂 {user.age} years old
              </p>
            )}
            {user.kundliScore !== undefined && (
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-white/70 font-medium">
                  Compatibility: {user.kundliScore}/36
                </span>
              </div>
            )}
            {user.hobbies && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {user.hobbies.split(',').slice(0, 3).map((hobby, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-white/10 text-white/80 border-white/20 hover:bg-white/20 transition-colors px-2 py-1"
                    >
                      {hobby.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {showActions && (
          <div onClick={(e) => e.stopPropagation()} className="mt-4">
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
    <div className="text-center py-20">
      <div className="relative mx-auto mb-6 w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="relative w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
          <Icon className="w-8 h-8 text-white/60" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white/90 mb-3">{title}</h3>
      <p className="text-white/60 max-w-md mx-auto leading-relaxed">{description}</p>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
            <div className="relative w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
            </div>
          </div>
          <p className="text-white/70 font-medium">Discovering your perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Modern Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Popover open={isMatchesOpen} onOpenChange={setIsMatchesOpen}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg blur opacity-30"></div>
                  <div className="relative w-10 h-10 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/b01e8af5-640c-4d6b-a324-774afb9bbf88.png" 
                      alt="Aligned Logo" 
                      className="w-6 h-6"
                    />
                    {matches.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {matches.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white/5 backdrop-blur-xl border border-white/10" align="start">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white text-lg">Your Matches</h3>
                  <p className="text-white/60 text-sm">People who liked you back</p>
                </div>
                <div className="max-h-96 overflow-y-auto p-4">
                  {matches.length > 0 ? (
                    <div className="space-y-3">
                      {matches.map((user) => (
                        <div 
                          key={user.UID} 
                          className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => {
                            handleUserClick(user);
                            setIsMatchesOpen(false);
                          }}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                              {user.name?.charAt(0) || <User className="w-6 h-6" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{user.name}</p>
                            {user.kundliScore !== undefined && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-xs text-white/70">
                                  {user.kundliScore}/36
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">No matches yet</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight amazon-font">Aligned</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-white/20 bg-white/5 backdrop-blur-xl text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white/5 backdrop-blur-xl border border-white/10" align="end">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white text-lg">Notifications</h3>
                  <p className="text-white/60 text-sm">Recent activity updates</p>
                </div>
                <div className="max-h-96 overflow-y-auto p-4">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((user) => (
                        <div 
                          key={user.UID} 
                          className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => {
                            handleUserClick(user);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                              {user.name?.charAt(0) || <User className="w-6 h-6" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{user.name}</p>
                            {user.kundliScore !== undefined && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-xs text-white/70">
                                  {user.kundliScore}/36
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              onClick={handleViewProfile}
              variant="outline"
              className="border-white/20 bg-white/5 backdrop-blur-xl text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="recommendations" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <TabsTrigger 
              value="recommendations" 
              className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300 py-3"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
              <Badge variant="secondary" className="bg-white/20 text-white/80 text-xs">
                {recommendations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="awaiting" 
              className="flex items-center gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300 py-3"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span>
              <Badge variant="secondary" className="bg-white/20 text-white/80 text-xs">
                {awaiting.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-30"></div>
                    <div className="relative w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-violet-300" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Discover New People</CardTitle>
                    <CardDescription className="text-white/60 font-medium mt-1">
                      Curated profiles that match your cosmic compatibility
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((user) => (
                      <UserCard key={user.UID} user={user} showActions={true} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No new discoveries"
                    description="We're finding amazing people for you to connect with!"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awaiting" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-30"></div>
                    <div className="relative w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-300" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Awaiting Response</CardTitle>
                    <CardDescription className="text-white/60 font-medium mt-1">
                      People waiting for your decision
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {awaiting.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {awaiting.map((user) => (
                      <UserCard key={user.UID} user={user} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No pending responses"
                    description="You're all caught up with your responses!"
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
