
import { GoogleGenAI, Type } from "@google/genai";
import { Commit, AnalysisResult, CommitType, ChatMessage } from "../types";

// Helper to get API key safely
const getApiKey = (): string => {
  return process.env.API_KEY || '';
};

// Initialize Gemini
const initGenAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeGitLog = async (rawLog: string, repoUrl?: string, userDescription?: string): Promise<AnalysisResult> => {
  const ai = initGenAI();
  
  const prompt = `
    You are an expert Senior Software Engineer and Git Tutor.
    Analyze the following raw git log to reconstruct the story of this repository.

    **Context Provided by User:**
    Repo URL: ${repoUrl || 'Not provided'}
    User's Description of what the repo does: "${userDescription || 'Not provided'}"
    
    (Use the user's description to ground your analysis of "What it does", but strictly verify it against the code evidence in the git log).

    **Task:**
    I need you to infer:
    1. What kind of project this is (e.g., "React Dashboard", "Go API", "Python Data Tool") based on file extensions and message context.
    2. "What it is" - a concise one-sentence pitch.
    3. "What it does" - a detailed paragraph explaining the functionality, tech stack, and recent evolution inferred from the changes.
    4. An "Overview" of the specific history provided in the log (e.g. "Recently the team focused on refactoring the auth module...").
    
    Then, for each commit:
    1. Determine the 'type' (Feature, Bug Fix, Refactor, Chore, Documentation, Performance, Security).
       - Look for keywords like "optimize", "slow", "memory" for Performance.
       - Look for keywords like "sanitize", "vuln", "auth", "secret" for Security.
    2. Assign an 'impactScore' (1-10) based on how critical the change seems.
    3. Write a 'summary' that explains the change simply for a junior developer.
    4. Extract 'filesChanged' count from stat lines if available, otherwise estimate.
    5. Detect 'codeSmells' (array of strings) that might have triggered this change or are implied by the fix (e.g. "Duplicate Code", "Magic Numbers", "Hardcoded Secrets", "Large Function", "Spaghetti Code"). If none, return empty array.

    Raw Log:
    ${rawLog}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            repoName: { type: Type.STRING },
            repoUrl: { type: Type.STRING },
            projectType: { type: Type.STRING, description: "E.g. React Web App, Python CLI" },
            whatItIs: { type: Type.STRING, description: "A one-line description of the project entity" },
            whatItDoes: { type: Type.STRING, description: "A detailed description of the project functionality based on the code evidence" },
            overview: { type: Type.STRING },
            commits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hash: { type: Type.STRING },
                  shortHash: { type: Type.STRING },
                  author: { type: Type.STRING },
                  date: { type: Type.STRING },
                  message: { type: Type.STRING },
                  type: { type: Type.STRING, enum: Object.values(CommitType) },
                  impactScore: { type: Type.NUMBER },
                  summary: { type: Type.STRING },
                  filesChanged: { type: Type.NUMBER },
                  codeSmells: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const explainCommit = async (commit: Commit, studentMode: boolean): Promise<string> => {
  const ai = initGenAI();
  const tone = studentMode ? "Explain it like I am a computer science student beginner. Use analogies." : "Explain it like a Senior Engineer performing a code review. Be technical and concise.";
  
  const prompt = `
    ${tone}
    
    Analyze this commit:
    Message: ${commit.message}
    Author: ${commit.author}
    Type: ${commit.type}
    Code Smells Detected: ${commit.codeSmells?.join(', ') || 'None'}
    
    Explain the 'Why'. Why was this change needed? What problem did it solve? What is the potential impact?
    If code smells were detected, explain why they are bad practice.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Could not generate explanation.";
};

export const chatWithRepo = async (history: ChatMessage[], repoContext: AnalysisResult): Promise<string> => {
  const ai = initGenAI();
  
  // Construct context from the analyzed repo
  const contextString = `
    Repo Name: ${repoContext.repoName}
    Project Type: ${repoContext.projectType}
    What it is: ${repoContext.whatItIs}
    What it does: ${repoContext.whatItDoes}
    Overview: ${repoContext.overview}
    Commits:
    ${repoContext.commits.map(c => `- [${c.shortHash}] ${c.message} (${c.type})`).join('\n')}
  `;

  const systemInstruction = `
    You are an AI Git Tutor for this specific repository. 
    Use the provided commit history and project description to answer user questions.
    If you don't know the answer based on the history, say so.
    Be helpful, educational, and encouraging.
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction },
    history: [
        {
            role: 'user',
            parts: [{ text: `Here is the repository history context: ${contextString}` }]
        },
        {
            role: 'model',
            parts: [{ text: "Understood. I have analyzed the repository history. Ask me anything about how the code has evolved, specific bugs, or architectural decisions." }]
        },
        ...history.slice(0, -1).map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }))
    ]
  });

  const lastMessage = history[history.length - 1];
  const response = await chat.sendMessage({ message: lastMessage.content });

  return response.text || "I couldn't process that.";
};
