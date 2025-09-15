import { useState, useEffect } from 'react';
import { Loader2, Trash2, Eye, Calendar, Users, Clock, TrendingUp, CheckCircle, Clock8 } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getMyInterviews, deleteInterview } from '@/api/interview';

export interface Interview {
  id: string;
  interviewName: string;
  fromDate: string;
  toDate: string;
  timeSlots: Record<string, Record<string, string | null>>;
  createdAt: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  candidates?: { name: string; email: string; slot: string }[];
}

const AnalyticsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const data = await getMyInterviews();
      
      // Add status to each interview
      const interviewsWithStatus = data.map((interview: Interview) => {
        const today = new Date();
        const fromDate = new Date(interview.fromDate);
        const toDate = new Date(interview.toDate);

        let status: 'upcoming' | 'ongoing' | 'completed';
        if (today < fromDate) {
          status = 'upcoming';
        } else if (today > toDate) {
          status = 'completed';
        } else {
          status = 'ongoing';
        }

        return {
          ...interview,
          status
        };
      });

      setInterviews(interviewsWithStatus);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      await deleteInterview(id);
      showToast.success('Interview deleted successfully');
      fetchInterviews();
    } catch (error) {
      showToast.error('Failed to delete interview');
    }
  };

  const stats = {
    total: interviews.length,
    ongoing: interviews.filter(i => i.status === 'ongoing').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    upcoming: interviews.filter(i => i.status === 'upcoming').length
  };

  const todaysBookings = interviews.flatMap(interview => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return Object.entries(interview.timeSlots[today] || {})
      .filter(([_, email]) => email !== null)
      .map(([slot, email]) => ({
        interviewName: interview.interviewName,
        slot,
        email
      }));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Top Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-[#1877F2]">Interview Analytics</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'total', icon: TrendingUp, label: 'Total Interviews' },
                { key: 'ongoing', icon: Clock8, label: 'Ongoing' },
                { key: 'upcoming', icon: Calendar, label: 'Upcoming' },
                { key: 'completed', icon: CheckCircle, label: 'Completed' }
              ].map(({ key, icon: Icon, label }) => (
                <div key={key} 
                     className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-[#1877F2] transition-colors">
                  <div className="flex items-center justify-between">
                    <Icon className="w-8 h-8 text-[#1877F2]" />
                    <span className="text-2xl font-bold text-[#1877F2]">{stats[key]}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{label}</p>
                </div>
              ))}
            </div>

            {/* Interview List */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Interview List</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {interviews.map((interview) => (
                  <div key={interview.id} 
                       className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium">{interview.interviewName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${interview.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                              interview.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="flex space-x-4 text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              {format(new Date(interview.fromDate), 'MMM d, yyyy')} - 
                              {format(new Date(interview.toDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{Object.keys(interview.timeSlots).length} slots</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>
                              {Object.values(interview.timeSlots).reduce((acc, slots) => 
                                acc + Object.values(slots).filter(slot => slot !== null).length, 0
                              )} booked
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                          onClick={() => navigate(`/interviewer/interview/${interview.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(interview.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Today's Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Bookings</h3>
              {todaysBookings.length > 0 ? (
                <div className="space-y-4">
                  {todaysBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{booking.email}</p>
                        <p className="text-sm text-gray-500">{booking.interviewName}</p>
                      </div>
                      <span className="text-sm font-medium text-[#1877F2]">{booking.slot}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No bookings for today</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Slots</span>
                  <span className="font-medium text-[#1877F2]">
                    {interviews.reduce((acc, interview) => 
                      acc + Object.keys(interview.timeSlots).length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-medium text-[#1877F2]">
                    {interviews.reduce((acc, interview) => 
                      acc + Object.values(interview.timeSlots)
                        .reduce((sum, slots) => 
                          sum + Object.values(slots)
                            .filter(slot => slot !== null).length, 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;