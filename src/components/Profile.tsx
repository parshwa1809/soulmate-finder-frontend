
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
import { config } from "../config/api";

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
      const dataUrl = `data:image/jpeg;base64,${base64String}`;
      console.log('Created data URL:', dataUrl.substring(0, 100) + '...');
      return dataUrl;
    }
    
    console.log('Invalid base64 data format');
    return '';
  };

  const transformUserData = (apiData: any): ProfileData => {
    console.log('Raw API data for transformation:', apiData);
    
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

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log(`Fetching user profile for UID: ${uid}`);
      const response = await fetch(`${config.URL}${config.ENDPOINTS.GET_PROFILE}/${uid}`, {
        method: 'GET',
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log('User profile fetched successfully:', profileData);
        return profileData;
      } else {
        console.error(`Failed to fetch user profile, status: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      // First try to get UID from localStorage
      const userUID = localStorage.getItem('userUID');
      
      if (userUID) {
        // Fetch fresh profile data from API
        const freshProfileData = await fetchUserProfile(userUID);
        if (freshProfileData) {
          const transformedData = transformUserData(freshProfileData);
          console.log('Transformed fresh profile data:', transformedData);
          setProfileData(transformedData);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to userData from localStorage
      const userData = localStorage.getItem('userData');
      console.log('Raw userData from localStorage:', userData);
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          console.log('Parsed userData:', parsedData);
          
          // The profile data is directly in the root of userData, not under a 'profile' property
          const transformedData = transformUserData(parsedData);
          console.log('Transformed profile data:', transformedData);
          setProfileData(transformedData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoading(false);
    };

    loadProfileData();
  }, []);

  const handleEditProfile = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleUploadPhotos = () => {
    // This will be handled by the parent component (ProfilePage)
    if (onEdit) {
      onEdit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No profile data available</p>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl"></div>
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl">
                  <AvatarImage 
                    src={profileData?.images?.[0]} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-semibold">
                    {profileData?.name?.charAt(0) || <User className="w-20 h-20" />}
                  </AvatarFallback>
                </Avatar>
                {profileData?.images && profileData.images.length > 1 && (
                  <Badge className="absolute -bottom-2 -right-2 bg-primary">
                    <Camera className="w-3 h-3 mr-1" />
                    {profileData.images.length}
                  </Badge>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                      {profileData?.name}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      {profileData?.profession || 'Professional'}
                    </p>
                  </div>
                  {onEdit && (
                    <Button 
                      onClick={handleEditProfile} 
                      size="lg"
                      className="mt-4 md:mt-0"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                  {profileData?.dob && (
                    <div className="flex items-center justify-center md:justify-start">
                      <Calendar className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">{calculateAge(profileData.dob)} years</span>
                    </div>
                  )}
                  
                  {profileData?.city && profileData.country && (
                    <div className="flex items-center justify-center md:justify-start">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">{profileData.city}, {profileData.country}</span>
                    </div>
                  )}

                  {profileData?.profession && (
                    <div className="flex items-center justify-center md:justify-start">
                      <Briefcase className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">{profileData.profession}</span>
                    </div>
                  )}

                  {profileData?.tob && (
                    <div className="flex items-center justify-center md:justify-start">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">{formatTime(profileData.tob)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="w-5 h-5 mr-3 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                    <p className="text-lg text-foreground mt-1">{profileData?.email}</p>
                  </div>
                  
                  {profileData?.gender && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gender</label>
                      <p className="text-lg text-foreground mt-1 capitalize">{profileData.gender}</p>
                    </div>
                  )}

                  {profileData?.dob && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                      <p className="text-lg text-foreground mt-1">{new Date(profileData.dob).toLocaleDateString()}</p>
                    </div>
                  )}

                  {profileData?.birth_city && profileData.birth_country && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Birth Place</label>
                      <p className="text-lg text-foreground mt-1">{profileData.birth_city}, {profileData.birth_country}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Camera className="w-5 h-5 mr-3 text-primary" />
                  Photo Gallery
                  {profileData?.images && profileData.images.length > 0 && (
                    <Badge variant="secondary" className="ml-3">
                      {profileData.images.length} photos
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData?.images && profileData.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profileData.images.map((image, index) => {
                      if (!image || image.length === 0) return null;
                      
                      return (
                        <div key={index} className="aspect-square overflow-hidden rounded-xl bg-muted group cursor-pointer">
                          <img
                            src={image}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <div class="text-center">
                                      <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                      <p class="text-xs">Photo ${index + 1}</p>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No photos uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Interests & Hobbies */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Heart className="w-5 h-5 mr-3 text-primary" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData?.hobbies && profileData.hobbies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.hobbies.map((hobby, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-3 py-1 rounded-full text-sm"
                      >
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No interests listed</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleEditProfile}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleUploadPhotos}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
