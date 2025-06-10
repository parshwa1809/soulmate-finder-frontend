import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, Heart, Star, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { config } from "../config/api";
import Profile from './Profile';
import Recommendations from './Recommendations';

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
}

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<'recommendations' | 'profile'>('recommendations');
  const [recommendations, setRecommendations] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setRecommendations(userData.recommendations || []);
        setMatches(userData.matches || []);
        setNotifications(userData.notifications || []);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
  };

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
                onClick={() => setCurrentView('profile')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
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
        {currentView === 'recommendations' && (
          <Recommendations 
            recommendations={recommendations} 
            onUserClick={handleUserClick} 
          />
        )}
        {currentView === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export default Dashboard;
