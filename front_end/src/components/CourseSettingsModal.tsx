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
import { Trash2, CalendarClock, FileUp } from 'lucide-react';
import TimeSelector, { TimeSlot } from './TimeSelector';

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onRemoveCourse: () => void;
  onScheduleChange: (newSchedule: TimeSlot[]) => void;
  onCourseUpdate: (updatedCourse: any) => void;
}

const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
  isOpen,
  onClose,
  course,
  onRemoveCourse,
  onScheduleChange,
  onCourseUpdate
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [courseName, setCourseName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [syllabus, setSyllabus] = useState<File | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  // Parse current schedule and initialize form values
  useEffect(() => {
    if (course) {
      setCourseName(course.title || '');
      setInstructor(course.instructor || '');
      
      // Initialize time slots from course data
      const initialTimeSlots: TimeSlot[] = [];
      
      // Add lecture times
      if (course.lectureTimes?.length) {
        initialTimeSlots.push(
          ...course.lectureTimes.map((slot: any) => ({
            ...slot,
            type: 'lecture' as const
          }))
        );
      }
      
      // Add tutorial times
      if (course.tutorialTimes?.length) {
        initialTimeSlots.push(
          ...course.tutorialTimes.map((slot: any) => ({
            ...slot,
            type: 'tutorial' as const
          }))
        );
      }
      
      // Add office hour times
      if (course.officeHourTimes?.length) {
        initialTimeSlots.push(
          ...course.officeHourTimes.map((slot: any) => ({
            ...slot,
            type: 'office_hour' as const
          }))
        );
      }
      
      // Add study session times
      if (course.studySessionTimes?.length) {
        initialTimeSlots.push(
          ...course.studySessionTimes.map((slot: any) => ({
            ...slot,
            type: 'study_session' as const
          }))
        );
      }
      
      setTimeSlots(initialTimeSlots);
    }
  }, [course]);
  
  const handleSyllabusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSyllabus(e.target.files[0]);
    }
  };
  
  const handleScheduleUpdate = () => {
    onScheduleChange(timeSlots);
  };
  
  const handleGeneralUpdate = () => {
    // Create updated course object
    const updatedCourse = {
      ...course,
      title: courseName,
      instructor: instructor,
      hasSyllabus: !!syllabus
    };
    
    onCourseUpdate(updatedCourse);
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
                <Input 
                  id="courseName"
                  value={courseName} 
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input 
                  id="instructor"
                  value={instructor} 
                  onChange={(e) => setInstructor(e.target.value)}
                />
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
                        {syllabus ? syllabus.name : course.hasSyllabus ? "Replace syllabus" : "Upload PDF syllabus"}
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
                  className="w-full justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Course
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
            <Button variant="destructive" onClick={handleConfirmRemove}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CourseSettingsModal;
