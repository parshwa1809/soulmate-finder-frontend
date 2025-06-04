
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
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

const Awaiting = () => {
  const [awaiting, setAwaiting] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

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
    loadAwaiting();
    setSelectedUser(null);
  };

  const UserCard = ({ user }: { user: User }) => (
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
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <Clock className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No pending responses</h3>
      <p className="mt-2 text-gray-600">You're all up to date with your responses!</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading awaiting responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
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
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Awaiting;
