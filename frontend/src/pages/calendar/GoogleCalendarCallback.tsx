import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { connectCalendar } from "@/api/calendar";
import { showToast } from "@/components/ui/Toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function GoogleCalendarCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessedRef.current) {
        console.log("Calendar callback already processed, skipping...");
        return;
      }

      hasProcessedRef.current = true;

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const service = sessionStorage.getItem('calendar_service');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!service) {
          throw new Error('No calendar service found in session');
        }

        // Connect the calendar using the authorization code
        await connectCalendar({
          provider: service,
          code: code,
          redirectUri: 'http://localhost:5173/calendar/google/callback'
        });

        setStatus('success');
        showToast.success('Google Calendar connected successfully!');
        
        // Clear session storage
        sessionStorage.removeItem('calendar_service');
        
        // Redirect to integration page after a short delay
        setTimeout(() => {
          navigate('/integration');
        }, 2000);

      } catch (error) {
        console.error('Calendar connection error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to connect calendar');
        showToast.error('Failed to connect Google Calendar');
        
        // Clear session storage
        sessionStorage.removeItem('calendar_service');
        
        // Redirect to integration page after a short delay
        setTimeout(() => {
          navigate('/integration');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connecting Google Calendar
              </h2>
              <p className="text-gray-600">
                Please wait while we set up your calendar connection...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Your Google Calendar has been connected successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to integration page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to integration page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
