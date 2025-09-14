import { useState, useEffect } from 'react'
import { Button } from "../ui/button"
import { Card, CardHeader, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Edit, Save, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

interface UserDetails {
  email: string;
  name: string;
  role: 'APPLICANT' | 'INTERVIEWER' | '';
  avatar?: string;
}

export const UserProfile = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    email: '',
    name: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserDetails>({
    email: '',
    name: '',
    role: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const details = {
      email: user.email || 'Not found',
      name: user.name || 'Not found',
      role: user.role || '',
      avatar: user.avatar || ''
    };
    setUserDetails(details);
    setEditForm(details);
  }, []);

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    try {
      // TODO: Implement API call to update user details
      // const response = await updateUserProfile(editForm);
      setUserDetails(editForm);
      localStorage.setItem('user', JSON.stringify(editForm));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm(userDetails);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-[#1877F2] p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Profile Settings</h2>
            {!isEditing && (
              <Button 
                onClick={handleEdit}
                variant="ghost" 
                className="hover:bg-[#1665d1] text-white text-lg"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1 flex flex-col items-center space-y-4">
              <div className="h-40 w-40 rounded-full bg-[#1877F2] flex items-center justify-center">
                {userDetails.avatar ? (
                  <img 
                    src={userDetails.avatar} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white font-bold">
                    {userDetails.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isEditing && (
                <Button variant="outline" className="w-full">
                  Change Photo
                </Button>
              )}
            </div>

            {/* Profile Details Section */}
            <div className="lg:col-span-2 space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <RadioGroup
                      value={editForm.role}
                      onValueChange={(value: 'APPLICANT' | 'INTERVIEWER') => 
                        setEditForm({...editForm, role: value})}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="APPLICANT" id="applicant" />
                        <Label htmlFor="applicant">Applicant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="INTERVIEWER" id="interviewer" />
                        <Label htmlFor="interviewer">Interviewer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <Button 
                      onClick={handleSave}
                      className="bg-[#1877F2] hover:bg-[#1665d1] text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-500">Full Name</h3>
                    <p className="text-2xl font-semibold">{userDetails.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-500">Email</h3>
                    <p className="text-2xl font-semibold">{userDetails.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-500">Role</h3>
                    <span className="inline-block px-4 py-2 text-lg rounded-full bg-[#1877F2]/10 text-[#1877F2] font-semibold">
                      {userDetails.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default UserProfile;