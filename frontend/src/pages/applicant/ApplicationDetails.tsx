import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/Toast';
import { getApplicationById } from '@/api/applicant';
import type { Application } from './MyApplicationPage';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const data = await getApplicationById(id!);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application details:', error);
      showToast.error('Failed to fetch application details');
      navigate('/dashboard/my-applications');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/my-applications');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#1877F2]" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Application not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/my-applications')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <h1 className="text-2xl font-bold text-[#1877F2]">{application.interviewName}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Interview Details</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-[#1877F2]" />
                  <span>{application.interviewDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2 text-[#1877F2]" />
                  <span>{application.timeSlot}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-2 text-[#1877F2]" />
                  <span>Interviewer: {application.interviewer}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${application.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  application.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}>
                {application.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;