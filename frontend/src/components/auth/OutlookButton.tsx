import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/components/ui/Toast";
import RoleSelectionModal from "./RoleSelectionModal";
import { UserRole } from "@/lib/types";

export default function OutlookButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMicrosoftAuth = async (role: UserRole) => {
    setIsLoading(true);
    try {
      // Microsoft OAuth URL
      const clientId = "your-microsoft-client-id"; // Replace with actual client ID
      const redirectUri = encodeURIComponent("http://localhost:5173/auth/microsoft/callback");
      const scope = encodeURIComponent("openid profile email");
      const responseType = "code";
      const tenantId = "common";
      
      const microsoftAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=${responseType}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_mode=query&` +
        `state=12345`;

      // Store role in sessionStorage for callback
      sessionStorage.setItem("oauth_role", role);
      sessionStorage.setItem("oauth_provider", "microsoft");

      // Redirect to Microsoft OAuth
      window.location.href = microsoftAuthUrl;
    } catch (error) {
      showToast.error("Failed to initiate Microsoft authentication");
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    setShowRoleModal(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white"
        onClick={handleClick}
        disabled={isLoading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
        </svg>
        {isLoading ? "Loading..." : "Continue with Microsoft"}
      </Button>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelected={handleMicrosoftAuth}
        provider="microsoft"
      />
    </>
  );
}
