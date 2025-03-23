'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimeSlot = {
  day: string;
  time: string;
  type: 'lecture' | 'tutorial' | 'office_hour' | 'study_session';
};

interface TimeSelectorProps {
  label: string;
  onChange: (selectedTimes: TimeSlot[]) => void;
  initialSelected?: TimeSlot[];
  showTypeSelector?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  label, 
  onChange, 
  initialSelected = [],
  showTypeSelector = true
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Change to hourly time slots from 8:00 to 20:00
  const times = [
    '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(initialSelected);
  const [selectedType, setSelectedType] = useState<TimeSlot['type']>('lecture');
  
  useEffect(() => {
    if (initialSelected && initialSelected.length > 0) {
      setSelectedSlots(initialSelected);
      onChange(initialSelected);
    }
  }, [initialSelected, onChange]);
  
  const toggleTimeSlot = (day: string, time: string) => {
    const slotIndex = selectedSlots.findIndex(
      slot => slot.day === day && slot.time === time
    );
    
    let newSelectedSlots;
    
    if (slotIndex === -1) {
      // Add the time slot with selected type
      newSelectedSlots = [...selectedSlots, { day, time, type: selectedType }];
    } else {
      // Remove the time slot
      newSelectedSlots = selectedSlots.filter((_, index) => index !== slotIndex);
    }
    
    setSelectedSlots(newSelectedSlots);
    onChange(newSelectedSlots);
  };
  
  const isSelected = (day: string, time: string) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  const getSlotType = (day: string, time: string) => {
    const slot = selectedSlots.find(slot => slot.day === day && slot.time === time);
    return slot?.type || 'lecture';
  };

  const getSlotColor = (day: string, time: string) => {
    const type = getSlotType(day, time);
    switch (type) {
      case 'lecture':
        return 'bg-primary/90 text-white hover:bg-primary';
      case 'tutorial':
        return 'bg-blue-500/90 text-white hover:bg-blue-500';
      case 'office_hour':
        return 'bg-amber-500/90 text-white hover:bg-amber-500';
      case 'study_session':
        return 'bg-emerald-500/90 text-white hover:bg-emerald-500';
      default:
        return 'bg-primary/90 text-white hover:bg-primary';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {showTypeSelector && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="slotType" className="text-sm">Type:</Label>
            <Select value={selectedType} onValueChange={(value: TimeSlot['type']) => setSelectedType(value)}>
              <SelectTrigger id="slotType" className="w-[140px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lecture">Lecture</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="office_hour">Office Hour</SelectItem>
                <SelectItem value="study_session">Study Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
            <span>Lecture</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Tutorial</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
            <span>Office Hour</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
            <span>Study Session</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-soft border overflow-hidden">
        <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
          <div className="min-w-[480px]"> 
            {/* Day header */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 font-medium text-muted-foreground"></div>
              {days.map(day => (
                <div key={day} className="p-2 font-medium text-center text-xs">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Time slots */}
            {times.map(time => (
              <div key={time} className="grid grid-cols-8 border-b last:border-0">
                <div className="p-2 text-xs text-muted-foreground border-r">
                  {time}
                </div>
                {days.map(day => (
                  <div key={`${day}-${time}`} className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => toggleTimeSlot(day, time)}
                      className={cn(
                        "w-full h-8 rounded transition-all", // Increased height from h-4 to h-8
                        isSelected(day, time)
                          ? getSlotColor(day, time)
                          : "hover:bg-primary/10"
                      )}
                      aria-pressed={isSelected(day, time)}
                    >
                      <span className="sr-only">
                        {isSelected(day, time) ? `Remove ${day} at ${time}` : `Add ${day} at ${time}`}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;
