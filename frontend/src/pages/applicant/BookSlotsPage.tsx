import { useState, useEffect } from 'react';
import { getAvailableInterviews, bookSlot } from '@/api/interview';
import type { AvailableInterview } from '@/api/interview';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/Toast';
import { Calendar, Clock } from 'lucide-react';

const BookSlotsPage = () => {
  const [interviews, setInterviews] = useState<AvailableInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await getAvailableInterviews();
      setInterviews(data);
    } catch (error) {
      showToast.error('Failed to fetch available interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (interviewId: string, date: string, timeSlot: string) => {
    try {
      await bookSlot(interviewId, date, timeSlot);
      showToast.success('Slot booked successfully');
      fetchInterviews();
    } catch (error) {
      showToast.error('Failed to book slot');
    }
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
          <h1 className="text-2xl font-bold text-[#1877F2]">Available Interviews</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No interviews available at the moment
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">{interview.interviewName}</h2>
                <div className="mb-4 flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{interview.fromDate} - {interview.toDate}</span>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(interview.availableSlots).map(([date, slots]) => (
                    <div key={date} className="border-t pt-4">
                      <h3 className="font-medium mb-2">{date}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <Button
                            key={slot}
                            variant="outline"
                            size="sm"
                            className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                            onClick={() => handleBookSlot(interview.id, date, slot)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSlotsPage;