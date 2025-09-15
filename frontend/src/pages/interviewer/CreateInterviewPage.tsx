import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Upload, Users, Clock, Loader2, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/components/ui/Toast';
import { processExcelFile, createInterview, type Candidate } from '@/api/interview';

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const CreateInterviewPage = () => {
  const navigate = useNavigate();
  const [interviewName, setInterviewName] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDaySlots, setSelectedDaySlots] = useState<Map<string, string[]>>(new Map());

  // Generate dates between fromDate and toDate
  const dateRange = fromDate && toDate 
    ? eachDayOfInterval({ start: fromDate, end: toDate })
    : [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const processedCandidates = await processExcelFile(file);
      
      // Debug log to check processed data
      console.log('Raw processed candidates:', processedCandidates);
      
      if (Array.isArray(processedCandidates) && processedCandidates.length > 0) {
        // Ensure each candidate has required fields
        const validCandidates = processedCandidates.filter(
          candidate => candidate.email && candidate.name
        );
        
        console.log('Validated candidates:', validCandidates);
        setCandidates(validCandidates);
        setSelectedFile(file.name);
        showToast.success(`Successfully processed ${validCandidates.length} candidates`);
      } else {
        throw new Error('No valid candidates found in Excel file');
      }
    } catch (error) {
      console.error('Failed to process Excel file:', error);
      showToast.error('Failed to process Excel file. Please check the format.');
      setSelectedFile('');
      setCandidates([]); // Reset candidates on error
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (date: Date, slot: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDaySlots(prev => {
      const newMap = new Map(prev);
      const daySlots = newMap.get(dateStr) || [];
      
      if (daySlots.includes(slot)) {
        newMap.set(dateStr, daySlots.filter(s => s !== slot));
      } else {
        newMap.set(dateStr, [...daySlots, slot]);
      }
      
      if (newMap.get(dateStr)?.length === 0) {
        newMap.delete(dateStr);
      }
      
      return newMap;
    });
  };

  const isSlotSelected = (date: Date, slot: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedDaySlots.get(dateStr)?.includes(slot) || false;
  };

  // Add a function to check if form is valid
  const isFormValid = () => {
    return (
      interviewName.trim() !== '' &&
      fromDate !== null &&
      toDate !== null &&
      selectedDaySlots.size > 0 &&
      selectedFile !== ''
    );
  };

  const handleCreateInterview = async () => {
    if (!isFormValid()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Convert the Map to the expected Record structure
      const formattedTimeSlots: Record<string, Record<string, string | null>> = {};
      selectedDaySlots.forEach((slots, date) => {
        formattedTimeSlots[date] = {};
        slots.forEach(slot => {
          formattedTimeSlots[date][slot] = null;
        });
      });

      await createInterview({
        interviewName,
        fromDate: format(fromDate!, 'yyyy-MM-dd'),
        toDate: format(toDate!, 'yyyy-MM-dd'),
        timeSlots: formattedTimeSlots,  // Use the formatted time slots
        candidates
      });

      showToast.success('Interview created successfully');
      
      // Reset form
      setInterviewName('');
      setFromDate(undefined);
      setToDate(undefined);
      setSelectedDaySlots(new Map());
      setSelectedFile('');
      setCandidates([]);

    } catch (error) {
      console.error('Failed to create interview:', error);
      showToast.error('Failed to create interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile('');
    setCandidates([]);
  };

  useEffect(() => {
    console.log('Candidates state updated:', candidates);
  }, [candidates]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Create Interview</h1>

        {/* Interview Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interview Name</label>
          <input
            type="text"
            value={interviewName}
            onChange={e => setInterviewName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter interview name"
          />
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  disabled={date => date < new Date()}
                  initialFocus
                  required
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  disabled={date => !fromDate || date < fromDate}
                  initialFocus
                  required
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Excel Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Candidates</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md bg-blue-50 hover:bg-blue-100">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Upload Excel File</span>
            </label>
            <span className="text-xs text-gray-500">(Excel file with columns: email, name)</span>
          </div>

          {selectedFile && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600">{selectedFile}</span>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              </div>
              <button onClick={clearFileSelection}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Candidates Display - Moved before Timeline */}
        {candidates.length > 0 && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-medium text-gray-700">
                Processed Candidates ({candidates.length})
              </h4>
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md divide-y bg-white">
              {candidates.map((candidate, index) => (
                <div key={index} className="p-2 flex justify-between text-sm hover:bg-gray-50">
                  <span className="font-medium">{candidate.name}</span>
                  <span className="text-gray-500">{candidate.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline View */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Interview Timeline</h3>
          </div>
          
          {dateRange.length > 0 ? (
            <div className="space-y-6">
              {dateRange.map(date => (
                <div key={format(date, 'yyyy-MM-dd')} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={`${format(date, 'yyyy-MM-dd')}-${slot}`}
                        type="button"
                        onClick={() => handleTimeSlotSelect(date, slot)}
                        className={`h-10 rounded-md font-medium transition-colors ${
                          isSlotSelected(date, slot)
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
              <p>Select date range to view available time slots</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-12 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleCreateInterview}
          disabled={loading || !isFormValid()}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creating...
            </div>
          ) : (
            'Create Interview'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateInterviewPage;