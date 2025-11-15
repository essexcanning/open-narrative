export type Theme = 'light' | 'dark';

export interface SearchSource {
  uri: string;
  title: string;
}

export interface AnalysisInput {
  country: string;
  topic: string;
  timeFrame: {
    start: string;
    end: string;
  };
  sources: string[];
}

export interface Post {
  id: string;
  source: 'Web Article' | 'Social Media Post' | 'News Report' | 'Twitter';
  author: string; // publication or user
  content: string; // summary of content
  timestamp: string; // estimated date
  imageUrl?: string;
  link: string;
}

export interface DMMIReport {
  classification: 'Disinformation' | 'Misinformation' | 'Malinformation' | 'Information';
  intent: 'Harmful' | 'Benign' | 'Uncertain';
  veracity: 'False' | 'Misleading' | 'True' | 'Unverified';
  successProbability: number; // 0-100
  rationale: string;
}

export interface OriginReport {
    attribution: 'State-sponsored' | 'Ideological Group' | 'Bot Network' | 'Organic' | 'Uncertain';
    confidence: 'Low' | 'Medium' | 'High';
    evidence: string;
}

export interface CounterOpportunity {
    strategy: 'Pre-bunking' | 'Fact-checking' | 'Content Amplification' | 'Public Awareness Campaign';
    title: string;
    description: string;
    exampleContent: string;
}

export interface Narrative {
  id: string;
  title: string;
  summary: string;
  postIds: string[];
  riskScore: number;
  status: 'pending' | 'complete' | 'error';
  dmmiReport?: DMMIReport;
  originReport?: OriginReport;
  counterOpportunities?: CounterOpportunity[];
  trendData?: { date: string; volume: number }[];
  posts?: Post[]; // Added to hold the raw posts for the new tab
}
