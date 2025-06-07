
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, X } from "lucide-react";
import { config } from "../config/api";
import ImageUpload from "./ImageUpload";

interface ProfileFormData {
  name: string;
  email: string;
  city?: string;
  country?: string;
  profession?: string;
  bio?: string;
  gender?: string;
}

interface EditProfileProps {
  onCancel: () => void;
  onSave: () => void;
}

const EditProfile = ({ onCancel, onSave }: EditProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setProfileData(parsedData);
        
        // Set form values
        setValue('name', parsedData.NAME || parsedData.name || '');
        setValue('email', parsedData.EMAIL || parsedData.email || '');
        setValue('city', parsedData.CITY || parsedData.city || '');
        setValue('country', parsedData.COUNTRY || parsedData.country || '');
        setValue('profession', parsedData.PROFESSION || parsedData.profession || '');
        setValue('bio', parsedData.bio || '');
        setValue('gender', parsedData.GENDER || parsedData.gender || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const userUID = localStorage.getItem('userUID');
      
      // Here you would typically make an API call to update the profile
      // For now, we'll just update localStorage
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedProfile = {
        ...currentUserData,
        NAME: data.name,
        name: data.name,
        EMAIL: data.email,
        email: data.email,
        CITY: data.city,
        city: data.city,
        COUNTRY: data.country,
        country: data.country,
        PROFESSION: data.profession,
        profession: data.profession,
        bio: data.bio,
        GENDER: data.gender,
        gender: data.gender
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedProfile));
      
      console.log('Profile updated:', data);
      console.log('Images to upload:', images);
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
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
            <User className="w-5 h-5 mr-2 text-orange-500" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.IMAGES?.[0] || profileData.images?.[0]} />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-2xl">
                  {profileData.NAME?.charAt(0) || profileData.name?.charAt(0) || <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Image Upload Section */}
            <ImageUpload images={images} onImagesChange={handleImagesChange} />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  {...register('profession')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  {...register('gender')}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                className="mt-1"
                rows={4}
                placeholder="Tell us about yourself..."
              />
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
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
