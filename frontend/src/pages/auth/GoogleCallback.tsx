import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/components/ui/Toast";
import axios from "axios";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing using useRef
      if (hasProcessedRef.current) {
        console.log("OAuth callback already processed, skipping...");
        return;
      }
      
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          showToast.error("Google authentication was cancelled");
          navigate("/");
          return;
        }

        if (!code) {
          showToast.error("No authorization code received");
          navigate("/");
          return;
        }

        // Get stored role and provider from sessionStorage
        const role = sessionStorage.getItem("oauth_role");
        const provider = sessionStorage.getItem("oauth_provider");
        const storedState = sessionStorage.getItem("oauth_state");
        const receivedState = searchParams.get("state");

        if (!role || provider !== "google") {
          showToast.error("Invalid OAuth session");
          navigate("/");
          return;
        }

        // Validate state parameter for security
        if (storedState !== receivedState) {
          showToast.error("Invalid OAuth state. Please try again.");
          navigate("/");
          return;
        }

        // Mark as processing to prevent duplicates
        hasProcessedRef.current = true;

        // Send code to backend
        const response = await axios.post("http://localhost:8080/api/auth/oauth/callback", {
          code,
          provider: "google",
          role
        });

        if (response.data.token) {
          showToast.success(response.data.message || "Login successful");
          login({ 
            email: response.data.email, 
            name: response.data.name 
          }, response.data.token, response.data.role);
          
          // Clear session storage
          sessionStorage.removeItem("oauth_role");
          sessionStorage.removeItem("oauth_provider");
          sessionStorage.removeItem("oauth_state");
          
          navigate("/dashboard");
        } else {
          showToast.error("Authentication failed");
          navigate("/");
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        
        // Check if it's an invalid_grant error (code already used)
        if (error.response?.data?.includes("invalid_grant")) {
          showToast.info("Authentication already completed. Redirecting to dashboard...");
          // Try to redirect to dashboard anyway, as the user might already be logged in
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          showToast.error(error.response?.data || "Authentication failed");
          navigate("/");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]); // Removed hasProcessed from dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isProcessing ? "Processing authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}