import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";
import { showToast } from "@/components/ui/Toast";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected: (role: UserRole) => void;
  provider: string;
}

export default function RoleSelectionModal({ 
  isOpen, 
  onClose, 
  onRoleSelected, 
  provider 
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async () => {
    if (!selectedRole) {
      showToast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      onRoleSelected(selectedRole);
    } catch (error) {
      showToast.error("Failed to continue with " + provider);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header with Facebook Blue */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Select Your Role
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Continue with {provider === "google" ? "Google" : "Microsoft"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Interviewer Option */}
            <div 
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedRole === UserRole.INTERVIEWER 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedRole(UserRole.INTERVIEWER)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedRole === UserRole.INTERVIEWER 
                    ? "border-blue-500 bg-blue-500" 
                    : "border-gray-300"
                }`}>
                  {selectedRole === UserRole.INTERVIEWER && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Interviewer</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Conduct interviews and manage candidates
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Applicant Option */}
            <div 
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedRole === UserRole.APPLICANT 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedRole(UserRole.APPLICANT)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedRole === UserRole.APPLICANT 
                    ? "border-blue-500 bg-blue-500" 
                    : "border-gray-300"
                }`}>
                  {selectedRole === UserRole.APPLICANT && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Applicant</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Apply for positions and book interview slots
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
