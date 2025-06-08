
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { config } from "../config/api";

interface UserActionsProps {
  userUID: string;
  currentUserUID: string | null;
  onActionComplete?: () => void;
}

const UserActions = ({ userUID, currentUserUID, onActionComplete }: UserActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (actionType: string) => {
    if (!currentUserUID) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({ 
        uid1: currentUserUID, 
        uid2: userUID, 
        action: actionType 
      }));

      const response = await fetch(`${config.URL}/match:action`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onActionComplete?.();
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center space-x-8 mt-8">
      <Button
        onClick={() => handleAction('reject')}
        variant="outline"
        size="lg"
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-300/30 text-red-100 hover:border-red-400/50 hover:from-red-500/20 hover:to-pink-500/20 backdrop-blur-sm px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
        <X className="w-6 h-6 mr-3 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        <span className="relative z-10 font-semibold text-lg">Skip</span>
      </Button>
      
      <Button
        onClick={() => handleAction('like')}
        variant="outline"
        size="lg"
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-300/30 text-green-100 hover:border-green-400/50 hover:from-green-500/20 hover:to-emerald-500/20 backdrop-blur-sm px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
        <Heart className="w-6 h-6 mr-3 relative z-10 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
        <span className="relative z-10 font-semibold text-lg">Like</span>
      </Button>
    </div>
  );
};

export default UserActions;
