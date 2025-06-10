import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { config } from "../config/api";
import { useToast } from "@/hooks/use-toast";

interface UserActionsProps {
  userUID: string;
  currentUserUID: string | null;
  onActionComplete?: (queue?: string, message?: string) => void;
}

const UserActions = ({ userUID, currentUserUID, onActionComplete }: UserActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async (actionType: 'skip' | 'align') => {
    if (!currentUserUID) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('recommendation_uid', userUID);
      formData.append('uid', currentUserUID);
      formData.append('action', actionType);

      const response = await fetch(`${config.URL}/account:action`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Action response:', data);
        
        if (data.error === 'OK') {
          // Handle queue management
          const queue = data.queue;
          const message = data.message;
          
          // Show toast for message if present
          if (message && message !== 'None') {
            toast({
              title: "Update",
              description: message,
            });
          }
          
          // Call parent callback with queue and message info
          onActionComplete?.(queue, message);
        } else {
          console.error('API error:', data.error);
          toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center gap-6 mt-12 mb-8">
      {/* Align Button (moved to left) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <Button
          onClick={() => handleAction('align')}
          variant="outline"
          size="lg"
          disabled={isLoading}
          className="relative w-16 h-16 rounded-full bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-emerald-400/50 text-white/80 hover:text-emerald-300 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-emerald-500/25 group-hover:bg-gradient-to-r group-hover:from-emerald-500/10 group-hover:to-green-500/10"
        >
          <Heart className="w-6 h-6 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
        </Button>
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/60 font-medium">
          Align
        </span>
      </div>

      {/* Skip Button (moved to right) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <Button
          onClick={() => handleAction('skip')}
          variant="outline"
          size="lg"
          disabled={isLoading}
          className="relative w-16 h-16 rounded-full bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-red-400/50 text-white/80 hover:text-red-300 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-red-500/25 group-hover:bg-gradient-to-r group-hover:from-red-500/10 group-hover:to-pink-500/10"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white/60 font-medium">
          Skip
        </span>
      </div>
    </div>
  );
};

export default UserActions;
