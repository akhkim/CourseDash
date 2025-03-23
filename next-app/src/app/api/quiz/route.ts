import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the question format for the quiz
interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer';
}

export async function POST(request: NextRequest) {
  try {
    // Extract parameters from the request
    const { 
      difficulty,
      user_input,
      numberOfQuestions,
      lectureNotes,
      courseName,
      courseDescription
    } = await request.json();

    // Validate input parameters
    if (!difficulty || !numberOfQuestions || numberOfQuestions < 1) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create a context-rich prompt for Gemini
    let contextContent = lectureNotes ? JSON.stringify(lectureNotes) : "";
    if (contextContent) {
      // Limit context size if it's too large
      if (contextContent.length > 50000) {
        contextContent = contextContent.substring(0, 50000) + "...";
      }
    }

    // Customize quiz by difficulty
    let questionType = 'multiple-choice';
    switch (difficulty) {
      case 'easy':
        questionType = 'multiple-choice';
        break;
      case 'medium':
        questionType = 'short-answer';
        break;
      case 'hard':
        questionType = 'long-answer';
        break;
    }

    // Course information for context
    const courseInfo = `
    Course: ${courseName || 'Unspecified Course'}
    ${courseDescription ? `Description: ${courseDescription}` : ''}
    `;

    // Build the prompt with all available context
    const prompt = `
    Create a quiz with ${numberOfQuestions} ${questionType} questions that demonstrate comprehension of the concepts taught in the following course:
    ${courseInfo}
    
    User's specific request: "${user_input || 'Generate quiz questions about the broader concepts covered in the material'}"
    
    ${contextContent ? 'Context from lecture notes (use ONLY as reference for topics, not for direct questions):\n' + contextContent : ''}
    
    IMPORTANT INSTRUCTIONS:
    - Do NOT create questions that directly quote or test memorization of the lecture content
    - Instead, focus on related concepts, practical applications, and understanding of the underlying principles
    - Questions should be answerable by someone who has mastered the topics covered in the lecture notes
    - Create questions that apply the knowledge from these topics to slightly different scenarios
    - Questions should test the student's ability to transfer their understanding to new contexts
    - Stay within the scope of the course subject matter - don't introduce completely unrelated topics
    
    Follow these guidelines based on the difficulty level (${difficulty}):
    
    ${difficulty === 'easy' ? `
    - Create multiple-choice questions with 4 options each
    - Make only ONE option correct
    - Questions should test basic understanding and application of concepts (not memorization)
    - Label the correct answer as 0, 1, 2, or 3 (zero-indexed)
    - Ensure questions are directly relevant to ${courseName || 'this course'} but not copied from the notes
    ` : difficulty === 'medium' ? `
    - Create short-answer questions that can be answered in 1-5 words
    - Questions should test application of concepts to new scenarios
    - The correct answer should be a simple term or short phrase
    - Ensure questions are directly relevant to ${courseName || 'this course'} but not copied from the notes
    ` : `
    - Create challenging analysis questions that require deep understanding
    - Questions should test critical thinking, synthesis, and novel application of principles
    - The correct answer should list key concepts that should be included
    - Ensure questions are directly relevant to ${courseName || 'this course'} but not copied from the notes
    `}
    
    Format your response as a JSON array of questions with this structure:
    [
      {
        "id": "unique-string",
        "question": "Question text",
        ${difficulty === 'easy' ? `"options": ["Option A", "Option B", "Option C", "Option D"],` : ''}
        "correctAnswer": ${difficulty === 'easy' ? '0, 1, 2, or 3' : '"key terms or concepts"'},
        "type": "${questionType}"
      },
      ...
    ]
    
    Return only valid JSON without any other text.
    `;

    // Call Gemini API
    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse the JSON response
    try {
      // Clean up response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const quizQuestions = JSON.parse(cleanedResponse);
      
      // Add unique IDs if missing
      quizQuestions.forEach((q: QuizQuestion, index: number) => {
        if (!q.id) {
          q.id = `q-${index}-${Date.now()}`;
        }
      });

      // Limit to requested number
      const limitedQuestions = quizQuestions.slice(0, numberOfQuestions);
      
      return NextResponse.json({
        questions: limitedQuestions,
        message: 'Quiz generated successfully'
      });
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', response);
      return NextResponse.json(
        { error: 'Failed to parse quiz questions', raw: response },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
} 