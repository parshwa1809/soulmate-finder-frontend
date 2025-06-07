
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
    // Optionally show a success message here
  };

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userData');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="py-8">
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
