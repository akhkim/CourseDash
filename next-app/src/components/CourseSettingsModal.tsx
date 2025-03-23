'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, CalendarClock, FileUp, X } from 'lucide-react';
import TimeSelector, { TimeSlot } from './TimeSelector';

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: any;
  onRemoveCourse: () => void;
  onScheduleChange: (newSchedule: TimeSlot[]) => void;
  onCourseUpdate?: (updatedCourse: any) => void;
  currentSchedule?: TimeSlot[];
}

const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
  isOpen,
  onClose,
  course = {},
  onRemoveCourse,
  onScheduleChange,
  onCourseUpdate,
  currentSchedule = []
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(currentSchedule || []);
  const [courseName, setCourseName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [syllabus, setSyllabus] = useState<File | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  // Parse current schedule and initialize form values
  useEffect(() => {
    if (course) {
      setCourseName(course.title || course.courseName || '');
      setInstructor(course.instructor || course.profName || '');
      
      // Always start with empty time slots
      setTimeSlots([]);
    }
  }, [course]);
  
  const handleSyllabusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSyllabus(e.target.files[0]);
    }
  };
  
  const convertTimeToMinutes = (time: string): number => {
    if (!time) return 0; // Handle undefined or empty time strings
    
    // Handle invalid format
    if (!time.includes(':')) return 0;
    
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const handleScheduleUpdate = async () => {
    try {
      // Skip update if no time slots are selected
      if (!timeSlots || timeSlots.length === 0) {
        onClose();
        return;
      }
      
      // Group timeslots by type and day
      const timeSlotsByTypeAndDay: { [key: string]: { startTime: string; endTime: string }[] } = {};
      
      timeSlots.forEach(slot => {
        // Skip invalid slots
        if (!slot || !slot.type || !slot.day) return;
        
        const key = `${slot.type}:${slot.day}`;
        if (!timeSlotsByTypeAndDay[key]) {
          timeSlotsByTypeAndDay[key] = [];
        }
        
        // Use the time as both start and end time (1-hour blocks)
        const hourTime = slot.time;
        // Calculate end time by adding 1 hour to the start time
        const [hour, minute] = hourTime.split(':').map(Number);
        const endHour = (hour + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        timeSlotsByTypeAndDay[key].push({
          startTime: hourTime,
          endTime: endTime 
        });
      });
      
      // Combine contiguous time blocks and format
      const formattedTimes: string[] = [];
      
      Object.entries(timeSlotsByTypeAndDay).forEach(([key, slots]) => {
        const [type, day] = key.split(':');
        
        // Skip if no slots for this type/day
        if (slots.length === 0) return;
        
        // Sort by start time
        const sortedSlots = [...slots].sort((a, b) => {
          return convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime);
        });
        
        // Combine contiguous blocks
        const mergedSlots = [];
        
        // Handle case where no slots are present
        if (sortedSlots.length === 0) return;
        
        // Make sure we have a valid first slot
        if (!sortedSlots[0] || !sortedSlots[0].startTime || !sortedSlots[0].endTime) return;
        
        let currentBlock = { ...sortedSlots[0] };
        
        for (let i = 1; i < sortedSlots.length; i++) {
          const currentSlot = sortedSlots[i];
          
          // Skip invalid slots
          if (!currentSlot || !currentSlot.startTime || !currentSlot.endTime) continue;
          
          // If this slot starts at or before the current block ends, extend the block
          if (convertTimeToMinutes(currentSlot.startTime) <= convertTimeToMinutes(currentBlock.endTime)) {
            // Take the later end time
            if (convertTimeToMinutes(currentSlot.endTime) > convertTimeToMinutes(currentBlock.endTime)) {
              currentBlock.endTime = currentSlot.endTime;
            }
          } else {
            // This is a new block
            mergedSlots.push(currentBlock);
            currentBlock = { ...currentSlot };
          }
        }
        
        // Add the last block
        mergedSlots.push(currentBlock);
        
        // Format each merged block
        mergedSlots.forEach(slot => {
          formattedTimes.push(`${type}: ${day} ${slot.startTime}-${slot.endTime}`);
        });
      });
      
      // Create updated course object with new schedule
      const updatedCourse = {
        ...course,
        times: formattedTimes
      };
      
      if (onCourseUpdate) {
        onCourseUpdate(updatedCourse);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };
  
  const handleGeneralUpdate = async () => {
    if (!onCourseUpdate) return;
    
    try {
      // Create updated course object
      const updatedCourse = {
        ...course,
        title: courseName,
        courseName: courseName, // Support both naming conventions
        instructor: instructor,
        profName: instructor, // Support both naming conventions
      };
      
      // Handle syllabus file if present
      if (syllabus) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
        });
        
        reader.readAsDataURL(syllabus);
        updatedCourse.syllabusPDF = await base64Promise;
      } else if (course?.syllabusPDF) {
        // Keep existing syllabus if no new one was uploaded
        updatedCourse.syllabusPDF = course.syllabusPDF;
      }
      
      onCourseUpdate(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };
  
  const handleSave = () => {
    if (activeTab === 'general') {
      handleGeneralUpdate();
    } else {
      handleScheduleUpdate();
    }
    onClose();
  };

  const handleConfirmRemove = () => {
    onRemoveCourse();
    setShowRemoveConfirmation(false);
    onClose();
  };

  // Custom style for input wrappers
  const inputWrapperStyle = {
    position: 'relative',
    width: '100%'
  } as React.CSSProperties;

  // Custom style for input elements to make them appear smaller inside their containers
  const innerInputStyle = {
    width: 'calc(100% - 16px)',
    margin: '4px 8px',
    height: 'calc(100% - 8px)',
    position: 'absolute',
    top: '0',
    left: '0',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    boxShadow: 'none'
  } as React.CSSProperties;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Course Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <div className="max-h-[600px] overflow-y-auto">
            <TabsContent value="general" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <div style={inputWrapperStyle}>
                  <Input 
                    id="courseName"
                    value={courseName} 
                    onChange={(e) => setCourseName(e.target.value)}
                    style={innerInputStyle}
                    className="focus:ring-0"
                  />
                  <div className="w-full h-10 rounded-md border border-input opacity-100 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <div style={inputWrapperStyle}>
                  <Input 
                    id="instructor"
                    value={instructor} 
                    onChange={(e) => setInstructor(e.target.value)}
                    style={innerInputStyle}
                    className="focus:ring-0"
                  />
                  <div className="w-full h-10 rounded-md border border-input opacity-100 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="syllabus">Upload Syllabus (Optional)</Label>
                <div className="flex items-center space-x-4">
                  <label 
                    htmlFor="syllabus"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-muted rounded-md p-6 w-full hover:border-primary/50 transition-colors animate-fade-in"
                  >
                    <div className="text-center">
                      <FileUp className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        {syllabus 
                          ? syllabus.name 
                          : (course?.hasSyllabus || course?.syllabusPDF) 
                            ? "Replace syllabus" 
                            : "Upload PDF syllabus"
                        }
                      </p>
                    </div>
                    <input
                      id="syllabus"
                      type="file"
                      accept=".pdf"
                      onChange={handleSyllabusChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRemoveConfirmation(true)}
                  className="w-full justify-center group hover:bg-destructive/90"
                >
                  <div className="relative w-5 h-5 mr-2 flex items-center justify-center">
                    {/* Animated X icon */}
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      {/* First diagonal line of X */}
                      <div className="absolute h-[2px] w-0 group-hover:w-full bg-current rounded-full 
                                    transform rotate-45 origin-center transition-all duration-300"></div>
                      
                      {/* Second diagonal line of X */}
                      <div className="absolute h-[2px] w-0 group-hover:w-full bg-current rounded-full 
                                    transform -rotate-45 origin-center transition-all duration-300 delay-100"></div>
                    </div>
                    
                    {/* Circle that expands on hover */}
                    <div className="absolute w-full h-full rounded-full bg-current opacity-0 group-hover:opacity-10 
                                  transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                    
                    {/* Outer pulsing effect */}
                    <div className="absolute w-full h-full rounded-full border-2 border-current opacity-0
                                  group-hover:opacity-20 group-hover:animate-pulse"></div>
                  </div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Remove Course</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CalendarClock className="h-4 w-4" />
                <span className="text-sm">Update your course schedule</span>
              </div>
              
              <TimeSelector 
                label="Course Schedule" 
                onChange={setTimeSlots}
                initialSelected={timeSlots}
              />
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Confirmation Dialog */}
      <Dialog open={showRemoveConfirmation} onOpenChange={setShowRemoveConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to remove "{courseName}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveConfirmation(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmRemove} className="group hover:bg-destructive/90">
              <div className="relative w-5 h-5 mr-2 flex items-center justify-center">
                {/* Animated X icon */}
                <div className="relative w-4 h-4 flex items-center justify-center">
                  {/* First diagonal line of X */}
                  <div className="absolute h-[2px] w-0 group-hover:w-full bg-current rounded-full 
                                transform rotate-45 origin-center transition-all duration-300"></div>
                  
                  {/* Second diagonal line of X */}
                  <div className="absolute h-[2px] w-0 group-hover:w-full bg-current rounded-full 
                                transform -rotate-45 origin-center transition-all duration-300 delay-100"></div>
                </div>
                
                {/* Circle that expands on hover */}
                <div className="absolute w-full h-full rounded-full bg-current opacity-0 group-hover:opacity-10 
                              transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                
                {/* Outer pulsing effect */}
                <div className="absolute w-full h-full rounded-full border-2 border-current opacity-0
                              group-hover:opacity-20 group-hover:animate-pulse"></div>
              </div>
              <span className="group-hover:tracking-wider transition-all duration-300">Remove Course</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CourseSettingsModal;