import { CohereClient } from 'cohere-ai';

if (!process.env.COHERE_API_KEY) {
  console.error('❌ COHERE_API_KEY is not set in environment variables!');
  console.error('Please add COHERE_API_KEY to your .env file');
} else {
  console.log('✅ Cohere API key detected');
}

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

export interface ParsedTask {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface ParsedTasksResponse {
  tasks: ParsedTask[];
}

export class AIService {
  async parseTasksFromNotes(rawNotes: string): Promise<ParsedTask[]> {
    if (!process.env.COHERE_API_KEY) {
      throw new Error('Cohere API key is not configured. Please add COHERE_API_KEY to your .env file.');
    }

    try {
      const prompt = `You are a task organization assistant. Parse the following raw notes into a structured list of tasks.

For each task, determine:
1. A clear, concise title (action-oriented)
2. Priority: High (urgent/important), Medium (moderate importance), or Low (can wait)
3. Category: Work (professional tasks), Admin (administrative/paperwork), Meetings (calls/meetings), Personal (personal tasks), or Other

Raw notes:
"${rawNotes}"

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "title": "task description",
    "priority": "High|Medium|Low",
    "category": "Work|Admin|Meetings|Personal|Other"
  }
]

Rules:
- Split compound tasks into separate items
- Use action verbs (e.g., "Finish", "Check", "Call", "Review")
- Be concise but clear
- Return ONLY the JSON array, no other text`;

      const response = await cohere.chat({
        model: process.env.COHERE_MODEL || 'command-a-03-2025',
        message: prompt,
        temperature: 0.3,
        maxTokens: 1000,
        preamble: 'You are a helpful assistant that parses raw task notes into structured JSON. Always respond with valid JSON only.'
      });

      const responseText = response.text || '[]';
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonText = jsonMatch ? jsonMatch[0] : '[]';
      const parsedTasks: ParsedTask[] = JSON.parse(jsonText);
      
      return parsedTasks.map(task => ({
        title: task.title.substring(0, 500),
        priority: ['High', 'Medium', 'Low'].includes(task.priority) ? task.priority : 'Medium',
        category: ['Work', 'Admin', 'Meetings', 'Personal', 'Other'].includes(task.category) 
          ? task.category 
          : 'Other'
      }));
      
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new Error('The AI model is not available. Please check your Cohere API configuration.');
      } else if (error.statusCode === 401 || error.statusCode === 403) {
        throw new Error('Invalid Cohere API key. Please check your COHERE_API_KEY in .env file.');
      } else if (error.message?.includes('api key')) {
        throw new Error('Cohere API key configuration error: ' + error.message);
      }
      
      throw error;
    }
  }
}

export default new AIService();
