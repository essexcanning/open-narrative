import { GoogleGenAI, Type } from "@google/genai";
import { Narrative, Post, DMMIReport, OriginReport, CounterOpportunity, AnalysisInput, SearchSource } from '../types';
import { generateId } from "../utils/generateId";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set in the environment. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Schemas for structured responses
const narrativeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A short, neutral, descriptive title for the narrative (5-10 words)." },
        summary: { type: Type.STRING, description: "A one-paragraph summary of the core message and claims of the narrative." },
        postIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of post IDs that belong to this narrative cluster." },
        riskScore: { type: Type.INTEGER, description: "An initial estimated risk score from 1 (low) to 10 (high) based on potential for harm and virality." }
      },
      required: ["title", "summary", "postIds", "riskScore"]
    }
};

const enrichmentSchema = {
  type: Type.OBJECT,
  properties: {
    dmmiReport: {
      type: Type.OBJECT,
      properties: {
        classification: { type: Type.STRING, enum: ['Disinformation', 'Misinformation', 'Malinformation', 'Information'] },
        intent: { type: Type.STRING, enum: ['Harmful', 'Benign', 'Uncertain'] },
        veracity: { type: Type.STRING, enum: ['False', 'Misleading', 'True', 'Unverified'] },
        successProbability: { type: Type.INTEGER, description: "Estimated probability of narrative success (0-100)." },
        rationale: { type: Type.STRING, description: "Brief rationale for the DMMI classification." }
      },
      required: ["classification", "intent", "veracity", "successProbability", "rationale"]
    },
    originReport: {
      type: Type.OBJECT,
      properties: {
        attribution: { type: Type.STRING, enum: ['State-sponsored', 'Ideological Group', 'Bot Network', 'Organic', 'Uncertain'] },
        confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        evidence: { type: Type.STRING, description: "Summary of evidence for the attribution (e.g., coordinated timing, linguistic patterns)." }
      },
      required: ["attribution", "confidence", "evidence"]
    },
    counterOpportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          strategy: { type: Type.STRING, enum: ['Pre-bunking', 'Fact-checking', 'Content Amplification', 'Public Awareness Campaign'] },
          title: { type: Type.STRING, description: "Headline for the counter-action." },
          description: { type: Type.STRING, description: "Brief description of the counter-action." },
          exampleContent: { type: Type.STRING, description: "A sample piece of content (e.g., a tweet, a short article)." }
        },
        required: ["strategy", "title", "description", "exampleContent"]
      }
    }
  },
  required: ["dmmiReport", "originReport", "counterOpportunities"]
};

export const fetchRealtimePosts = async (inputs: AnalysisInput): Promise<{ posts: Post[], sources: SearchSource[] }> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are a research assistant. Your task is to find recent and relevant online content about "${inputs.topic}" in "${inputs.country}" within the timeframe of ${inputs.timeFrame.start} to ${inputs.timeFrame.end}.
        Use Google Search to find a diverse set of sources, including news reports, web articles, and social media posts.
        Based on your search results, synthesize a structured JSON array of 30-50 post objects.
        The JSON output must be enclosed in a single markdown code block like this: \`\`\`json ... \`\`\`.
        Each object in the array must have the following properties: "id" (string), "source" (string, one of 'Web Article', 'Social Media Post', 'News Report'), "author" (string), "content" (string summary), "timestamp" (string, YYYY-MM-DD), and "link" (string URL).
        Ensure the content is realistic and reflects a mix of potential online discussions on the topic.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const responseText = response.text;
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = responseText.match(jsonRegex);

        if (!match || !match[1]) {
            console.error("Could not find JSON in model response:", responseText);
            throw new Error("Failed to fetch real-time data. The AI model returned an invalid format.");
        }

        const jsonText = match[1].trim();
        const posts = JSON.parse(jsonText) as Post[];

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: SearchSource[] = groundingChunks
            .map(chunk => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled Source'
            }))
            .filter(source => source.uri);

        const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

        return { posts, sources: uniqueSources };

    } catch (error) {
        console.error("Error in fetchRealtimePosts:", error);
        if (error instanceof Error && error.message.includes("invalid format")) {
            throw error;
        }
        throw new Error("Failed to fetch real-time data from Google Search.");
    }
};


export const detectAndClusterNarratives = async (posts: Post[], context: string): Promise<Narrative[]> => {
    const model = 'gemini-2.5-flash';
    const postData = posts.map(p => `ID: ${p.id}, Source: ${p.source}, Author: ${p.author}, Content: "${p.content}"`).join('\n---\n');
    
    const prompt = `
        Analyze the following social media and news posts related to ${context}.
        Your task is to identify and cluster distinct narratives. A narrative is a consistent theme, story, or message that multiple posts contribute to.
        Ignore isolated or irrelevant posts.
        For each distinct narrative, provide a concise title, a summary, the IDs of the posts that form the narrative, and an initial risk score.

        Posts:
        ${postData}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: narrativeSchema,
                temperature: 0.2,
            }
        });

        const jsonText = response.text.trim();
        const detectedNarratives = JSON.parse(jsonText) as Omit<Narrative, 'id' | 'status'>[];

        return detectedNarratives.map(n => ({ ...n, id: generateId(), status: 'pending' }));

    } catch (error) {
        console.error("Error in detectAndClusterNarratives:", error);
        throw new Error("Failed to detect narratives. The AI model may have returned an invalid response.");
    }
};

export const enrichNarrative = async (narrative: Narrative, posts: Post[]): Promise<Narrative> => {
    const model = 'gemini-2.5-pro';
    const postContent = posts.map(p => `Author: ${p.author}, Content: "${p.content}"`).join('\n').substring(0, 8000);

    const prompt = `
        **CONTEXT:** You are a strategic analyst specializing in information warfare defense.
        **NARRATIVE FOR ANALYSIS:**
        - **Title:** "${narrative.title}"
        - **Summary:** "${narrative.summary}"
        - **Sample Posts:**\n${postContent}

        **YOUR TASK:** Perform a comprehensive analysis and provide a structured JSON response.
        
        1.  **DMMI Classification:** Classify the narrative using the DMMI framework (Disinformation, Misinformation, Malinformation, Information). Evaluate intent, veracity, and probability of success.

        2.  **Origin Attribution:** Analyze post patterns, language, and sources to attribute the narrative's origin.

        3.  **Counter-Opportunities:** Based on the analysis, propose three distinct, ethical, and defensive counter-opportunities. Focus on strategies like pre-bunking or fact-checking. DO NOT suggest offensive or manipulative tactics.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: enrichmentSchema,
                temperature: 0.5,
            }
        });
        
        const jsonText = response.text.trim();
        const enrichmentData = JSON.parse(jsonText) as {
            dmmiReport: DMMIReport;
            originReport: OriginReport;
            counterOpportunities: CounterOpportunity[];
        };

        const trendData = Array.from({ length: 14 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - i));
            return {
                date: date.toISOString().split('T')[0],
                volume: Math.floor(Math.random() * (narrative.riskScore * 15)) + (i * narrative.riskScore * Math.random() * 2)
            };
        });

        return { ...narrative, ...enrichmentData, trendData, status: 'complete' };

    } catch (error) {
        console.error(`Error enriching narrative "${narrative.title}":`, error);
        return { ...narrative, status: 'error' };
    }
};
