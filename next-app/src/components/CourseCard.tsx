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

/**
 * Helper function to parse course times and return structured session objects
 */
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

/**
 * Sorts sessions by proximity to the current day and time
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

/**
 * Gets the next upcoming lecture or session using the sortSessionsByProximity function
 */
const getNextLecture = (times: string[] = []): string | null => {
  if (!times || !Array.isArray(times) || times.length === 0) {
    return null;
  }
  
  // Parse all times
  const sessions = parseCourseTimes(times);
  
  // Filter to only include lectures
  const lectureSessions = sessions.filter(session => 
    session.type === 'Lecture' || session.type.toLowerCase() === 'lecture'
  );
  
  // If no lectures are found, return null
  if (lectureSessions.length === 0) {
    return null;
  }
  
  // Sort lectures by proximity to current time
  const sortedLectures = sortSessionsByProximity(lectureSessions);
  
  // Return the next upcoming lecture
  if (sortedLectures.length > 0) {
    const nextLecture = sortedLectures[0];
    // Format it back to the original format for compatibility with existing code
    return `lecture: ${nextLecture.day} ${nextLecture.time}`;
  }
  
  return null;
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
    
    return `${day} ${timeRange}`;
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
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                Next: {formatLectureTime(nextLecture)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                No scheduled sessions
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}