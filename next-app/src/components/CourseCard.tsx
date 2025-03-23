'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Calendar, FileText, User, BookOpen, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  description: string;
  profName?: string;
  times?: string[];
  createdAt: string;
}

// Helper function to get the next lecture time
const getNextLecture = (times: string[] = []): string | null => {
  // Log the times array for debugging
  console.log("Times array:", times);
  
  if (!times || !Array.isArray(times) || times.length === 0) {
    console.log("No times available");
    return null;
  }
  
  const now = new Date();
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
  const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Filter for lecture times
  const lectureTimes = times.filter(time => time && typeof time === 'string' && time.startsWith('lecture:'));
  console.log("Filtered lecture times:", lectureTimes);
  
  if (lectureTimes.length === 0) return null;
  
  // Parse times to find the next one
  const parsedTimes = lectureTimes.map(time => {
    try {
      const parts = time.split(':');
      if (parts.length < 2) return null;
      
      const timeParts = parts[1].trim().split(' ');
      if (timeParts.length < 2) return null;
      
      const day = timeParts[0];
      const timeRange = timeParts[1];
      const [startTime] = timeRange.split('-');
      
      return {
        day,
        time: startTime,
        original: time
      };
    } catch (e) {
      console.error("Error parsing time:", time, e);
      return null;
    }
  }).filter(Boolean); // Remove failed parses

  if (parsedTimes.length === 0) return null;
  
  // First, check if there's a lecture later today
  const todaysLectures = parsedTimes.filter(lecture => lecture.day === currentDay && lecture.time > currentTime);
  if (todaysLectures.length > 0) {
    // Sort by time to get the next one today
    todaysLectures.sort((a, b) => a.time.localeCompare(b.time));
    return todaysLectures[0].original;
  }
  
  // If no lectures later today, find the next lecture based on day of week
  const dayOrder = {'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6};
  const currentDayIndex = dayOrder[currentDay];
  
  // Group lectures by day
  const lecturesByDay = {};
  parsedTimes.forEach(lecture => {
    if (!lecturesByDay[lecture.day]) {
      lecturesByDay[lecture.day] = [];
    }
    lecturesByDay[lecture.day].push(lecture);
  });
  
  // Find the next day with lectures
  const daysWithLectures = Object.keys(lecturesByDay);
  if (daysWithLectures.length === 0) return null;
  
  // Sort days by their distance from current day
  daysWithLectures.sort((a, b) => {
    const aDist = (dayOrder[a] - currentDayIndex + 7) % 7;
    const bDist = (dayOrder[b] - currentDayIndex + 7) % 7;
    return aDist - bDist;
  });
  
  // Get the earliest lecture from the next day with lectures
  // Skip today as we've already checked it
  const nextLectureDay = daysWithLectures.find(day => day !== currentDay) || daysWithLectures[0];
  const nextDayLectures = lecturesByDay[nextLectureDay];
  
  // Sort lectures for that day by time
  nextDayLectures.sort((a, b) => a.time.localeCompare(b.time));
  
  return nextDayLectures[0].original;
};

// Helper function to format the lecture time for display
const formatLectureTime = (lectureTime: string): string => {
  try {
    if (!lectureTime || typeof lectureTime !== 'string') return 'Time not available';
    
    // Extract day and time range
    const parts = lectureTime.split(':');
    if (parts.length < 2) return lectureTime;
    
    const timeParts = parts[1].trim().split(' ');
    if (timeParts.length < 2) return lectureTime;
    
    const day = timeParts[0];
    const timeRange = timeParts[1];
    
    return `${day} ${timeRange}:00`;
  } catch (e) {
    console.error("Error formatting lecture time:", e);
    return lectureTime;
  }
};

export function CourseCard({
  course,
  onClick
}: {
  course: Course;
  onClick: () => void;
}) {
  const router = useRouter();
  const nextLecture = getNextLecture(course.times);
  console.log("Next lecture for course", course.name, ":", nextLecture);
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:bg-accent/20 hover:scale-105 hover:shadow-lg transform cursor-pointer border-t-4 border-t-blue-500" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1">{course.name}</CardTitle>
        <CardDescription className="line-clamp-2 pt-1">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex flex-col gap-3">
          {course.profName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                {course.profName}
              </span>
            </div>
          )}
          
          {nextLecture ? (
            <div className="flex items-center gapborder-t-4 border-t-blue-500-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                Next: {formatLectureTime(nextLecture)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                No scheduled lectures
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}