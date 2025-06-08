
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10"
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
            className="border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
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
