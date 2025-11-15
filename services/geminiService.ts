
import { GoogleGenAI, Type } from "@google/genai";
import { Narrative, Post, DMMIReport, OriginReport, CounterOpportunity } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this project, we assume it's set in the environment.
  console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateId = () => `narrative_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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


export const detectAndClusterNarratives = async (posts: Post[], context: string): Promise<Narrative[]> => {
    const model = 'gemini-2.5-flash';
    const postData = posts.map(p => `ID: ${p.id}, Source: ${p.source}, Author: ${p.authorHandle}, Content: "${p.content}"`).join('\n---\n');
    
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
    const postContent = posts.map(p => `Author: ${p.authorHandle}, Content: "${p.content}"`).join('\n');

    const prompt = `
        **CONTEXT:** You are a strategic analyst specializing in information warfare defense.
        **NARRATIVE FOR ANALYSIS:**
        - **Title:** "${narrative.title}"
        - **Summary:** "${narrative.summary}"
        - **Sample Posts:**\n${postContent.substring(0, 4000)} 

        **YOUR TASK:** Perform a comprehensive analysis and provide a structured JSON response.
        
        1.  **DMMI Classification:** Classify the narrative using the DMMI framework (Disinformation, Misinformation, Malinformation, Information).
            - **Disinformation:** False content with intent to harm.
            - **Misinformation:** False content without intent to harm.
            - **Malinformation:** True content with intent to harm.
            - **Information:** True content without intent to harm.
            Evaluate intent, veracity, and probability of success.

        2.  **Origin Attribution:** Analyze post patterns, language, and sources to attribute the narrative's origin. Look for signs of coordination, bot-like activity, or alignment with known actors.

        3.  **Counter-Opportunities:** Based on the analysis, propose three distinct, ethical, and defensive counter-opportunities. Focus on strategies like pre-bunking, fact-checking, and amplifying credible voices. DO NOT suggest offensive or manipulative tactics. The goal is to protect democratic integrity.
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

        // Generate some mock trend data for visualization
        const trendData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toISOString().split('T')[0],
                volume: Math.floor(Math.random() * (narrative.riskScore * 20)) + (i * narrative.riskScore * 2)
            };
        });

        return { ...narrative, ...enrichmentData, trendData, status: 'complete' };

    } catch (error) {
        console.error(`Error enriching narrative "${narrative.title}":`, error);
        return { ...narrative, status: 'error' };
    }
};
