import { API_CONFIG } from '../../config/db';

interface ChatResponse {
    response: string;
}

interface ChatError {
    error: string;
}

/**
 * Fetches an AI assistant response
 * @param userMessage The user's message
 * @param course The course context (optional)
 * @returns Promise with the AI response
 */
export const fetchAssistantResponse = async (
    userMessage: string,
    course: string = 'course2'
): Promise<ChatResponse> => {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userMessage, course }),
        });

        if (!response.ok) {
            const errorData: ChatError = await response.json();
            throw new Error(errorData.error || 'Failed to fetch AI response');
        }

        const data: ChatResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
    }
}; 