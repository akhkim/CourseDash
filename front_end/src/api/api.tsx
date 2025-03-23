export const fetchAssistantResponse = async (userMessage: string) => {
    const response = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userMessage, course: "course2", user_id: "user1" }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }
  
    const data = await response.json();
    return data;
  };


export const insertUser = async (userData: object) => {
    const response = await fetch('http://127.0.0.1:5000/api/users', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Failed to insert user to database');
      }
    
      const data = await response.json();
      return data;
    
};