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

interface DashboardMessage {
  id: string;
  text: string;
  timestamp: Date;
  userName?: string;
}

interface DashboardProps {
  userUID: string | null;
  setIsLoggedIn: (value: boolean) => void;
  onLogout?: () => void;
  cachedData?: any;
  isLoadingData?: boolean;
}

const Dashboard = ({ userUID, setIsLoggedIn, onLogout, cachedData, isLoadingData }: DashboardProps) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<User[]>([]);
  const [awaiting, setAwaiting] = useState<User[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    console.log('Dashboard useEffect - cachedData:', cachedData);
    
    if (cachedData) {
      // Use the data structure from Index.tsx which has already processed the recommendation cards
      if (cachedData.recommendations) {
        console.log('Setting recommendations from cache:', cachedData.recommendations);
        setRecommendations(cachedData.recommendations);
      }
      if (cachedData.matches) {
        console.log('Setting matches from cache:', cachedData.matches);
        setMatches(cachedData.matches);
      }
      if (cachedData.awaiting) {
        console.log('Setting awaiting from cache:', cachedData.awaiting);
        setAwaiting(cachedData.awaiting);
      }
      if (cachedData.notifications) {
        console.log('Setting notifications from cache:', cachedData.notifications);
        setNotifications(cachedData.notifications);
      }
    }
    
    setIsLoading(false);
  }, [cachedData]);

  const loadRecommendationCards = async (recommendationCards: any[]) => {
    console.log('Loading recommendation cards:', recommendationCards);
    
    // Group cards by queue type first
    const cardsByQueue = {
      RECOMMENDATIONS: [] as any[],
      MATCHED: [] as any[],
      AWAITING: [] as any[]
    };

    recommendationCards.forEach(card => {
      const queue = card.queue;
      if (cardsByQueue[queue as keyof typeof cardsByQueue]) {
        cardsByQueue[queue as keyof typeof cardsByQueue].push(card);
      }
    });

    // Load users for each queue progressively
    if (cardsByQueue.RECOMMENDATIONS.length > 0) {
      loadUsersForQueue(cardsByQueue.RECOMMENDATIONS, setRecommendations, 'RECOMMENDATIONS');
    }
    if (cardsByQueue.MATCHED.length > 0) {
      loadUsersForQueue(cardsByQueue.MATCHED, setMatches, 'MATCHED');
    }
    if (cardsByQueue.AWAITING.length > 0) {
      loadUsersForQueue(cardsByQueue.AWAITING, setAwaiting, 'AWAITING');
    }
  };

  const loadUsersForQueue = async (cards: any[], setter: (users: User[]) => void, queueName: string) => {
    console.log(`Loading users for queue ${queueName}:`, cards);
    
    const userPromises = cards.map(async (card) => {
      try {
        const response = await fetch(`${config.URL}${config.ENDPOINTS.GET_PROFILE}/${card.recommendation_uid}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log(`Successfully fetched user data for ${card.recommendation_uid}:`, userData);
          return transformUserData(userData, card.score);
        } else {
          console.error(`Failed to fetch user ${card.recommendation_uid}, status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching user ${card.recommendation_uid}:`, error);
      }
      return null;
    });

    const users = (await Promise.all(userPromises)).filter(Boolean);
    console.log(`Final processed users for ${queueName}:`, users.map(u => ({ UID: u?.UID, name: u?.name, kundliScore: u?.kundliScore })));
    setter(users);
  };

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

  const addMessage = (text: string, userName?: string) => {
    const newMessage: DashboardMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      userName
    };
    setMessages(prev => [newMessage, ...prev]);
    setIsNotificationsOpen(true);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback to old behavior
      localStorage.removeItem('userUID');
      localStorage.removeItem('userData');
      localStorage.removeItem('profileData');
      localStorage.removeItem('dashboardData');
      setIsLoggedIn(false);
    }
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

    // Add message to notifications if present
    if (message && message !== 'None') {
      addMessage(message, selectedUser.name);
    }

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

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => {
    // Helper function to safely get hobbies array
    const getHobbiesArray = (hobbies: string | undefined): string[] => {
      if (!hobbies) return [];
      if (typeof hobbies === 'string') {
        return hobbies.split(',').map(hobby => hobby.trim()).filter(hobby => hobby.length > 0);
      }
      return [];
    };

    const hobbiesArray = getHobbiesArray(user.hobbies);

    return (
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
              {hobbiesArray.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {hobbiesArray.slice(0, 3).map((hobby, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-white/10 text-white/80 border-white/20 hover:bg-white/20 transition-colors px-2 py-1"
                      >
                        {hobby}
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
  };

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

  if (isLoadingData && (!cachedData || Object.keys(cachedData).length === 0)) {
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
      {/* Modern Header - Mobile Optimized */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Popover open={isMatchesOpen} onOpenChange={setIsMatchesOpen}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-30"></div>
                  <img 
                    src="/lovable-uploads/b01e8af5-640c-4d6b-a324-774afb9bbf88.png" 
                    alt="Aligned Logo" 
                    className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                  />
                  {matches.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold">
                      {matches.length}
                    </Badge>
                  )}
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
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight amazon-font">Aligned</h1>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 backdrop-blur-xl text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                  {(notifications.length > 0 || messages.length > 0) && (
                    <Badge className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {notifications.length + messages.length}
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
                  {(messages.length > 0 || notifications.length > 0) ? (
                    <div className="space-y-3">
                      {/* Show messages first */}
                      {messages.map((message) => (
                        <div key={message.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white text-sm">{message.text}</p>
                          {message.userName && (
                            <p className="text-white/60 text-xs mt-1">From: {message.userName}</p>
                          )}
                          <p className="text-white/40 text-xs mt-1">
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      
                      {/* Then show user notifications */}
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
              size="sm"
              className="border-white/20 bg-white/5 backdrop-blur-xl text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-4"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="recommendations" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <TabsTrigger 
              value="recommendations" 
              className="flex items-center gap-1 sm:gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Recommendations</span>
              <Badge variant="secondary" className="bg-white/20 text-white/80 text-xs">
                {recommendations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="awaiting" 
              className="flex items-center gap-1 sm:gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Awaiting</span>
              <Badge variant="secondary" className="bg-white/20 text-white/80 text-xs">
                {awaiting.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="flex items-center gap-1 sm:gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Matches</span>
              <Badge variant="secondary" className="bg-white/20 text-white/80 text-xs">
                {matches.length}
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

          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-pink-500/10 to-red-500/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl blur opacity-30"></div>
                    <div className="relative w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-300" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Your Matches</CardTitle>
                    <CardDescription className="text-white/60 font-medium mt-1">
                      People who liked you back - it's a match!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((user) => (
                      <UserCard key={user.UID} user={user} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Heart}
                    title="No matches yet"
                    description="Keep swiping to find your perfect match! When someone likes you back, they'll appear here."
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

}
