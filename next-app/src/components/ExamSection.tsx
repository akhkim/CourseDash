'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Book, Award } from 'lucide-react';

interface ExamProps {
  upcomingExams: Array<{
    id: string;
    title: string;
    date: string;
    duration: string;
    location?: string;
  }>;
  pastExams: Array<{
    id: string;
    title: string;
    date: string;
    score?: string;
  }>;
}

const ExamSection: React.FC<ExamProps> = ({ upcomingExams, pastExams }) => {
  return (
    <Tabs defaultValue="upcoming" className="animate-fade-in">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
        <TabsTrigger value="past">Past Exams</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="space-y-4">
        {upcomingExams.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming exams scheduled</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          upcomingExams.map(exam => (
            <Card key={exam.id} className="shadow-soft overflow-hidden animate-slide-up">
              <div className="h-1 bg-primary"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{exam.duration}</span>
                      </div>
                    </div>
                    {exam.location && (
                      <div className="mt-1 text-sm text-muted-foreground flex items-center space-x-1">
                        <Book className="h-4 w-4" />
                        <span>{exam.location}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm">Prepare</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
      
      <TabsContent value="past" className="space-y-4">
        {pastExams.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Book className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No past exam records</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pastExams.map(exam => (
            <Card key={exam.id} className="shadow-soft overflow-hidden animate-slide-up">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{exam.date}</span>
                      </div>
                      
                      {exam.score && (
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">{exam.score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ExamSection;
