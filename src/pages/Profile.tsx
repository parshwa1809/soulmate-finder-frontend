
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../components/Profile";
import EditProfile from "../components/EditProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-300/30 text-red-100 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isEditing ? (
          <EditProfile onCancel={handleCancelEdit} onSave={handleSaveEdit} />
        ) : (
          <Profile onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
