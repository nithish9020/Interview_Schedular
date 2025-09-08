import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/components/ui/Toast";
import RoleSelectionModal from "./RoleSelectionModal";
import { UserRole } from "@/lib/types";

export default function GoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = async (role: UserRole) => {
    setIsLoading(true);
    try {
      // Clear any existing OAuth state
      sessionStorage.removeItem("oauth_role");
      sessionStorage.removeItem("oauth_provider");
      
      // Google OAuth URL
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const redirectUri = encodeURIComponent("http://localhost:5173/auth/google/callback");
      const scope = encodeURIComponent("email profile");
      const responseType = "code";
      
      // Add state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("oauth_state", state);
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      // Store role in sessionStorage for callback
      sessionStorage.setItem("oauth_role", role);
      sessionStorage.setItem("oauth_provider", "google");

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      showToast.error("Failed to initiate Google authentication");
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
        <FcGoogle className="h-5 w-5" />
        {isLoading ? "Loading..." : "Continue with Google"}
      </Button>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelected={handleGoogleAuth}
        provider="google"
      />
    </>
  );
}