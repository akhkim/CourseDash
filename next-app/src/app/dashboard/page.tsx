'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AddCourseModal from '@/components/AddCourseModal';
import { CourseCard } from '@/components/CourseCard';
import Navbar from '@/components/Navbar';
import { authFetch } from '@/lib/utils/auth-fetch';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, BookOpen, Calendar, ExternalLink, Clock, User, Video } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Pointer } from "@/components/ui/coloured_pointer";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  profName: string;
  times: string[];
  createdAt: string;
  completionRate?: number;
  upcomingDeadlines?: number;
  lecturesUploaded?: number; // Added field for lectures uploaded
  lectureNotes?: Array<{
    id: string;
    title: string;
    fileName: string;
    date: string;
    fileType: string;
    summary: string;
  }>;
}

export default function DashboardPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isHoveringCourse, setIsHoveringCourse] = useState(false);
  const [isHoveringAddButton, setIsHoveringAddButton] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeView, setActiveView] = useState('grid');
  const [currentSemester, setCurrentSemester] = useState('');
  const [isCalendarButtonHovered, setIsCalendarButtonHovered] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Determine current semester based on the current date
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    
    let semester;
    if (currentMonth >= 8 && currentMonth <= 11) { // September-December
      semester = 'Fall';
    } else if (currentMonth >= 0 && currentMonth <= 3) { // January-April
      semester = 'Winter';
    } else { // May-August
      semester = 'Summer';
    }
    
    setCurrentSemester(semester);
  }, []);

  useEffect(() => {
    const added = searchParams.get('added');
    if (added === 'true') {
      toast({
        title: 'Course Added Successfully!',
        description: 'Your course has been added to your dashboard.',
      });
    }
  }, [searchParams, toast]);

  // Add CSS to hide default cursor globally when custom pointer is active
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      body * {
        cursor: ${isHoveringCourse || isHoveringAddButton || isHoveringButton ? 'none !important' : 'auto'};
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isHoveringCourse, isHoveringAddButton, isHoveringButton]);

  // Filter courses based on search term
  useEffect(() => {
    if (courses.length > 0) {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = courses.filter(
          course => 
            course.courseName.toLowerCase().includes(term) || 
            course.courseDescription.toLowerCase().includes(term) ||
            course.profName.toLowerCase().includes(term)
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses(courses);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [searchTerm, courses]);

  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    const target = e.target as HTMLElement;
    const isButton = target.closest('button') !== null;
    setIsHoveringButton(isButton);
  };

  // Replace handleAddToGoogleCalendar with:
  const handleAddToGoogleCalendar = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const response = await authFetch('/api/calendar', {
        method: 'POST'
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add events to calendar');
      }
  
      const successCount = (data.results || []).filter((r: any) => r.status === 'success').length;
      const message = data.message || 'Unknown status';

      toast({
        title: successCount > 0 ? 'Success!' : 'No events added',
        description: successCount > 0 
          ? `Added events from ${successCount} syllabi!`
          : message, // Updated message from API response
      });
  
      await fetchCourses();
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProcessingError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
};


  // Process course data with actual stats
  const processCourseData = (coursesData: Course[]) => {
    return coursesData.map(course => {
      // Count actual lectures if available
      const lectureCount = course.lectureNotes ? course.lectureNotes.length : 0;
      
      return {
        ...course,
        lecturesUploaded: lectureCount
      };
    });
  };

  const fetchCourses = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const response = await authFetch('/api/courses');

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        console.log("Courses data from API:", data);
        if (Array.isArray(data.courses)) {
          const processedCourses = processCourseData(data.courses);
          setCourses(processedCourses);
          setFilteredCourses(processedCourses);
        } else {
          setCourses([]);
          setFilteredCourses([]);
          setError('Invalid response format from API');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('An error occurred while fetching your courses');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleAddCourse = async (formData: any) => {
    try {
      if (formData.times && Array.isArray(formData.times)) {
        formData.times = formData.times.filter((time: any) => time && typeof time === 'string');
      } else {
        formData.times = [];
      }

      const response = await authFetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsAddCourseModalOpen(false);
        toast({
          title: 'Success!',
          description: 'Course has been added successfully',
        });
        fetchCourses();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add course',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  // Sort sessions by proximity to the current day and time
  const sortSessionsByProximity = (
    sessions: Array<{ type: string; day: string; time: string }>
  ): Array<{ type: string; day: string; time: string }> => {
    if (!sessions.length) return [];
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Map day strings to numbers (0-6)
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Sunday': 0,
      'Mon': 1, 'Monday': 1,
      'Tue': 2, 'Tuesday': 2,
      'Wed': 3, 'Wednesday': 3,
      'Thu': 4, 'Thursday': 4,
      'Fri': 5, 'Friday': 5,
      'Sat': 6, 'Saturday': 6
    };
    
    return [...sessions].sort((a, b) => {
      // Parse days to numeric values
      const dayA = dayMap[a.day] ?? -1;
      const dayB = dayMap[b.day] ?? -1;
      
      if (dayA === -1 || dayB === -1) {
        console.error("Unknown day format:", a.day, b.day);
        return 0;
      }
      
      // Parse start times
      const startTimeA = a.time.split('-')[0].trim();
      const startTimeB = b.time.split('-')[0].trim();
      
      const [hourA, minuteA] = startTimeA.split(':').map(Number);
      const [hourB, minuteB] = startTimeB.split(':').map(Number);
      
      // Calculate days from now (0 = today, 1 = tomorrow, etc.)
      let daysFromNowA = (dayA - currentDay + 7) % 7;
      let daysFromNowB = (dayB - currentDay + 7) % 7;
      
      // If it's today but the time has passed, it's effectively 7 days away
      if (daysFromNowA === 0 && (hourA < currentHour || (hourA === currentHour && minuteA < currentMinute))) {
        daysFromNowA = 7;
      }
      if (daysFromNowB === 0 && (hourB < currentHour || (hourB === currentHour && minuteB < currentMinute))) {
        daysFromNowB = 7;
      }
      
      // First compare by days from now
      if (daysFromNowA !== daysFromNowB) {
        return daysFromNowA - daysFromNowB;
      }
      
      // If same day, compare by time
      return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
    });
  };

  // Parse course times into structured objects
  const parseCourseTimes = (times: string[] = []): Array<{ type: string; day: string; time: string }> => {
    const result: Array<{ type: string; day: string; time: string }> = [];
  
    if (!Array.isArray(times)) {
      console.error("Invalid input: times is not an array", times);
      return result;
    }
  
    for (const time of times) {
      try {
        if (typeof time !== 'string' || !time.includes(':')) continue;
  
        // Use regex split to only split on the first colon
        const [typeWithColon, details] = time.split(/:(.+)/).map(str => str.trim());
        if (!typeWithColon || !details) continue;
  
        const type = typeWithColon.toLowerCase();
  
        result.push({
          type: type === 'lecture' ? 'Lecture' :
                type === 'tutorial' ? 'Tutorial' :
                type === 'officehours' ? 'Office Hours' :
                type.charAt(0).toUpperCase() + type.slice(1), 
          day: details.split(' ')[0],  // Extracts "Wed" or "Thu"
          time: details.substring(details.indexOf(' ') + 1) // Extracts full time "8:00-09:00"
        });
  
      } catch (err) {
        console.error("Error parsing time:", time, err);
      }
    }
  
    return result;
  };

  // Format the lecture time for display
  const formatLectureTimes = (times: string[]) => {
    if (!times || times.length === 0) return "No scheduled times";
    
    // Parse all times
    const sessions = parseCourseTimes(times);
    
    // Filter to only include lectures
    const lectureSessions = sessions.filter(session => 
      session.type === 'Lecture' || session.type.toLowerCase() === 'lecture'
    );
    
    // If no lectures are found, return a message
    if (lectureSessions.length === 0) {
      return "No lectures scheduled";
    }
    
    // Sort lectures by proximity to current time
    const sortedLectures = sortSessionsByProximity(lectureSessions);
    
    // Return only the next upcoming lecture
    if (sortedLectures.length > 0) {
      const nextLecture = sortedLectures[0];
      return `Next: ${nextLecture.day} ${nextLecture.time}`;
    }
    
    return "No scheduled times";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative" onMouseMove={handleMouseMove}>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <Navbar />
      {(isHoveringCourse || isHoveringAddButton || isHoveringButton) && <Pointer position={mousePosition} />}
      
      <main className="container mx-auto px-4 py-12">
        {/* Dashboard Header with Visual Elements */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-800 opacity-20 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">My Learning Dashboard</h1>
              <p className="text-indigo-100 max-w-xl">Manage your courses, track your progress, and stay organized with all your academic activities in one place.</p>
              
              {!isLoading && filteredCourses.length > 0 && (
                <div className="mt-6 flex space-x-6">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center">
                    <div className="p-2 bg-indigo-500 rounded-full mr-3">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100">Active Courses</p>
                      <p className="text-2xl font-bold">{filteredCourses.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center">
                    <div className="p-2 bg-indigo-500 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100">This Semester</p>
                      <p className="text-2xl font-bold">{currentSemester}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Google Calendar Button */}
            <div 
              className={`relative group ${isCalendarButtonHovered ? 'scale-105' : 'scale-100'} transition-all duration-300`}
              onMouseEnter={() => setIsCalendarButtonHovered(true)}
              onMouseLeave={() => setIsCalendarButtonHovered(false)}
            >
              <div className={`absolute -inset-1 bg-white bg-opacity-30 rounded-lg blur-md transition-all duration-300 ${isCalendarButtonHovered ? 'opacity-100' : 'opacity-0'}`}></div>
              <Button 
  onClick={handleAddToGoogleCalendar}
  className="relative bg-white hover:bg-blue-50 text-indigo-600 hover:text-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 border-none"
  size="lg"
  disabled={isProcessing}
>
  {isProcessing ? (
    <div className="flex items-center gap-2">
      <Spinner className="h-5 w-5 text-indigo-600" />
      Processing...
    </div>
  ) : (
    <>
      <svg className={`h-5 w-5 transition-transform duration-300 ${isCalendarButtonHovered ? 'rotate-12' : 'rotate-0'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ... existing SVG ... */}
      </svg>
      Add to Google Calendar
      <ExternalLink className={`h-4 w-4 ml-1 transition-all duration-300 ${isCalendarButtonHovered ? 'translate-x-1 -translate-y-1' : 'translate-x-0 translate-y-0'}`} />
    </>
  )}
</Button>
            </div>
          </div>
        </div>

        {/* Controls with Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex gap-3 items-center">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">My Courses</h2>
              {!isLoading && filteredCourses.length > 0 && (
                <p className="text-slate-500 text-sm">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} {searchTerm && 'found'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAddCourseModalOpen(true)}
                onMouseEnter={() => setIsHoveringAddButton(true)}
                onMouseLeave={() => setIsHoveringAddButton(false)}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Add Course
              </Button>
            </div>
          </div>
        </div>
        
        {/* View toggle buttons */}
        <div className="flex mb-6 gap-2">
          <Button 
            variant={activeView === 'grid' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView('grid')}
            className={activeView === 'grid' ? "bg-indigo-600" : "text-slate-600"}
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" />
            </svg>
            Grid View
          </Button>
          <Button 
            variant={activeView === 'list' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView('list')}
            className={activeView === 'list' ? "bg-indigo-600" : "text-slate-600"}
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="18" width="18" height="2" rx="1" fill="currentColor" />
            </svg>
            List View
          </Button>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center border border-slate-100">
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-slate-600 font-medium">Loading your courses...</p>
              <p className="text-slate-400 text-sm mt-2">This should only take a moment</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="font-semibold text-lg">Unable to load courses</p>
            </div>
            <p className="text-red-600 ml-11">{error}</p>
            <Button 
              variant="outline" 
              className="mt-5 text-red-600 border-red-300 hover:bg-red-50 font-medium ml-11" 
              onClick={fetchCourses}
            >
              Try Again
            </Button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center border border-slate-100">
            {searchTerm ? (
              <>
                <div className="mb-6">
                  <div className="bg-slate-100 p-3 rounded-full inline-flex items-center justify-center">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-600 mb-4 font-medium">No courses match your search criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 border-slate-200 hover:border-slate-300 shadow-sm"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <div className="mb-6 relative">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-100 rounded-full opacity-70"></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-100 rounded-full opacity-70"></div>
                  <div className="relative z-10 bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-full inline-flex items-center justify-center mx-auto">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-3">Get started with your first course</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">Add your first course to begin organizing your academic schedule and tracking your progress.</p>
                <div className="relative inline-block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <Button 
                    onClick={() => setIsAddCourseModalOpen(true)} 
                    className="relative bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 group shadow-md hover:shadow-lg px-6 py-2.5"
                    onMouseEnter={() => setIsHoveringAddButton(true)}
                    onMouseLeave={() => setIsHoveringAddButton(false)}
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Create Your First Course
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : activeView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                onMouseEnter={() => setIsHoveringCourse(true)}
                onMouseLeave={() => setIsHoveringCourse(false)}
                onClick={() => handleCourseClick(course._id)}
                className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-pointer"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 transition-all duration-300">
                  <div className="h-3 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 text-slate-800">{course.courseName}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{course.courseDescription}</p>
                    
                    {/* Replaced completion bar with professor info and lecture details */}
                    <div className="space-y-3 mb-4">
                      {/* Professor name */}
                      <div className="flex items-center text-sm text-slate-600">
                        <User className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="font-medium">Professor:</span>
                        <span className="ml-2">{course.profName}</span>
                      </div>
                      
                      {/* Lecture times */}
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="font-medium">Schedule:</span>
                        <span className="ml-2 text-xs">{formatLectureTimes(course.times)}</span>
                      </div>
                      
                      {/* Lectures uploaded */}
                      <div className="flex items-center text-sm text-slate-600">
                        <Video className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="font-medium">Lectures:</span>
                        <span className="ml-2">{course.lecturesUploaded} uploaded</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 transition-colors group-hover:border-indigo-200"
                      variant="outline"
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredCourses.map((course) => (
              <div 
                key={course._id}
                onMouseEnter={() => setIsHoveringCourse(true)}
                onMouseLeave={() => setIsHoveringCourse(false)}
                onClick={() => handleCourseClick(course._id)}
                className="border-b border-slate-200 last:border-0 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {course.courseName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{course.courseName}</h3>
                      <div className="flex items-center text-sm text-slate-500">
                        <User className="h-3 w-3 mr-1 text-indigo-400" />
                        <span>Prof. {course.profName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Replaced progress bar with lecture info in list view */}
                  <div className="flex items-center w-64 space-x-2">
                    <div className="flex-1">
                      <div className="flex items-center text-xs text-slate-500 mb-1">
                        <Clock className="h-3 w-3 mr-1 text-indigo-400" />
                        <span className="truncate">{formatLectureTimes(course.times)}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Video className="h-3 w-3 mr-1 text-indigo-400" />
                        <span>{course.lecturesUploaded} lectures uploaded</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
      />
      
      {/* Add a CSS class for the background grid pattern */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0, 0, 100, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 100, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
