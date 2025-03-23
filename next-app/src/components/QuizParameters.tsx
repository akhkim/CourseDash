'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Book, BrainCircuit } from 'lucide-react';

interface QuizParametersProps {
  onStartQuiz: (parameters: QuizParameters) => void;
}

export interface QuizParameters {
  difficulty: 'easy' | 'medium' | 'hard';
  fromLecture: number;
  toLecture: number;
  numberOfQuestions: number;
}

const QuizParameters: React.FC<QuizParametersProps> = ({ onStartQuiz }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [fromLecture, setFromLecture] = useState(1);
  const [toLecture, setToLecture] = useState(5);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const maxLectures = 10; // You can adjust this based on your course data
  const maxQuestions = 30; // Maximum number of questions
  
  const handleFromLectureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setFromLecture(Math.min(Math.max(value, 1), toLecture));
  };
  
  const handleToLectureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setToLecture(Math.min(Math.max(value, fromLecture), maxLectures));
  };
  
  const handleStart = () => {
    onStartQuiz({
      difficulty,
      fromLecture,
      toLecture,
      numberOfQuestions
    });
  };
  
  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2" />
          Quiz Parameters
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Select Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
            >
              <SelectTrigger id="difficulty" className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Easy
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    Hard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Lecture Coverage</Label>
            <div className="flex items-center space-x-2">
              <div className="w-full">
                <Label htmlFor="fromLecture" className="text-xs text-muted-foreground">From</Label>
                <Input 
                  id="fromLecture"
                  type="number"
                  min={1}
                  max={toLecture}
                  value={fromLecture}
                  onChange={handleFromLectureChange}
                />
              </div>
              <div className="w-full">
                <Label htmlFor="toLecture" className="text-xs text-muted-foreground">To</Label>
                <Input 
                  id="toLecture"
                  type="number"
                  min={fromLecture}
                  max={maxLectures}
                  value={toLecture}
                  onChange={handleToLectureChange}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="numberOfQuestions">Number of Questions</Label>
              <span className="text-sm text-muted-foreground">
                {numberOfQuestions} questions
              </span>
            </div>
            
            <Slider
              id="numberOfQuestions"
              defaultValue={[10]}
              max={maxQuestions}
              min={5}
              step={1}
              value={[numberOfQuestions]}
              onValueChange={(value) => setNumberOfQuestions(value[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>{maxQuestions}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleStart} className="w-full">
              Start Quiz
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizParameters;
