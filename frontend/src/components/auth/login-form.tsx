import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { signupUser, loginUser } from "@/api/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { showToast } from "@/components/ui/Toast"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import OtpForm from "@/components/auth/OtpForm"
import axios from "axios"
import AuthSidePanel from "@/components/auth/AuthSidePanel"

export function AuthForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLogin, setIsLogin] = useState(true);
  const [otpStep, setOtpStep] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await loginUser(email, password);
      showToast.success(res.message || "Login successful");
      login({ email }, res.token);
      navigate("/dashboard");
    } catch (err: any) {
      showToast.error(err.response?.data || "Login failed");
    }
  };

  // Signup handler
  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const res = await signupUser(name, email, password);
      if (typeof res === "string" && res.includes("OTP")) {
        showToast.success(res);
        setOtpStep(true);
        setSignupEmail(email);
      } else {
        showToast.info(res);
      }
    } catch (err: any) {
      showToast.error(err.response?.data || "Signup failed");
    }
  };

  // OTP handler
  const handleVerifyOtp = async (otp: string) => {
    setOtpError("");
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email: signupEmail,
        code: otp,
      });
      if (res.data.message?.includes("verified") && res.data.token) {
        showToast.success(res.data.message);
        login({ email: signupEmail }, res.data.token); // <-- Store JWT and user
        setOtpStep(false);
        setIsLogin(true);
        navigate("/dashboard"); // <-- Go to dashboard
      } else {
        setOtpError(res.data.message || "OTP verification failed");
      }
    } catch (err: any) {
      setOtpError(err.response?.data || "OTP verification failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-lg border border-blue-200">
        <CardContent className="grid p-0 md:grid-cols-2 relative">
          <AnimatePresence mode="wait">
            {otpStep ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 md:col-span-1 order-2"
              >
                <OtpForm email={signupEmail} onVerify={handleVerifyOtp} error={otpError} />
              </motion.div>
            ) : isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 md:col-span-1 order-1"
              >
                <LoginForm
                  onLogin={handleLogin}
                  error=""
                  switchToSignup={() => setIsLogin(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 md:col-span-1 order-2"
              >
                <SignupForm
                  onSignup={handleSignup}
                  error=""
                  switchToLogin={() => setIsLogin(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AuthSidePanel />
        </CardContent>
      </Card>
    </div>
  );
}
