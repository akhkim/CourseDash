'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabContainer, { TabPanel } from '@/components/TabContainer';
import FileUploader from '@/components/FileUploader';
import SummaryViewer from '@/components/SummaryViewer';
import Quiz from '@/components/Quiz';
import QuizParameters, { QuizParameters as QuizParametersType } from '@/components/QuizParameters';
import AssessmentSection from '@/components/AssessmentSection';
import ChatSection from '@/components/ChatSection';
import CourseSettingsModal from '@/components/CourseSettingsModal';
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  Award,
  Settings,
  Plus,
  ChevronDown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { authFetch } from '@/lib/utils/auth-fetch';
import { useAuth } from '@/lib/auth-context';
import { Progress } from "@/components/ui/progress";
import React from 'react';

// Interface for course data from API
interface CourseData {
  _id: string;
  courseName: string;
  courseDescription: string;
  profName: string;
  times: string[];
  createdAt: string;
  updatedAt: string;
  syllabusPDF?: string;
  lectureNotes?: Array<{
    id: string;
    title: string;
    fileName: string;
    date: string;
    fileType: string;
    summary: string;
    url?: string;
    fileContent?: string;
    files?: Array<{
      name: string;
      url: string;
    }>;
  }>;
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
  }>;
  assessments?: Array<{
    title: string;
    date: string;
    exactDate: string;
    location: string;
  }>;
}

// Props interface for the page component
interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

