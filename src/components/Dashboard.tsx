
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, Heart, Star, Bell, Users, Clock, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { config } from "../config/api";
import Profile from './Profile';
import ProfileView from './ProfileView';
import UserActions from './UserActions';

interface DashboardProps {
  setIsLoggedIn: (value: boolean) => void;
  userUID: string;
}

interface UserProfile {
  UID: string;
  name?: string;
  NAME?: string;
  profilePicture?: string;
  profile_picture?: string;
  kundliScore?: number;
  KUNDLI_SCORE?: number;
  city?: string;
  country?: string;
  age?: number;
  hobbies?: string;
  bio?: string;
  recommendationUID?: string;
}

const Dashboard = ({ setIsLoggedIn, userUID }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
  const [recommendations, setRecommendations] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [awaiting, setAwaiting] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAllUserData();
  }, []);

  const loadAllUserData = async () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        await Promise.all([
          loadUsersForCategory(userData.recommendations || [], setRecommendations),
          loadUsersForCategory(userData.matches || [], setMatches),
          loadUsersForCategory(userData.awaiting || [], setAwaiting)
        ]);
        setNotifications(userData.notifications || []);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    setIsLoading(false);
  };

  const loadUsersForCategory = async (userList: any[], setter: (users: UserProfile[]) => void) => {
    try {
      const userPromises = userList.map(async (item) => {
        const recommendationUID = Array.isArray(item) ? item[0] : (item.UID || item);
        const uid = recommendationUID;
        
        const response = await fetch(`${config.URL}/get:${uid}`, {
          method: 'POST',
        });
        if (response.ok) {
          const userData = await response.json();
          return {
            ...userData,
            recommendationUID: recommendationUID
          };
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

  const handleAction = async (actionType: 'skip' | 'align', user: UserProfile) => {
    if (!userUID) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    setActionLoading(user.UID);
    try {
      const formData = new FormData();
      const metadata = {
        uid: userUID,
        action: actionType,
        recommendation_uid: user.recommendationUID || user.UID
      };
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${config.URL}/account:action`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.error === 'OK') {
          toast({
            title: "Success",
            description: data.message || `${actionType === 'align' ? 'Aligned' : 'Skipped'} successfully!`,
          });
          
          // Update local state based on action
          if (actionType === 'align') {
            setRecommendations(prev => prev.filter(u => u.UID !== user.UID));
            if (data.queue === 'MATCHED') {
              setMatches(prev => [...prev, user]);
            } else if (data.queue === 'AWAITING') {
              setAwaiting(prev => [...prev, user]);
            }
          } else {
            setRecommendations(prev => prev.filter(u => u.UID !== user.UID));
            setAwaiting(prev => prev.filter(u => u.UID !== user.UID));
          }
        } else {
          toast({
            title: "Error",
            description: data.error || "An error occurred while processing your action.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const UserCard = ({ user, showActions = false, category }: { user: UserProfile, showActions?: boolean, category?: string }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-white/40">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4" onClick={() => handleUserClick(user)}>
          <Avatar className="w-16 h-16 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
            <AvatarImage src={user.profilePicture || user.profile_picture} />
            <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              {user.name?.charAt(0) || user.NAME?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white truncate group-hover:text-violet-200 transition-colors">
              {user.name || user.NAME || 'Unknown User'}
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
            {user.kundliScore !== undefined && (
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs text-white/70">
                  {user.kundliScore}/36
                </span>
              </div>
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
        
        {showActions && category === 'discover' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('align', user);
                }}
                variant="outline"
                size="sm"
                disabled={actionLoading === user.UID}
                className="w-12 h-12 rounded-full bg-white/5 border-white/10 hover:border-emerald-400/50 text-white/80 hover:text-emerald-300"
              >
                <Heart className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('skip', user);
                }}
                variant="outline"
                size="sm"
                disabled={actionLoading === user.UID}
                className="w-12 h-12 rounded-full bg-white/5 border-white/10 hover:border-red-400/50 text-white/80 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {showActions && category === 'awaiting' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('align', user);
                }}
                variant="outline"
                size="sm"
                disabled={actionLoading === user.UID}
                className="w-12 h-12 rounded-full bg-white/5 border-white/10 hover:border-emerald-400/50 text-white/80 hover:text-emerald-300"
              >
                <Heart className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('skip', user);
                }}
                variant="outline"
                size="sm"
                disabled={actionLoading === user.UID}
                className="w-12 h-12 rounded-full bg-white/5 border-white/10 hover:border-red-400/50 text-white/80 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-white/70" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 max-w-md mx-auto">{description}</p>
    </div>
  );

  const DashboardContent = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Aligned</h1>
        <p className="text-white/70 text-lg">Discover meaningful connections</p>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/10">
          <TabsTrigger 
            value="discover" 
            className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Discover ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger 
            value="awaiting"
            className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Clock className="w-4 h-4 mr-2" />
            Awaiting ({awaiting.length})
          </TabsTrigger>
          <TabsTrigger 
            value="matches"
            className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Heart className="w-4 h-4 mr-2" />
            Matches ({matches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white/70">Loading recommendations...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((user) => (
                <UserCard key={user.UID} user={user} showActions={true} category="discover" />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Users} 
              title="No recommendations" 
              description="We're finding the perfect people for you! Check back soon for new recommendations."
            />
          )}
        </TabsContent>

        <TabsContent value="awaiting" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white/70">Loading awaiting...</p>
            </div>
          ) : awaiting.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awaiting.map((user) => (
                <UserCard key={user.UID} user={user} showActions={true} category="awaiting" />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Clock} 
              title="No pending responses" 
              description="You're all up to date with your responses! New requests will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white/70">Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.2),transparent),radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.2),transparent)] mix-blend-multiply pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <ProfileView user={selectedUser} onBack={() => setSelectedUser(null)}>
            <UserActions 
              userUID={selectedUser.UID} 
              currentUserUID={userUID}
              recommendationUID={selectedUser.recommendationUID}
              onActionComplete={() => {
                setSelectedUser(null);
                loadAllUserData();
              }}
            />
          </ProfileView>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.2),transparent),radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.2),transparent)] mix-blend-multiply pointer-events-none"></div>
      
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Popover open={isMatchesOpen} onOpenChange={setIsMatchesOpen}>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-30"></div>
                    <img 
                      src="/lovable-uploads/b01e8af5-640c-4d6b-a324-774afb9bbf88.png" 
                      alt="Aligned Logo" 
                      className="relative w-12 h-12 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                    />
                    {matches.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold">
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
                              <AvatarImage src={user.profilePicture || user.profile_picture} />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                                {user.name?.charAt(0) || user.NAME?.charAt(0) || <User className="w-6 h-6" />}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{user.name || user.NAME}</p>
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
              
              <span className="font-bold text-white text-2xl tracking-wide">
                Aligned
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-white/80 hover:text-white hover:bg-white/10">
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                        {notifications.length}
                      </Badge>
                    )}
                    <Bell className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-white/5 backdrop-blur-xl border border-white/10" align="end">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white text-lg">Notifications</h3>
                    <p className="text-white/60 text-sm">Stay up to date</p>
                  </div>
                  <ScrollArea className="max-h-96 overflow-y-auto p-4">
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.map((notification, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                            <div className="flex-1 min-w-0">
                              <p className="text-white">{notification.message}</p>
                              <p className="text-white/60 text-xs">{notification.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="w-6 h-6 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">No new notifications</p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView(currentView === 'profile' ? 'dashboard' : 'profile')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <User className="w-4 h-4 mr-2" />
                {currentView === 'profile' ? 'Dashboard' : 'Profile'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-0 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <DashboardContent />}
        {currentView === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export default Dashboard;
