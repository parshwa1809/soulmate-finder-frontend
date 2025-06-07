import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Briefcase, 
  Heart,
  Camera,
  Edit
} from "lucide-react";

interface ProfileData {
  uid: string;
  email: string;
  name: string;
  gender?: string;
  city?: string;
  country?: string;
  birth_city?: string;
  birth_country?: string;
  profession?: string;
  dob?: string;
  tob?: string;
  hobbies?: string[];
  images?: string[];
  login?: string;
}

interface ProfileProps {
  onEdit?: () => void;
}

const Profile = ({ onEdit }: ProfileProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const convertBase64ToDataUrl = (base64Data: any): string => {
    console.log('Converting base64 data:', typeof base64Data, base64Data);
    
    // Handle null/undefined
    if (base64Data === null || base64Data === undefined) {
      return '';
    }

    // If it's an object, try to extract the base64 string
    if (typeof base64Data === 'object') {
      // Try common object properties that might contain base64 data
      const possibleBase64 = base64Data.data || base64Data.base64 || base64Data.content || base64Data.image;
      if (possibleBase64 && typeof possibleBase64 === 'string') {
        base64Data = possibleBase64;
      } else {
        // If object doesn't have expected properties, try to stringify and see if it's valid
        try {
          const stringified = JSON.stringify(base64Data);
          if (stringified && stringified !== '{}' && stringified !== 'null') {
            console.log('Object converted to string:', stringified);
            // If the stringified object looks like it might contain base64, extract it
            const base64Match = stringified.match(/"([A-Za-z0-9+/=]{20,})"/);
            if (base64Match) {
              base64Data = base64Match[1];
            } else {
              return '';
            }
          } else {
            return '';
          }
        } catch {
          return '';
        }
      }
    }

    // Ensure we have a string
    if (typeof base64Data !== 'string') {
      base64Data = String(base64Data);
    }

    // Check if it's already a data URL
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
    
    // Check if it's a regular URL
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data;
    }
    
    // Remove any whitespace and check if it looks like base64
    base64Data = base64Data.trim();
    if (base64Data.length === 0) {
      return '';
    }
    
    // Assume it's a base64 string and convert to data URL
    // Default to JPEG if no format is specified
    return `data:image/jpeg;base64,${base64Data}`;
  };

  const transformUserData = (apiData: any): ProfileData => {
    console.log('Raw API data for transformation:', apiData);
    
    // Parse hobbies if it's a JSON string
    let hobbies: string[] = [];
    if (apiData.HOBBIES || apiData.hobbies) {
      try {
        const hobbiesData = apiData.HOBBIES || apiData.hobbies;
        const hobbiesArray = typeof hobbiesData === 'string' ? JSON.parse(hobbiesData) : hobbiesData;
        hobbies = Array.isArray(hobbiesArray) ? hobbiesArray : hobbiesData.split(',').map((h: string) => h.trim());
      } catch {
        hobbies = typeof (apiData.HOBBIES || apiData.hobbies) === 'string' 
          ? (apiData.HOBBIES || apiData.hobbies).split(',').map((h: string) => h.trim()) 
          : [];
      }
    }

    // Handle DOB
    let dob = '';
    if (apiData.DOB || apiData.dob) {
      try {
        const dobData = apiData.DOB || apiData.dob;
        if (typeof dobData === 'string' && dobData.includes('{')) {
          const dobObj = JSON.parse(dobData);
          dob = `${dobObj.year}-${String(dobObj.month).padStart(2, '0')}-${String(dobObj.day).padStart(2, '0')}`;
        } else {
          dob = dobData;
        }
      } catch {
        dob = apiData.DOB || apiData.dob || '';
      }
    }

    // Handle images - enhanced to handle base64 encoded images
    let images: string[] = [];
    const imageFields = ['IMAGES', 'images', 'profileImages', 'PROFILEIMAGES'];
    
    for (const field of imageFields) {
      if (apiData[field]) {
        console.log(`Found images in field ${field}:`, apiData[field]);
        try {
          const imagesData = apiData[field];
          if (typeof imagesData === 'string') {
            try {
              // Try to parse as JSON first
              const parsedImages = JSON.parse(imagesData);
              if (Array.isArray(parsedImages)) {
                images = parsedImages.map(img => convertBase64ToDataUrl(img)).filter(Boolean);
              } else {
                // Single image as base64 string
                images = [convertBase64ToDataUrl(imagesData)];
              }
            } catch {
              // If not JSON, treat as comma-separated base64 strings or single base64
              if (imagesData.includes(',')) {
                images = imagesData.split(',').map((img: string) => convertBase64ToDataUrl(img.trim())).filter(Boolean);
              } else {
                images = [convertBase64ToDataUrl(imagesData)];
              }
            }
          } else if (Array.isArray(imagesData)) {
            images = imagesData.map(img => convertBase64ToDataUrl(img)).filter(Boolean);
          } else if (typeof imagesData === 'object' && imagesData !== null) {
            // If it's an object, try to extract base64 strings from values
            images = Object.values(imagesData).map(img => convertBase64ToDataUrl(img as string)).filter(Boolean);
          }
          break; // Stop at first valid field found
        } catch (error) {
          console.error(`Error parsing images from field ${field}:`, error);
        }
      }
    }
    
    console.log('Parsed and converted images:', images);

    return {
      uid: apiData.UID || apiData.uid || '',
      name: apiData.NAME || apiData.name || 'Unknown User',
      email: apiData.EMAIL || apiData.email || '',
      city: apiData.CITY || apiData.city || '',
      country: apiData.COUNTRY || apiData.country || '',
      birth_city: apiData.BIRTH_CITY || apiData.birth_city || '',
      birth_country: apiData.BIRTH_COUNTRY || apiData.birth_country || '',
      gender: apiData.GENDER || apiData.gender || '',
      profession: apiData.PROFESSION || apiData.profession || '',
      dob: dob,
      tob: apiData.TOB || apiData.tob || '',
      hobbies: hobbies,
      images: images,
      login: apiData.LOGIN || apiData.login || ''
    };
  };

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    console.log('Raw userData from localStorage:', userData);
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log('Parsed userData:', parsedData);
        
        // Check if images are stored in any other location in localStorage
        const allLocalStorageKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allLocalStorageKeys);
        
        allLocalStorageKeys.forEach(key => {
          if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo')) {
            console.log(`Found potential image key ${key}:`, localStorage.getItem(key));
          }
        });
        
        // Transform the data to handle both uppercase and lowercase field names
        const transformedData = transformUserData(parsedData.profile || parsedData);
        console.log('Transformed profile data:', transformedData);
        setProfileData(transformedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No profile data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={profileData?.images?.[0]} 
                  onError={(e) => {
                    console.error('Failed to load avatar image:', profileData?.images?.[0]);
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded avatar image:', profileData?.images?.[0]);
                  }}
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-3xl">
                  {profileData?.name?.charAt(0) || <User className="w-16 h-16" />}
                </AvatarFallback>
              </Avatar>
              {profileData?.images && profileData.images.length > 1 && (
                <Badge className="absolute -bottom-2 -right-2 bg-orange-500">
                  <Camera className="w-3 h-3 mr-1" />
                  {profileData.images.length}
                </Badge>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
                  {profileData?.name}
                </h1>
                {onEdit && (
                  <Button onClick={onEdit} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                {profileData?.dob && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {calculateAge(profileData.dob)} years old
                  </div>
                )}
                
                {profileData?.city && profileData.country && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profileData.city}, {profileData.country}
                  </div>
                )}

                {profileData?.profession && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {profileData.profession}
                  </div>
                )}

                {profileData?.tob && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Born at {formatTime(profileData.tob)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{profileData?.email}</p>
            </div>
            
            {profileData?.gender && (
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 capitalize">{profileData.gender}</p>
              </div>
            )}

            {profileData?.dob && (
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{new Date(profileData.dob).toLocaleDateString()}</p>
              </div>
            )}

            {profileData?.birth_city && profileData.birth_country && (
              <div>
                <label className="text-sm font-medium text-gray-500">Birth Place</label>
                <p className="text-gray-900">{profileData.birth_city}, {profileData.birth_country}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interests & Hobbies */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Heart className="w-5 h-5 mr-2 text-orange-500" />
              Interests & Hobbies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData?.hobbies && profileData.hobbies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.hobbies.map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
                    {hobby}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hobbies listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Photos {profileData?.images && profileData.images.length > 0 ? `(${profileData.images.length})` : '(0)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileData?.images && profileData.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profileData.images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`Profile ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      console.error(`Failed to load image ${index + 1}:`, image);
                      // Show a placeholder or hide the image
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded image ${index + 1}:`, image);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 italic">No photos uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
