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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
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
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}