const parseCourseTimes = (times: string[] = []): Array<{ type: string; day: string; time: string }> => {
  const result: Array<{ type: string; day: string; time: string }> = [];

  if (!Array.isArray(times)) {
    console.error("Invalid input: times is not an array", times);
    return result;
  }

  for (const time of times) {
    try {
      console.log("Processing time:", time); // Debugging log

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

  console.log("Final parsed output:", result); // Debugging log
  return result;
};

/**
 * Sorts sessions by proximity to the current day and time
 * @param sessions Array of session objects with day and time properties
 * @returns Sorted array with closest sessions first
 */
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
    
    // Parse start times (assuming format like "9:00-10:00" or "9:00-10:00")
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

// Custom ChevronIcon component that rotates based on open state
const RotatingChevron: React.FC<{ className?: string }> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const parent = element.closest('[data-state]');
    if (!parent) return;
    
    // Set initial state
    setIsOpen(parent.getAttribute('data-state') === 'open');
    
    // Create a mutation observer to watch for attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-state'
        ) {
          setIsOpen(parent.getAttribute('data-state') === 'open');
        }
      });
    });
    
    // Start observing the parent element
    observer.observe(parent, { attributes: true });
    
    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <div ref={ref} className="flex items-center justify-center">
      <ChevronDown 
        className={`${className} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </div>
  );
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = params;
  const [activeTab, setActiveTab] = useState("summary");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showingQuiz, setShowingQuiz] = useState(false);
  const [quizParameters, setQuizParameters] = useState<QuizParametersType>({
    difficulty: 'easy',
    user_input: '',
    numberOfQuestions: 5
  });
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const deleteChatHistory = async () => {
      await fetch('/api/chat', {
        method: 'DELETE'
      });
    };
    deleteChatHistory()
  }, [courseData])

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await authFetch(`/api/courses/${id}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Course not found' : 'Failed to fetch course data');
        }
        
        const data = await response.json();
        console.log('Course data:', data);
        setCourseData(data.course);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchCourseData();
    }
  }, [id]);
  
  // Parse sessions from course times
  const sessions = courseData?.times ? sortSessionsByProximity(parseCourseTimes(courseData.times)) : [];
  
  // Extract next assessment (exam/quiz) if exists
  const nextAssessment = courseData?.assessments?.[0] || null;
  
  // Extract next assignment if exists
  const nextAssignment = courseData?.assignments?.[0] || null;

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
      duration: 3000,
    });
  };

  const handleRemoveCourse = async () => {
    try {
      const response = await authFetch(`/api/courses/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      toast({
        title: "Course Removed",
        description: `${courseData?.courseName || 'Course'} has been removed from your courses.`,
        duration: 3000,
      });
      
      router.push('/dashboard');
    } catch (err) {
      console.error('Error removing course:', err);
      toast({
        title: "Error",
        description: "Failed to remove course. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleScheduleChange = (newSchedule: Array<{day: string, time: string}>) => {
    console.log("New schedule:", newSchedule);
    toast({
      title: "Schedule Updated",
      description: "Your course schedule has been updated successfully.",
      duration: 3000,
    });
  };

  const handleStartQuiz = (parameters: QuizParametersType) => {
    setQuizParameters(parameters);
    setShowingQuiz(true);
  };

  const handleReturnFromQuiz = () => {
    setShowingQuiz(false);
  };

  const lectureForm = useForm({
    defaultValues: {
      date: "",
      file: null as File | null
    }
  });
  
  // Debug state to see if file is being set
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleAddLecture = async (data: any) => {
    try {
      console.log("Form data:", data);
      
      if (!data.file) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Start upload process
      setIsUploading(true);
      setUploadProgress(10);

      // Get title from file name first
      let title = data.file.name.split('.')[0];
      let summary = "File uploaded successfully.";

      // Create a FormData object
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('course', courseData ? courseData.courseName : "");
      formData.append('date', data.date);
      formData.append('user_id', JSON.parse(localStorage.getItem("auth_user")!).id);

      setUploadProgress(30);
      
      // Now send the FormData
      const result = await fetch('/api/lecture-title', {
        method: 'POST',
        body: formData  // This is correct - sending FormData
      });
      console.log("Upload result:", result);

      setUploadProgress(50);
      
      // Also upload the document to store the file in the database
      const documentResult = await fetch('/api/documents', {
        method: 'POST',
        body: formData  // This is correct - sending FormData
      });
      console.log("Document upload result:", documentResult);
      
      setUploadProgress(70);
      
      // Convert file to base64 for storage
      const fileReader = new FileReader();
      const fileContentPromise = new Promise<string>((resolve) => {
        fileReader.onload = (e) => {
          const base64Content = e.target?.result as string;
          resolve(base64Content);
        };
        fileReader.readAsDataURL(data.file);
      });
      
      const fileContent = await fileContentPromise;
      
      // Try to get a better title and summary from the lecture-title API
      try {
        const titleFormData = new FormData();
        titleFormData.append('file', data.file);
        
        const titleResponse = await fetch('/api/lecture-title', {
          method: 'POST',
          body: titleFormData
        });
        
        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          if (titleData.title) {
            title = titleData.title;
          }
          if (titleData.summary) {
            summary = titleData.summary;
          }
        }
      } catch (titleError) {
        console.warn("Could not extract better title/summary, using defaults instead", titleError);
      }
      
      setUploadProgress(80);
      
      // Create a lecture note object with the correct structure expected by the database
      const newLecture = {
        id: Date.now().toString(),
        title: title,
        fileName: data.file.name,
        date: data.date || new Date().toISOString().split('T')[0],
        fileType: data.file.type,
        summary: summary,
        files: [{
          name: data.file.name,
          url: fileContent // Store the base64 content as the URL
        }]
      };
      
      // Create the updated course data
      let updatedCourseData;
      if (courseData && courseData.lectureNotes) {
        updatedCourseData = {
          ...courseData,
          lectureNotes: [newLecture, ...courseData.lectureNotes]
        };
      } else if (courseData) {
        updatedCourseData = {
          ...courseData,
          lectureNotes: [newLecture]
        };
      }
      
      // Update the local state
      if (updatedCourseData) {
        setCourseData(updatedCourseData);
      }
      
      setUploadProgress(90);
      
      // Save the updated course data to the database using the existing endpoint
      if (updatedCourseData) {
        try {
          const updateResponse = await authFetch(`/api/courses/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCourseData),
          });
          
          if (!updateResponse.ok) {
            console.error('Failed to update lecture in database', await updateResponse.text());
            toast({
              title: "Warning",
              description: "Lecture was added locally but may not be saved to the database.",
              variant: "destructive",
              duration: 5000,
            });
          } else {
            console.log('Successfully updated lecture in database');
            // Refresh course data to ensure we have the latest structure from the server
            const refreshResponse = await authFetch(`/api/courses/${id}`);
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              setCourseData(refreshData.course);
            }
          }
        } catch (dbError) {
          console.error('Error updating database:', dbError);
          toast({
            title: "Warning",
            description: "Lecture was added locally but failed to save to the database.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      setUploadProgress(100);
      
      // Reset the form state
      lectureForm.reset();
      setSelectedFileName(null);
      
      // Display success toast
      toast({
        title: "Lecture Added",
        description: `${data.file.name} has been added to your lectures.`,
        duration: 3000,
      });

      // Close the dialog
      setDialogOpen(false);
    } catch (err) {
      console.error("Error uploading lecture:", err);
      toast({
        title: "Error",
        description: "Failed to upload lecture file. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Reset upload state
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const assignmentForm = useForm({
    defaultValues: {
      title: "",
      dueDate: "",
      file: null as File | null
    }
  });

  const handleAddAssignment = (data: any) => {
    console.log("New assignment:", data);
    toast({
      title: "Assignment Added",
      description: `${data.title} has been added to your assignments.`,
      duration: 3000,
    });
  };

  const assessmentForm = useForm({
    defaultValues: {
      type: "quiz",
      title: "",
      date: "",
      time: "",
      duration: "",
      location: "",
      lectureRange: "",
      file: null as File | null
    }
  });

  const handleAddAssessment = (data: any) => {
    console.log("New assessment:", data);
    toast({
      title: "Assessment Added",
      description: `${data.title} has been added to your assessments.`,
      duration: 3000,
    });
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    // This function can be implemented to handle quiz completion
    setShowingQuiz(false);
    toast({
      title: "Quiz Completed",
      description: `You scored ${score} out of ${totalQuestions}.`,
      duration: 3000,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pattern animate-fade-in">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex justify-center items-center">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-pattern animate-fade-in">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-3 animate-slide-right">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          <div className="bg-white rounded-lg shadow-soft border p-8 animate-fade-in animate-delay-200 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No course data
  if (!courseData) {
    return (
      <div className="min-h-screen bg-pattern animate-fade-in">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-3 animate-slide-right">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          <div className="bg-white rounded-lg shadow-soft border p-8 animate-fade-in animate-delay-200 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you're looking for couldn't be found.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        <div className="mb-4">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-3 animate-slide-right">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold mb-1">{courseData.courseName}</h1>
              <p className="text-muted-foreground text-sm">{courseData.courseDescription}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground animate-slide-up animate-delay-100">
              {sessions.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{sessions[0].day} {sessions[0].time}</span>
                </div>
              )}
              
              {courseData.profName && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{courseData.profName}</span>
                </div>
              )}
              
              <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1.5 group"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="h-4 w-4 group-hover:animate-[spin_3s_linear_infinite]" />
                <span>Course Settings</span>
              </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-soft border animate-fade-in animate-delay-200">
          <TabContainer
            tabs={[
              { label: "Summary", id: "summary" },
              { label: "Lectures", id: "lectures" },
              { label: "Assignments", id: "assignments" },
              { label: "Quiz", id: "quiz" },
              { label: "Assessments", id: "assessments" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            <TabPanel id="summary">
              <div className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="col-span-1 md:col-span-2 pl-4">
                    <h2 className="text-lg font-semibold mb-1 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Course Overview
                    </h2>
                    
                    <div className="h-[480px]">
                      <ChatSection course={courseData.courseName} />
                    </div>
                  </div>
                  
                  <div>
                    {nextAssessment && (
                      <div className="mb-3">
                        <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Next Exam
                        </h2>
                        <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                          <p className="font-medium">{nextAssessment.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(nextAssessment.exactDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">{nextAssessment.location}</p>
                        </div>
                      </div>
                    )}

                    {nextAssignment && (
                      <div className="mb-3">
                        <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Upcoming Assignment
                        </h2>
                        <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                          <p className="font-medium">{nextAssignment.title}</p>
                          <p className="text-xs mt-1">{nextAssignment.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Due: {nextAssignment.dueDate}</p>
                        </div>
                      </div>
                    )}
                    
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Sessions
                    </h2>
                    
                    <div className="space-y-2">
                      {sessions.length > 0 ? (
                        sessions.slice(0, 3).map((session, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-muted/10 mb-1 mr-1 mt-1">
                            <p className="font-medium">{session.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">{session.day}, {session.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 border rounded-lg bg-muted/10">
                          <p className="text-sm text-muted-foreground">No scheduled sessions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel id="lectures">
              <div className="p-1">
                <div className="flex justify-between items-center mb-4 pl-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Lecture Materials
                  </h2>
                  
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1.5 mr-4 transition-transform hover:scale-105">
                      <Plus className="h-4 w-4 transition-transform group-hover:rotate-90"/>
                      <span>Add Lecture</span>
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Lecture</DialogTitle>
                      </DialogHeader>
                      <Form {...lectureForm}>
                        <form onSubmit={lectureForm.handleSubmit(handleAddLecture)} className="space-y-4">
                          <FormField
                            control={lectureForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lecture Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="mb-4">
                            <FormLabel>Upload Lecture File</FormLabel>
                            <div className="mt-2">
                              <FileUploader onFileUpload={(file) => {
                                console.log("File selected:", file?.name || "No file");
                                lectureForm.setValue('file', file);
                                setSelectedFileName(file?.name || null);
                              }} />
                            </div>
                            {selectedFileName && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-primary">
                                  Selected file: {selectedFileName}
                                </span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    lectureForm.setValue('file', null);
                                    setSelectedFileName(null);
                                  }}
                                >
                                  Clear
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload PDF, DOCX, PPTX or TXT files
                            </p>
                          </div>
                          
                          {isUploading && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Uploading...</span>
                                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          )}
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline" disabled={isUploading}>Cancel</Button>
                            </DialogClose>
                            <Button 
                              type="submit"
                              disabled={!selectedFileName || isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                'Upload Lecture'
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {courseData.lectureNotes && courseData.lectureNotes.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.lectureNotes.map(summary => (
                      <Collapsible key={summary.id} className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 focus:outline-none group">
                          <div>
                            <h3 className="font-medium">{summary.title}</h3>
                            <p className="text-sm text-muted-foreground">{summary.date}</p>
                          </div>
                          <RotatingChevron className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-4 py-3 bg-muted/10">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded flex items-center justify-center bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">{summary.fileName}</p>
                                  <p className="text-xs text-muted-foreground">{summary.fileType} • {summary.date}</p>
                                </div>
                                <a 
                                  href={summary.files && summary.files.length > 0 
                                    ? summary.files[0].url 
                                    : summary.fileContent || summary.url} 
                                  download={summary.fileName}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    Download
                                  </Button>
                                </a>
                              </div>
                              <div className="mt-3">
                                <h4 className="text-sm font-medium mb-1">Summary</h4>
                                <p className="text-sm text-muted-foreground">{summary.summary}</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No lecture materials yet</p>
                    <p className="text-muted-foreground mt-1 mb-6">Click the Add Lecture button to upload materials</p>
                  </div>
                )}
              </div>
            </TabPanel>
            
            <TabPanel id="assignments">
              <div className="p-1">
                <div className="flex justify-between items-center mb-4 pl-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Assignments
                  </h2>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-1.5 mr-4 transition-transform hover:scale-105">
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90"/>
                        <span>Add Assignment</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Assignment</DialogTitle>
                      </DialogHeader>
                      <Form {...assignmentForm}>
                        <form onSubmit={assignmentForm.handleSubmit(handleAddAssignment)} className="space-y-4">
                          <FormField
                            control={assignmentForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assignment Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter assignment title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assignmentForm.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="mb-4">
                            <FormLabel>Upload Assignment File</FormLabel>
                            <div className="mt-2">
                              <FileUploader onFileUpload={(file) => {
                                assignmentForm.setValue('file', file);
                              }} />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add Assignment</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {courseData.assignments && courseData.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.assignments.map(assignment => (
                      <Collapsible key={assignment.id} className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 focus:outline-none group">
                          <div>
                            <h3 className="font-medium">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                          </div>
                          <RotatingChevron className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-4 py-3 bg-muted/10">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{assignment.description}</p>
                            <div className="mt-4 flex justify-end">
                              <Button size="sm">Upload Submission</Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No assignments yet</p>
                    <p className="text-muted-foreground mt-1 mb-6">Click the Add Assignment button to create assignments</p>
                  </div>
                )}
              </div>
            </TabPanel>
            
            <TabPanel id="quiz">
              <div className="p-1">
                <h2 className="text-xl font-semibold mb-4 flex items-center pl-4">
                  <BrainCircuit className="h-5 w-5 mr-2" />
                  Practice Quiz
                </h2>
                
                {showingQuiz ? (
                  <Quiz 
                    parameters={quizParameters}
                    onComplete={handleQuizComplete}
                    onReturn={handleReturnFromQuiz}
                    courseData={courseData}
                  />
                ) : (
                  <div className="max-w-xl mx-auto">
                    <QuizParameters onStartQuiz={handleStartQuiz} />
                  </div>
                )}
              </div>
            </TabPanel>
            
            <TabPanel id="assessments">
              <div className="p-1">
                <div className="flex justify-between items-center mb-4 pl-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Assessments
                  </h2>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-1.5 mr-4 transition-transform hover:scale-105">
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90"/>
                        <span>Add Assessment</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Assessment</DialogTitle>
                      </DialogHeader>
                      <Form {...assessmentForm}>
                        <form onSubmit={assessmentForm.handleSubmit(handleAddAssessment)} className="space-y-4">
                          <FormField
                            control={assessmentForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assessment Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="test">Test</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter assessment title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="60" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter location" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={assessmentForm.control}
                            name="lectureRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lecture Range</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Lectures 1-5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="mb-4">
                            <FormLabel>Upload File (Optional)</FormLabel>
                            <div className="mt-2">
                              <FileUploader onFileUpload={(file) => {
                                assessmentForm.setValue('file', file);
                              }} />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add Assessment</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <AssessmentSection />
              </div>
            </TabPanel>
          </TabContainer>
        </div>
      </main>
      
      {showSettingsDialog && (
        <CourseSettingsModal
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          course={courseData}
          onRemoveCourse={handleRemoveCourse}
          onScheduleChange={handleScheduleChange}
          onCourseUpdate={async (updatedCourse) => {
            try {
              // Update the course in the database
              const response = await authFetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCourse),
              });
              
              if (!response.ok) {
                throw new Error('Failed to update course');
              }
              
              const data = await response.json();
              console.log('Course updated:', data);
              
              // Update the local state
              setCourseData(data.course);
              
              toast({
                title: "Course Updated",
                description: "Course details have been updated successfully.",
                duration: 3000,
              });
            } catch (error) {
              console.error('Error updating course:', error);
              toast({
                title: "Error",
                description: "Failed to update course. Please try again.",
                variant: "destructive",
                duration: 3000,
              });
            }
          }}
        />
      )}
    </div>
  );
}
