import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

const Integration: React.FC = () => {
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const { user } = useAuth();

  const handleConnectGoogle = () => {
    try {
      setConnectingGoogle(true);
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      }&redirect_uri=${
        import.meta.env.VITE_GOOGLE_REDIRECT_URI
      }&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`;

      window.location.href = googleOAuthUrl;
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      showToast.error('Failed to connect to Google Calendar');
      setConnectingGoogle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">
            Connect your calendar to manage interview schedules
          </p>
        </div>
      </div>

      {/* Calendar Integration Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle>Calendar Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your calendar to automatically schedule interviews and send invites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Calendar Connection */}
          <div className="pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Add Calendar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Google Calendar */}
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={handleConnectGoogle}
                disabled={connectingGoogle}
              >
                {connectingGoogle ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Google Calendar</div>
                      <div className="text-xs text-gray-500">Connect your Google Calendar</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </>
                )}
              </Button>

              {/* Microsoft Calendar (disabled) */}
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 p-4 h-auto border-gray-300 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Outlook Calendar</div>
                  <div className="text-xs text-gray-500">Coming soon</div>
                </div>
              </Button>
            </div>
          </div>

          {/* No calendars message */}
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No calendars connected</p>
            <p className="text-sm">Connect a calendar to start scheduling interviews automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integration;