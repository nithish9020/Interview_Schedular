import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/Toast';
import { getMyApplications } from '@/api/applicant';

export interface Application {
  id: string;
  interviewName: string;
  interviewDate: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'missed';
  interviewer: string;
}

interface Stats {
  total: number;
  upcoming: number;
  completed: number;
  missed: number;
}

const MyApplicationPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    upcoming: 0,
    completed: 0,
    missed: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      
      if (response && response.applications) {
        setApplications(response.applications);
        setStats(response.stats || {
          total: response.applications.length,
          upcoming: 0,
          completed: 0,
          missed: 0
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (applicationId: string) => {
    navigate(`/dashboard/my-applications/${applicationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#1877F2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-[#1877F2]">My Applications</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 capitalize">{key}</span>
                <span className="text-2xl font-bold text-[#1877F2]">{value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No applications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{application.interviewName}</h3>
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {application.interviewDate}
                        </span>
                        {application.timeSlot && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {application.timeSlot}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                      onClick={() => handleViewDetails(application.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplicationPage;