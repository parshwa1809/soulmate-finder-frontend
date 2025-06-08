
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
    <div className="flex justify-center space-x-4 mt-4">
      <Button
        onClick={() => handleAction('reject')}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleAction('like')}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        <Heart className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserActions;
