'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Book, Award, Building, ChevronDown, Upload, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FileUploader from "@/components/FileUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

// Sample data for demonstration
const upcomingQuizzes = [
  {
    id: "q1",
    title: "Quiz 1: Basic Concepts",
    date: "October 10, 2023",
    time: "10:00 AM",
    duration: "30 minutes",
    location: "Room 101, CS Building",
    lecturesCovered: "Lectures 1-3"
  }
];

const pastQuizzes = [
  {
    id: "pq1",
    title: "Preliminary Quiz",
    date: "September 20, 2023",
    score: "85%",
    file: null
  }
];

const upcomingTests = [
  {
    id: "t1",
    title: "Midterm Examination",
    date: "October 15, 2023",
    time: "2:00 PM",
    duration: "2 hours",
    location: "Main Hall, Building A",
    lecturesCovered: "Lectures 1-5"
  }
];

const pastTests = [
  {
    id: "pt1",
    title: "Readiness Assessment",
    date: "September 5, 2023",
    score: "92%",
    file: null
  }
];

const AssessmentSection: React.FC = () => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'quiz' | 'test'>('quiz');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  
  const handleUploadFile = (file: File) => {
    console.log("Assessment file uploaded:", file.name);
    toast.success("File Uploaded", {
      description: `${file.name} has been uploaded successfully.`,
      duration: 3000,
    });
    // In a real app, you would update the assessment record with the file
    setOpenUploadDialog(false);
  };

  const handleViewPastAssessment = () => {
    window.open('/assessment-viewer', '_blank');
    // In a real app, this would navigate to a PDF viewer component
  };

  return (
    <Tabs defaultValue="quizzes" className="animate-fade-in">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        <TabsTrigger value="tests">Tests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="quizzes" className="space-y-4">
        <h3 className="text-lg font-medium mb-3">Upcoming Quizzes</h3>
        {upcomingQuizzes.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming quizzes scheduled</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingQuizzes.map(quiz => (
              <Collapsible key={quiz.id} className="border rounded-lg overflow-hidden shadow-soft animate-slide-up">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/10 focus:outline-none">
                  <div>
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{quiz.date}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t bg-muted/5 px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.time} • {quiz.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span>Coverage: {quiz.lecturesCovered}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Past Quiz
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Upload Past Quiz</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FileUploader onFileUpload={handleUploadFile} />
                        </div>
                        <DialogClose asChild>
                          <Button className="w-full mt-2">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm">Prepare for Quiz</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
        
        <h3 className="text-lg font-medium mb-3 mt-6">Past Quizzes</h3>
        {pastQuizzes.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Book className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No past quiz records</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastQuizzes.map(quiz => (
              <Collapsible key={quiz.id} className="border rounded-lg overflow-hidden shadow-soft animate-slide-up">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/10 focus:outline-none">
                  <div>
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{quiz.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Award className="h-4 w-4" />
                        <span>{quiz.score}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t bg-muted/5 px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewPastAssessment()}
                    >
                      View File
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Solutions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Upload Quiz Solutions</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FileUploader onFileUpload={handleUploadFile} />
                        </div>
                        <DialogClose asChild>
                          <Button className="w-full mt-2">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="tests" className="space-y-4">
        <h3 className="text-lg font-medium mb-3">Upcoming Tests</h3>
        {upcomingTests.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming tests scheduled</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingTests.map(test => (
              <Collapsible key={test.id} className="border rounded-lg overflow-hidden shadow-soft animate-slide-up">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/10 focus:outline-none">
                  <div>
                    <h3 className="font-semibold">{test.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{test.date}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t bg-muted/5 px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{test.time} • {test.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{test.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span>Coverage: {test.lecturesCovered}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Past Test
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Upload Past Test</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FileUploader onFileUpload={handleUploadFile} />
                        </div>
                        <DialogClose asChild>
                          <Button className="w-full mt-2">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm">Prepare for Test</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
        
        <h3 className="text-lg font-medium mb-3 mt-6">Past Tests</h3>
        {pastTests.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="py-6">
                <Book className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No past test records</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastTests.map(test => (
              <Collapsible key={test.id} className="border rounded-lg overflow-hidden shadow-soft animate-slide-up">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/10 focus:outline-none">
                  <div>
                    <h3 className="font-semibold">{test.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{test.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Award className="h-4 w-4" />
                        <span>{test.score}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t bg-muted/5 px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewPastAssessment()}
                    >
                      View File
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Solutions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Upload Test Solutions</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FileUploader onFileUpload={handleUploadFile} />
                        </div>
                        <DialogClose asChild>
                          <Button className="w-full mt-2">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AssessmentSection;
