
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "../config/api";
import ImageUpload from "./ImageUpload";

interface EditProfileProps {
  onCancel: () => void;
  onSave: () => void;
}

const EditProfile = ({ onCancel, onSave }: EditProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setProfileData(parsedData);
        
        // Set existing images
        const images = parsedData.IMAGES || parsedData.images || [];
        setExistingImages(images);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const base64Images: string[] = [];
    
    for (const file of files) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:image/jpeg;base64, prefix to get just the base64 string
            const base64String = result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64Images.push(base64);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        toast({
          title: "Error",
          description: "Failed to process image files",
          variant: "destructive",
        });
      }
    }
    
    return base64Images;
  };

  const updateProfileAPI = async (imageData: string[]) => {
    try {
      const userUID = localStorage.getItem('userUID');
      if (!userUID) {
        throw new Error('User UID not found');
      }

      // Only send the new images to API
      const apiData = {
        UID: userUID,
        IMAGES: imageData.length > 0 ? imageData.map(img => ({ data: img })) : []
      };

      console.log('Sending new photos to API:', apiData);

      const response = await fetch(`${config.URL}/update:profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Photos update response:', result);
      
      return result;
    } catch (error) {
      console.error('Error updating photos via API:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (newImages.length === 0) {
      toast({
        title: "No Changes",
        description: "No new photos to upload.",
        variant: "default",
      });
      onCancel();
      return;
    }

    setIsLoading(true);
    try {
      // Convert only new images to base64
      const newImageData = await convertFilesToBase64(newImages);
      
      // Update profile via API with only new images
      await updateProfileAPI(newImageData);
      
      // Update localStorage - append new images to existing ones
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const allImages = [...existingImages, ...newImageData.map(img => ({ data: img }))];
      const updatedProfile = {
        ...currentUserData,
        IMAGES: allImages,
        images: allImages
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedProfile));
      
      toast({
        title: "Success",
        description: "Photos uploaded successfully!",
      });
      
      console.log('Photos updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImagesChange = (images: File[]) => {
    setNewImages(images);
    console.log('New images selected:', images.length);
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Upload Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={existingImages?.[0]?.data ? `data:image/jpeg;base64,${existingImages[0].data}` : profileData.images?.[0]} />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-2xl">
                  {profileData.NAME?.charAt(0) || profileData.name?.charAt(0) || <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Display existing images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <Label>Current Photos ({existingImages.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="aspect-square relative">
                      <img
                        src={`data:image/jpeg;base64,${image.data}`}
                        alt={`Current ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload Section */}
            <div className="space-y-2">
              <Label>Add New Photos</Label>
              <ImageUpload images={newImages} onImagesChange={handleNewImagesChange} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoading || newImages.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
