import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getInterviewById } from '@/api/interview';
import type { Interview } from './AnalyticsPage';
import { showToast } from '@/components/ui/Toast';

const InterviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    try {
      const data = await getInterviewById(id!);
      setInterview(data);
    } catch (error) {
      showToast.error('Failed to fetch interview details');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const getTotalSlots = (interview: Interview) => {
    return Object.values(interview.timeSlots).reduce((total, daySlots) => 
      total + Object.keys(daySlots).length, 0
    );
  };

  const getBookedSlots = (interview: Interview) => {
    return Object.values(interview.timeSlots).reduce((total, daySlots) => 
      total + Object.values(daySlots).filter(slot => slot !== null).length, 0
    );
  };

  const getUpcomingBookings = (interview: Interview) => {
    const today = new Date();
    return Object.entries(interview.timeSlots)
      .filter(([date]) => new Date(date) >= today)
      .reduce((total, [_, slots]) => 
        total + Object.values(slots).filter(slot => slot !== null).length, 0
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">Interview not found</p>
        <Button
          className="mt-4"
          onClick={() => navigate('/dashboard/analytics')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analytics
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
            onClick={() => navigate('/dashboard/analytics')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analytics
          </Button>
          <h1 className="text-2xl font-bold text-[#1877F2]">{interview.interviewName}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Interview Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-[#1877F2] mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Date Range</p>
                    <p className="font-medium">
                      {format(new Date(interview.fromDate), 'MMMM d, yyyy')} - 
                      {format(new Date(interview.toDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-[#1877F2] mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {Object.keys(interview.timeSlots).length} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 text-[#1877F2] mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Total Candidates</p>
                    <p className="font-medium">{interview.candidates?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Slots', value: getTotalSlots(interview) },
                { label: 'Booked Slots', value: getBookedSlots(interview) },
                { label: 'Upcoming Bookings', value: getUpcomingBookings(interview) }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1877F2] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Interview Timeline</h2>
              <div className="space-y-4">
                {Object.entries(interview.timeSlots).map(([date, slots]) => (
                  <div key={date} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-2">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(slots).map(([time, candidate]) => (
                        <div 
                          key={`${date}-${time}`}
                          className={`p-2 rounded-lg text-sm ${
                            candidate 
                              ? 'bg-[#1877F2] text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <p className="font-medium">{time}</p>
                          {candidate && <p className="text-xs truncate">{candidate}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Schedule</h2>
              {interview.timeSlots[format(new Date(), 'yyyy-MM-dd')] ? (
                <div className="space-y-2">
                  {Object.entries(interview.timeSlots[format(new Date(), 'yyyy-MM-dd')])
                    .map(([time, candidate]) => (
                      <div key={time} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
                        <span className="font-medium">{time}</span>
                        <span className={`text-sm ${candidate ? 'text-[#1877F2]' : 'text-gray-400'}`}>
                          {candidate || 'Available'}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No interviews scheduled today</p>
              )}
            </div>

            {/* Booking Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking Rate</span>
                  <span className="font-medium text-[#1877F2]">
                    {Math.round((getBookedSlots(interview) / getTotalSlots(interview)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Slots</span>
                  <span className="font-medium text-[#1877F2]">
                    {getTotalSlots(interview) - getBookedSlots(interview)}
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

export default InterviewDetails;