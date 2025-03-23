import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    // Extract parameters from the request
    const { question, userAnswer, expectedAnswer } = await request.json();

    // Validate input parameters
    if (!question || !userAnswer || !expectedAnswer) {
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

    // Create a prompt for Gemini to evaluate the answer
    const prompt = `
    You are an educational assessment tool evaluating student answers. Be lenient with grammatical errors, 
    focusing only on conceptual correctness. Decide if the student's answer captures the key concepts.
    
    Question: ${question}
    
    Expected key concepts: ${expectedAnswer}
    
    Student's answer: ${userAnswer}
    
    First, identify what concepts/ideas the student captured correctly.
    
    Then, determine if the answer deserves a passing score (1) or not (0).
    Be generous - if they understood the core concept but expressed it poorly, give them a 1.
    Ignore spelling/grammar issues completely.
    
    VERY IMPORTANT: Your feedback must always begin with either "Correct: " or "Incorrect: " 
    depending on your score (1 or 0) to enable visual feedback in the UI.
    
    Return your evaluation as JSON in this format:
    {
      "score": 0 or 1,
      "feedback": "Correct: [explanation]" or "Incorrect: [explanation]"
    }
    
    Return only valid JSON without any other text.
    `;

    // Call Gemini API
    console.log('Sending answer evaluation request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse the JSON response
    try {
      // Clean up response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const evaluation = JSON.parse(cleanedResponse);
      
      return NextResponse.json({
        score: evaluation.score,
        feedback: evaluation.feedback
      });
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', response);
      
      // If parsing fails, try to extract the score directly
      const scoreMatch = response.match(/"score":\s*(\d)/);
      if (scoreMatch && scoreMatch[1]) {
        return NextResponse.json({
          score: parseInt(scoreMatch[1]),
          feedback: "Answer evaluation completed, but feedback could not be parsed."
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to parse evaluation', raw: response },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
} 