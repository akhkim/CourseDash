'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import TimeSelector, { TimeSlot } from './TimeSelector';
import { FileUp } from 'lucide-react';
import { authFetch } from '@/lib/utils/auth-fetch';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (courseData: any) => void;
}

interface TimeSlotData {
  startTime: string;
  endTime: string;
}

interface TimeSlotsByTypeAndDay {
  [key: string]: TimeSlotData[];
}

const convertTimeToMinutes = (time: string): number => {
  if (!time) return 0; // Handle undefined or empty time strings
  
  // Handle invalid format
  if (!time.includes(':')) return 0;
  
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onAddCourse }) => {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [syllabus, setSyllabus] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSyllabusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSyllabus(e.target.files[0]);
    }
  };
  
  const handleSubmit = async () => {
    if (!courseName.trim()) {
      setError('Course name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Group timeslots by type and day with proper typing
      const timeSlotsByTypeAndDay: TimeSlotsByTypeAndDay = {};
      
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
      
      // Combine contiguous time blocks and format with explicit typing
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
      
      // Create base course data object
      const courseData = {
        courseName,
        courseDescription: description,
        profName: instructor,
        times: formattedTimes,
        // We'll handle the file separately
        syllabusPDF: '',
        lectureNotes: []
      };
      
      // Let's convert the syllabus file to base64 if it exists
      if (syllabus) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
        });
        
        reader.readAsDataURL(syllabus);
        courseData.syllabusPDF = await base64Promise;
      }
      
      // Pass the courseData to parent component instead of making the API call
      onAddCourse(courseData);
      
      // Reset form
      setCourseName('');
      setDescription('');
      setInstructor('');
      setTimeSlots([]);
      setSyllabus(null);
      setError('');
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error preparing course data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Enter the details for your new course.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="grid gap-6 py-4 px-1">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name <span className="text-red-500">*</span></Label>
              <Input
                id="courseName"
                placeholder="e.g., Introduction to Computer Science"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="animate-fade-in"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                placeholder="e.g., Professor Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="animate-fade-in"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description of the course..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 animate-fade-in"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="syllabus">Syllabus (Optional)</Label>
              <div className="flex items-center space-x-4">
                <label 
                  htmlFor="syllabus"
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-muted rounded-md p-6 w-full hover:border-primary/50 transition-colors animate-fade-in"
                >
                  <div className="text-center">
                    <FileUp className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {syllabus ? syllabus.name : "Upload PDF syllabus"}
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
            
            <TimeSelector 
              label="Course Schedule" 
              onChange={setTimeSlots} 
            />
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!courseName.trim() || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseModal;
