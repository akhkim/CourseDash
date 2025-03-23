'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle, BrainCircuit, Award, Clock, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { QuizParameters } from './QuizParameters';
import { authFetch } from '@/lib/utils/auth-fetch';
import { motion, AnimatePresence } from "framer-motion";

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
  courseData?: any;
}

// Empty array for questions as we'll fetch them dynamically
const allQuestions: QuizQuestion[] = [];

const Quiz: React.FC<QuizProps> = ({ 
  parameters, 
  onComplete = () => {}, 
  onReturn,
  questions: customQuestions,
  courseData
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('initializing');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // If custom questions are provided, use them directly
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
      setIsLoading(false);
      return;
    }
    
    // Function to fetch questions from our API
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(10);
        setLoadingStage('preparing');
        
        // Simulate a short delay to show the initial loading stage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Extract lecture notes in a format that can be sent to the API
        const lectureNotes = courseData?.lectureNotes?.map((note: any) => ({
          title: note.title,
          summary: note.summary,
          content: note.fileContent || ''
        })) || [];

        setLoadingProgress(25);
        setLoadingStage('analyzing');
        
        // Simulate another short delay before making the API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setLoadingProgress(40);
        setLoadingStage('generating');

        // Call our quiz generation API
        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            difficulty: parameters.difficulty,
            user_input: parameters.user_input,
            numberOfQuestions: parameters.numberOfQuestions,
            lectureNotes: lectureNotes,
            courseName: courseData?.courseName || '',
            courseDescription: courseData?.courseDescription || ''
          }),
        });

        setLoadingProgress(75);
        setLoadingStage('finalizing');

        if (!response.ok) {
          throw new Error(`Failed to generate questions: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('No questions returned from API');
        }
        
        setLoadingProgress(95);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setQuestions(data.questions);
        setLoadingProgress(100);
        setLoadingStage('complete');
        
        // Add a small delay before removing the loading screen for a smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred generating questions');
        
        // Fallback to a default question if API fails
        setQuestions([
          {
            id: 'fallback-1',
            question: 'Something went wrong generating questions. What might be the issue?',
            options: [
              'API server may be down',
              'Gemini API quota exceeded',
              'Insufficient lecture notes to generate questions',
              'Network connectivity issue'
            ],
            correctAnswer: 2,
            type: 'multiple-choice'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Call fetch questions
    fetchQuestions();
  }, [parameters, customQuestions, courseData]);
  
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
  
  const handleCheckAnswer = async () => {
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
      
      setIsEvaluating(true);
      setFeedback(null);
      
      try {
        // Call the answer evaluation API
        const response = await fetch('/api/quiz/check-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: currentQ.question,
            userAnswer: textAnswer,
            expectedAnswer: currentQ.correctAnswer
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to evaluate answer');
        }
        
        const data = await response.json();
        
        setIsAnswered(true);
        
        // Add score if the model determined it was correct
        if (data.score === 1) {
          setScore(score + 1);
        }
        
        // Set feedback if available
        if (data.feedback) {
          setFeedback(data.feedback);
        }
      } catch (error) {
        console.error('Error checking answer:', error);
        setIsAnswered(true);
        
        // Fallback to basic evaluation if API fails
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
      } finally {
        setIsEvaluating(false);
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

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl mx-auto"
      >
        <Card className="shadow-soft overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative h-16 w-16 flex items-center justify-center">
                <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ borderRadius: '100%' }}></div>
              </div>
              
              <div className="space-y-2 w-full">
                <h2 className="text-xl font-medium">
                  {loadingStage === 'initializing' && 'Initializing Quiz'}
                  {loadingStage === 'preparing' && 'Preparing Course Materials'}
                  {loadingStage === 'analyzing' && 'Analyzing Topics'}
                  {loadingStage === 'generating' && 'Generating Questions'}
                  {loadingStage === 'finalizing' && 'Finalizing Your Quiz'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {loadingStage === 'initializing' && 'Setting up your personalized quiz...'}
                  {loadingStage === 'preparing' && 'Processing your course content...'}
                  {loadingStage === 'analyzing' && 'Identifying key concepts from your materials...'}
                  {loadingStage === 'generating' && 'Creating challenging questions based on difficulty...'}
                  {loadingStage === 'finalizing' && 'Putting the final touches on your quiz...'}
                </p>
                
                <div className="h-2 w-full bg-muted rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <p className="text-xs text-muted-foreground">{loadingProgress}% complete</p>
              </div>
              
              <div className="text-sm text-muted-foreground italic">
                Creating a {parameters.difficulty} difficulty quiz with {parameters.numberOfQuestions} questions
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl mx-auto"
      >
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Generating Quiz</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={onReturn}>Return to Setup</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isCompleted) {
    const percentage = (score / questions.length) * 100;
    const isPerfect = percentage === 100;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl mx-auto"
      >
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isPerfect ? 'bg-green-100' : 'bg-primary/10'} mb-6`}
            >
              {isPerfect ? (
                <Award className="h-8 w-8 text-green-500" />
              ) : (
                <Check className="h-8 w-8 text-primary" />
              )}
            </motion.div>
            
            <h2 className="text-2xl font-semibold mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground mb-2">
              You scored {score} out of {questions.length}
            </p>
            
            {isPerfect && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-green-500 font-medium mb-4"
              >
                Perfect score! Excellent work.
              </motion.p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
              <Button variant="outline" onClick={resetQuiz}>
                Retry Quiz
              </Button>
              <Button onClick={onReturn}>
                Return to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={onReturn}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back</span>
              </Button>
            </div>
            <div className="flex items-center">
              <p className={`text-sm font-medium ${getDifficultyColor()}`}>
                {getDifficultyTitle()}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded flex items-center justify-center bg-primary/10">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                </div>
                <p className="font-medium">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>Score: {score}</span>
              </div>
            </div>
            
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-2"
            >
              <h3 className="text-lg font-medium mb-4">{questions[currentQuestion]?.question}</h3>
            
              {questions[currentQuestion]?.type === 'multiple-choice' ? (
                <RadioGroup 
                  value={selectedOption !== null ? selectedOption.toString() : undefined}
                  className="space-y-3"
                >
                  {questions[currentQuestion]?.options?.map((option, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors",
                        isAnswered && index === questions[currentQuestion].correctAnswer 
                          ? "border-green-500 bg-green-50" 
                          : isAnswered && index === selectedOption 
                            ? "border-red-500 bg-red-50" 
                            : selectedOption === index 
                              ? "border-primary" 
                              : "hover:bg-muted/50"
                      )}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`option-${index}`} 
                        disabled={isAnswered}
                      />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {isAnswered && index === questions[currentQuestion].correctAnswer && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  <Textarea 
                    placeholder={questions[currentQuestion]?.type === 'short-answer' 
                      ? "Enter your answer (5 words max)" 
                      : "Enter your answer"
                    }
                    value={textAnswer}
                    onChange={handleTextChange}
                    className={cn(
                      "h-24 resize-none transition-colors",
                      isAnswered && (
                        // Check if answer was correct based on consistent feedback format
                        (() => {
                          if (!isAnswered) return "";
                          if (feedback) {
                            return feedback.startsWith("Correct:")
                              ? "border-green-500 focus-visible:ring-green-500" 
                              : "border-red-500 focus-visible:ring-red-500";
                          }
                          return "";
                        })()
                      )
                    )}
                    disabled={isAnswered || isEvaluating}
                  />
                  
                  {questions[currentQuestion]?.type === 'short-answer' && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Word count: {wordCount}</span>
                      <span className={wordCount > 5 ? "text-red-500" : ""}>
                        {wordCount > 5 ? "Over limit" : "Limit: 5 words"}
                      </span>
                    </div>
                  )}
                  
                  {isAnswered && (
                    <div className={cn(
                      "rounded-lg border p-3 mt-2",
                      feedback && (
                        feedback.startsWith("Correct:")
                          ? "border-green-500 bg-green-50" 
                          : "border-red-500 bg-red-50"
                      ),
                      !feedback && "border-yellow-500 bg-yellow-50"
                    )}>
                      <p className="text-sm font-medium text-yellow-700">Expected concepts:</p>
                      <p className="text-sm text-yellow-600 mt-1">{questions[currentQuestion]?.correctAnswer as string}</p>
                      
                      {feedback && (
                        <>
                          <div className="flex items-center gap-2 mt-3">
                            {feedback.startsWith("Correct:") ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <p className="text-sm font-medium text-green-700">Correct!</p>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm font-medium text-red-700">Incorrect</p>
                              </>
                            )}
                          </div>
                          <p className="text-sm mt-1">{feedback}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            
            <div className="pt-6 flex justify-between">
              {!isAnswered ? (
                <Button 
                  onClick={handleCheckAnswer}
                  disabled={
                    isEvaluating ||
                    (questions[currentQuestion]?.type === 'multiple-choice' && selectedOption === null) ||
                    (questions[currentQuestion]?.type !== 'multiple-choice' && textAnswer.trim() === '') ||
                    (questions[currentQuestion]?.type === 'short-answer' && wordCount > 5)
                  }
                  className="w-full"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    'Check Answer'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="w-full"
                >
                  {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Quiz;
