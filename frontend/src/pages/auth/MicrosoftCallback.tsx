import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/components/ui/Toast";
import axios from "axios";

export default function MicrosoftCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions using ref (works with StrictMode)
    if (hasProcessedRef.current) {
      return;
    }

    const handleCallback = async () => {
      try {
        // Double-check to prevent race conditions in StrictMode
        if (hasProcessedRef.current) {
          return;
        }
        hasProcessedRef.current = true;
        
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          showToast.error("Microsoft authentication was cancelled");
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

        console.log("OAuth session data:", { role, provider, code: code.substring(0, 10) + "..." });

        if (!role || provider !== "microsoft") {
          console.error("Invalid OAuth session - role:", role, "provider:", provider);
          showToast.error("Invalid OAuth session");
          navigate("/");
          return;
        }

        // Send code to backend
        const response = await axios.post("http://localhost:8080/api/auth/oauth/callback", {
          code,
          provider: "microsoft",
          role
        });

        if (response.data.token) {
          console.log("OAuth response data:", response.data);
          showToast.success(response.data.message || "Login successful");
          login({ 
            email: response.data.email, 
            name: response.data.name 
          }, response.data.token, response.data.role);
          
          // Clear session storage
          sessionStorage.removeItem("oauth_role");
          sessionStorage.removeItem("oauth_provider");
          
          navigate("/dashboard");
        } else {
          showToast.error("Authentication failed");
          navigate("/");
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        showToast.error(error.response?.data?.message || error.response?.data || "Authentication failed");
        navigate("/");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

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
