import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ArrowLeft, Heart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/api";
import ProfileView from "../components/ProfileView";
import UserActions from "../components/UserActions";
import { useToast } from "@/components/ui/use-toast";

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
  recommendationUID?: string;
}

const Awaiting = () => {
  const navigate = useNavigate();
  const [awaiting, setAwaiting] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const uid = localStorage.getItem('userUID');
    setUserUID(uid);
    loadAwaiting();
  }, []);

  const loadAwaiting = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        await loadUsersForCategory(parsedData.awaiting || [], setAwaiting);
      }
    } catch (error) {
      console.error('Error loading awaiting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersForCategory = async (userList: any[], setter: (users: User[]) => void) => {
    try {
      const userPromises = userList.map(async (item) => {
        console.log('Processing awaiting item:', item);
        
        // Extract values from the array structure ["recommendation_uid","score","date",...]
        const recommendationUID = Array.isArray(item) ? item[0] : (item.UID || item);
        const uid = recommendationUID;
        
        console.log('Processing user:', {
          recommendationUID,
          fullItem: item
        });
        
        const response = await fetch(`${config.URL}/get:${uid}`, {
          method: 'POST',
        });
        if (response.ok) {
          const userData = await response.json();
          const processedUser = {
            ...userData,
            recommendationUID: recommendationUID
          };
          console.log('Final processed user:', processedUser);
          return processedUser;
        }
        return null;
      });

      const users = (await Promise.all(userPromises)).filter(Boolean);
      console.log('All final processed users for awaiting:', users);
      setter(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setter([]);
    }
  };

  const handleAction = async (actionType: 'skip' | 'align', user: User) => {
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

      console.log('Sending action request:', metadata);

      const response = await fetch(`${config.URL}/account:action`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Action response:', data);
        
        if (data.error === 'OK') {
          toast({
            title: "Success",
            description: data.message || `${actionType === 'align' ? 'Aligned' : 'Skipped'} successfully!`,
          });
          
          // Remove user from awaiting list immediately
          setAwaiting(prev => prev.filter(u => u.UID !== user.UID));

          // Handle queue management based on API response
          if (data.queue && data.queue !== 'None') {
            const userData = localStorage.getItem('userData');
            if (userData) {
              try {
                const parsedData = JSON.parse(userData);
                
                // Add user to the specified queue in localStorage
                if (data.queue === 'MATCHED' || data.queue === 'Matched') {
                  const currentMatches = parsedData.matches || [];
                  parsedData.matches = [...currentMatches, user.recommendationUID];
                  console.log('Added user to matches queue:', user.UID);
                } else if (data.queue === 'AWAITING' || data.queue === 'Awaiting') {
                  // User stays in awaiting queue (shouldn't happen but handle it)
                  const currentAwaiting = parsedData.awaiting || [];
                  parsedData.awaiting = [...currentAwaiting, user.recommendationUID];
                  console.log('User remains in awaiting queue:', user.UID);
                }
                
                // Update localStorage with the new queue data
                localStorage.setItem('userData', JSON.stringify(parsedData));
                console.log('Updated localStorage with new queue data for queue:', data.queue);
              } catch (error) {
                console.error('Error updating queue data:', error);
              }
            }
          }
        } else {
          console.error('API error:', data.error);
          toast({
            title: "Error",
            description: data.error || "An error occurred while processing your action.",
            variant: "destructive",
          });
        }
      } else {
        const errorText = await response.text();
        console.error('HTTP error:', response.status, errorText);
        toast({
          title: "Network Error",
          description: `Server responded with status ${response.status}. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleActionComplete = (action: 'skip' | 'align', queue?: string, message?: string) => {
    if (!selectedUser) return;

    console.log('Action completed:', { action, queue, message, userUID: selectedUser.UID });

    // Remove user from awaiting list immediately
    const userUID = selectedUser.UID;
    setAwaiting(prev => prev.filter(user => user.UID !== userUID));

    // Handle queue management based on API response
    if (queue && queue !== 'None') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          
          // Add user to the specified queue in localStorage
          if (queue === 'MATCHED' || queue === 'Matched') {
            const currentMatches = parsedData.matches || [];
            parsedData.matches = [...currentMatches, selectedUser.recommendationUID];
            console.log('Added user to matches queue:', selectedUser.UID);
          } else if (queue === 'AWAITING' || queue === 'Awaiting') {
            // User stays in awaiting queue (shouldn't happen but handle it)
            const currentAwaiting = parsedData.awaiting || [];
            parsedData.awaiting = [...currentAwaiting, selectedUser.recommendationUID];
            console.log('User remains in awaiting queue:', selectedUser.UID);
          }
          
          // Update localStorage with the new queue data
          localStorage.setItem('userData', JSON.stringify(parsedData));
          console.log('Updated localStorage with new queue data for queue:', queue);
        } catch (error) {
          console.error('Error updating queue data:', error);
        }
      }
    }

    // Close the profile view
    setSelectedUser(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const UserCard = ({ user }: { user: User }) => {
    return (
      <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] relative">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4 cursor-pointer" onClick={() => handleUserClick(user)}>
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                  {user.name?.charAt(0) || <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-white truncate group-hover:text-violet-200 transition-colors">
                {user.name || 'Unknown User'}
              </h3>
              {user.city && user.country && (
                <p className="text-sm text-white/60 truncate font-medium">
                  📍 {user.city}, {user.country}
                </p>
              )}
              {user.age && (
                <p className="text-sm text-white/60 font-medium">
                  🎂 {user.age} years old
                </p>
              )}
              {user.hobbies && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {user.hobbies.split(',').slice(0, 3).map((hobby, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20 hover:bg-white/20">
                        {hobby.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons - exactly like in Recommendations */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-center items-center gap-4">
              <div className="relative group">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('align', user);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === user.UID}
                  className="relative w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-emerald-400/50 text-white/80 hover:text-emerald-300 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-emerald-500/25 group-hover:bg-gradient-to-r group-hover:from-emerald-500/10 group-hover:to-green-500/10"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
                </Button>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('skip', user);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === user.UID}
                  className="relative w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-red-400/50 text-white/80 hover:text-red-300 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-red-500/25 group-hover:bg-gradient-to-r group-hover:from-red-500/10 group-hover:to-pink-500/10"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="relative mx-auto mb-6 w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="relative w-20 h-20 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-white/60" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white/90 mb-3">No pending responses</h3>
      <p className="text-white/60 max-w-md mx-auto leading-relaxed">You're all up to date with your responses! New requests will appear here.</p>
    </div>
  );

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <ProfileView user={selectedUser} onBack={handleBackToList}>
            <UserActions 
              userUID={selectedUser.UID} 
              currentUserUID={userUID}
              recommendationUID={selectedUser.recommendationUID}
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
          <p className="text-white/70 font-medium">Loading awaiting responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Button 
            onClick={handleBackToDashboard}
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-white">Awaiting Response</h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-30"></div>
              <div className="relative w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Awaiting Response</h2>
              <p className="text-white/60 font-medium">People waiting for your response</p>
            </div>
          </div>
        </div>

        {awaiting.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {awaiting.map((user) => (
              <UserCard key={user.UID} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="relative w-20 h-20 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white/60" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white/90 mb-3">No pending responses</h3>
            <p className="text-white/60 max-w-md mx-auto leading-relaxed">You're all up to date with your responses! New requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Awaiting;
