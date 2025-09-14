import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "@/context/AuthContext";
import AuthRedirect from "@/components/auth/AuthRedirect";
import ProtectedRoute from "@/components/ProtectedRoute";

// Example pages
import AnalyticsPage from "@/pages/interviewer/AnalyticsPage";
import CreateInterviewPage from "@/pages/interviewer/CreateInterviewPage";
import MyApplicationsPage from "@/pages/applicant/MyApplicationPage";
import BookSlotsPage from "@/pages/applicant/BookSlotsPage";
import Profile from "./pages/Profile";
import Integeration from "./pages/Integration";
import GoogleCallback from "./pages/auth/GoogleCallback";
import MicrosoftCallback from "./pages/auth/MicrosoftCallback";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/microsoft/callback" element={<MicrosoftCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* interviewer sub routes */}
            <Route
              path="analytics"
              element={
                <ProtectedRoute role="INTERVIEWER">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-interview"
              element={
                <ProtectedRoute role="INTERVIEWER">
                  <CreateInterviewPage />
                </ProtectedRoute>
              }
            />

            {/* applicant sub routes */}
            <Route
              path="my-applications"
              element={
                <ProtectedRoute role="APPLICANT">
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="book-slots"
              element={
                <ProtectedRoute role="APPLICANT">
                  <BookSlotsPage />
                </ProtectedRoute>
              }
            />
            {/* protected routes common for interviewer and applicant*/}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="integration"
              element={
                <ProtectedRoute>
                  <Integeration />
                </ProtectedRoute>  
              }
            />
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}
