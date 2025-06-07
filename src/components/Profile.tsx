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
    
    if (!base64Data) {
      console.log('No base64 data provided');
      return '';
    }

    let base64String = '';

    if (typeof base64Data === 'object') {
      base64String = base64Data.data || base64Data.base64 || base64Data.content || base64Data.image || '';
      
      if (!base64String) {
        try {
          const stringified = JSON.stringify(base64Data);
          const base64Match = stringified.match(/"([A-Za-z0-9+/=]{50,})"/);
          if (base64Match) {
            base64String = base64Match[1];
          }
        } catch {
          console.log('Failed to extract base64 from object');
          return '';
        }
      }
    } else {
      base64String = String(base64Data);
    }

    base64String = base64String.trim();
    
    if (base64String.startsWith('data:')) {
      console.log('Already a data URL');
      return base64String;
    }
    
    if (base64String.startsWith('http://') || base64String.startsWith('https://')) {
      console.log('Regular URL detected');
      return base64String;
    }
    
    if (base64String.length > 20 && /^[A-Za-z0-9+/=]+$/.test(base64String)) {
      // Try different image formats
      const formats = ['jpeg', 'jpg', 'png', 'webp'];
      const dataUrl = `data:image/jpeg;base64,${base64String}`;
      console.log('Created data URL:', dataUrl.substring(0, 100) + '...');
      return dataUrl;
    }
    
    console.log('Invalid base64 data format');
    return '';
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

    // Enhanced image processing
    let images: string[] = [];
    const imageFields = ['IMAGES', 'images', 'profileImages', 'PROFILEIMAGES'];
    
    for (const field of imageFields) {
      if (apiData[field]) {
        console.log(`Processing images from field ${field}:`, apiData[field]);
        try {
          const imagesData = apiData[field];
          
          if (typeof imagesData === 'string') {
            try {
              const parsedImages = JSON.parse(imagesData);
              if (Array.isArray(parsedImages)) {
                images = parsedImages
                  .map(img => convertBase64ToDataUrl(img))
                  .filter(url => url && url.length > 0);
              } else {
                const converted = convertBase64ToDataUrl(imagesData);
                if (converted) images = [converted];
              }
            } catch {
              if (imagesData.includes(',')) {
                images = imagesData.split(',')
                  .map((img: string) => convertBase64ToDataUrl(img.trim()))
                  .filter(url => url && url.length > 0);
              } else {
                const converted = convertBase64ToDataUrl(imagesData);
                if (converted) images = [converted];
              }
            }
          } else if (Array.isArray(imagesData)) {
            images = imagesData
              .map(img => convertBase64ToDataUrl(img))
              .filter(url => url && url.length > 0);
          } else if (typeof imagesData === 'object' && imagesData !== null) {
            images = Object.values(imagesData)
              .map(img => convertBase64ToDataUrl(img as string))
              .filter(url => url && url.length > 0);
          }
          
          if (images.length > 0) break;
        } catch (error) {
          console.error(`Error parsing images from field ${field}:`, error);
        }
      }
    }
    
    console.log('Final processed images:', images.length, 'images found');
    images.forEach((img, idx) => {
      console.log(`Image ${idx + 1}:`, img.substring(0, 50) + '... (length: ' + img.length + ')');
    });

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
        
        const allLocalStorageKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allLocalStorageKeys);
        
        allLocalStorageKeys.forEach(key => {
          if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo')) {
            console.log(`Found potential image key ${key}:`, localStorage.getItem(key));
          }
        });
        
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

      {/* Enhanced Photo Gallery */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Photos {profileData?.images && profileData.images.length > 0 ? `(${profileData.images.length})` : '(0)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileData?.images && profileData.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profileData.images.map((image, index) => {
                console.log(`Rendering image ${index + 1}:`, image ? image.substring(0, 50) + '...' : 'Empty image');
                
                if (!image || image.length === 0) {
                  console.warn(`Skipping empty image at index ${index}`);
                  return null;
                }
                
                return (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 shadow-md bg-gray-100">
                    <img
                      src={image}
                      alt={`Profile photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                      onError={(e) => {
                        console.error(`Failed to load image ${index + 1}:`, image.substring(0, 100));
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                              <div class="text-center">
                                <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                </svg>
                                <p class="text-xs">Image ${index + 1}</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded image ${index + 1}`);
                      }}
                    />
                  </div>
                );
              })}
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
