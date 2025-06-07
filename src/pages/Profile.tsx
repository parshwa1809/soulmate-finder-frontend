
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-destructive/20 text-destructive hover:bg-destructive/10"
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
