'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle, BrainCircuit, Award, Clock, ArrowLeft, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { QuizParameters } from './QuizParameters';

interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer';
  lectureNumber?: number;
}

interface QuizProps {
  questions?: QuizQuestion[];
  parameters: QuizParameters;
  onComplete?: (score: number, totalQuestions: number) => void;
  onReturn: () => void;
}

// Mock questions for different difficulty levels
const allQuestions: QuizQuestion[] = [
  
];

const Quiz: React.FC<QuizProps> = ({ 
  parameters, 
  onComplete = () => {}, 
  onReturn,
  questions: customQuestions
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // If custom questions are provided, use them
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
      return;
    }
    
    // Otherwise, filter questions based on parameters
    const filteredByLecture = allQuestions.filter(
      q => q.lectureNumber
    );
    
    // Further filter by difficulty
    let difficultyFiltered: QuizQuestion[];
    switch (parameters.difficulty) {
      case 'easy':
        difficultyFiltered = filteredByLecture.filter(q => q.type === 'multiple-choice');
        break;
      case 'medium':
        difficultyFiltered = filteredByLecture.filter(q => q.type === 'short-answer');
        break;
      case 'hard':
        difficultyFiltered = filteredByLecture.filter(q => q.type === 'long-answer');
        break;
      default:
        difficultyFiltered = filteredByLecture;
    }
    
    // If no questions match the criteria, fall back to a default set
    if (difficultyFiltered.length === 0) {
      // Just use all questions that match the lecture range
      difficultyFiltered = filteredByLecture;
    }
    
    // Limit to a reasonable number of questions
    const selected = difficultyFiltered.slice(0, 5);
    setQuestions(selected);
  }, [parameters, customQuestions]);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!isAnswered) {
      setSelectedOption(optionIndex);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextAnswer(text);
    
    // Count words for medium difficulty questions
    if (questions[currentQuestion]?.type === 'short-answer') {
      const words = text.trim().split(/\s+/);
      setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
    }
  };
  
  const handleCheckAnswer = () => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.type === 'multiple-choice') {
      if (selectedOption === null) return;
      
      setIsAnswered(true);
      if (selectedOption === currentQ.correctAnswer) {
        setScore(score + 1);
      }
    } else {
      if (textAnswer.trim() === '') return;
      
      // For medium difficulty, check that answer doesn't exceed 5 words
      if (currentQ.type === 'short-answer' && wordCount > 5) {
        return;
      }
      
      setIsAnswered(true);
      
      // For text answers, check if key terms are included
      // This is a simple implementation - in real app, you'd use more sophisticated methods
      const correctAnswerStr = currentQ.correctAnswer as string;
      const keyTerms = correctAnswerStr.split(' ');
      
      let matches = 0;
      keyTerms.forEach(term => {
        if (textAnswer.toLowerCase().includes(term.toLowerCase())) {
          matches++;
        }
      });
      
      // If more than 60% of key terms are found, count it as correct
      if (matches / keyTerms.length > 0.6) {
        setScore(score + 1);
      }
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setTextAnswer("");
      setIsAnswered(false);
      setWordCount(0);
    } else {
      setIsCompleted(true);
      onComplete(score + (isAnswered && (
        (questions[currentQuestion].type === 'multiple-choice' && selectedOption === questions[currentQuestion].correctAnswer) || 
        (questions[currentQuestion].type !== 'multiple-choice' && textAnswer.includes(questions[currentQuestion].correctAnswer as string))
      ) ? 1 : 0), questions.length);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setTextAnswer("");
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setWordCount(0);
  };
  
  const getDifficultyColor = () => {
    switch (parameters.difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };
  
  const getDifficultyTitle = () => {
    switch (parameters.difficulty) {
      case 'easy': return 'Basic Concepts';
      case 'medium': return 'Intermediate Application';
      case 'hard': return 'Advanced Analysis';
      default: return 'Quiz';
    }
  };

  if (isCompleted) {
    const percentage = (score / questions.length) * 100;
    const isPerfect = percentage === 100;
    
    return (
      <Card className="shadow-soft animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isPerfect ? 'bg-green-100' : 'bg-primary/10'} mb-6`}>
            {isPerfect ? (
              <Award className="h-8 w-8 text-green-500" />
            ) : (
              <Check className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-2">
            You scored {score} out of {questions.length}
          </p>
          
          {isPerfect && (
            <p className="text-green-500 font-medium mb-4">
              Perfect score! Excellent work.
            </p>
          )}
          
          <div className="w-full bg-muted h-3 rounded-full mb-6">
            <div 
              className={`${isPerfect ? 'bg-green-500' : 'bg-primary'} h-3 rounded-full transition-all`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={resetQuiz} className="px-8">Try Again</Button>
            <Button onClick={onReturn} variant="outline">Return to Parameters</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No questions match your criteria</p>
        <Button onClick={onReturn} variant="outline" className="mt-4">
          Adjust Parameters
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 pl-4">
            Question {currentQuestion + 1} of {questions.length}
            {currentQ.lectureNumber && (
              <>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Lecture {currentQ.lectureNumber}
                </span>
              </>
            )}
          </p>
          <p className={cn("text-sm font-medium pl-4", getDifficultyColor())}>
            {getDifficultyTitle()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReturn}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Adjust Parameters
          </Button>
          <div className="text-sm font-medium pr-5">
            Score: {score}
          </div>
        </div>
      </div>
      
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {currentQ.question}
          </h3>
          
          {currentQ.type === 'multiple-choice' && (
            <RadioGroup className="space-y-3">
              {currentQ.options?.map((option, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-all",
                    selectedOption === index && !isAnswered && "border-primary bg-primary/5",
                    isAnswered && index === currentQ.correctAnswer && "border-green-500 bg-green-50",
                    isAnswered && selectedOption === index && selectedOption !== currentQ.correctAnswer && "border-red-500 bg-red-50"
                  )}
                  onClick={() => handleOptionSelect(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    checked={selectedOption === index}
                    className="pointer-events-none"
                  />
                  <Label 
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer",
                      isAnswered && index === currentQ.correctAnswer && "text-green-700",
                      isAnswered && selectedOption === index && selectedOption !== currentQ.correctAnswer && "text-red-700"
                    )}
                  >
                    {option}
                  </Label>
                  
                  {isAnswered && index === currentQ.correctAnswer && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  
                  {isAnswered && selectedOption === index && selectedOption !== currentQ.correctAnswer && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQ.type === 'short-answer' && (
            <div>
              <Textarea 
                value={textAnswer}
                onChange={handleTextChange}
                placeholder="Enter your answer (maximum 5 words)"
                className={cn(
                  "w-full transition-all min-h-20",
                  isAnswered && "border-primary",
                  wordCount > 5 && !isAnswered && "border-red-500"
                )}
                disabled={isAnswered}
              />
              
              <div className="flex justify-between mt-2">
                <div className={cn(
                  "text-xs",
                  wordCount > 5 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {wordCount}/5 words {wordCount > 5 && "- Please reduce your answer to 5 words or less"}
                </div>
              </div>
              
              {isAnswered && (
                <div className="mt-4 bg-muted/20 p-3 rounded-md border">
                  <h4 className="text-sm font-medium mb-1">Key concepts to include:</h4>
                  <p className="text-sm text-muted-foreground">
                    {(currentQ.correctAnswer as string).split(' ').join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {currentQ.type === 'long-answer' && (
            <div>
              <Textarea 
                value={textAnswer}
                onChange={handleTextChange}
                placeholder="Enter your detailed analysis"
                className={cn(
                  "w-full transition-all min-h-40",
                  isAnswered && "border-primary"
                )}
                disabled={isAnswered}
              />
              
              {isAnswered && (
                <div className="mt-4 bg-muted/20 p-3 rounded-md border">
                  <h4 className="text-sm font-medium mb-1">Key concepts to include:</h4>
                  <p className="text-sm text-muted-foreground">
                    {(currentQ.correctAnswer as string).split(' ').join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        {!isAnswered ? (
          <Button 
            onClick={handleCheckAnswer}
            disabled={
              (currentQ.type === 'multiple-choice' ? selectedOption === null : textAnswer.trim() === '') ||
              (currentQ.type === 'short-answer' && wordCount > 5)
            }
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
