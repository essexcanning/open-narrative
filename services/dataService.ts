
import { AnalysisInput, Post } from '../types';

// Mock data generation
const generateMockPosts = (count: number, inputs: AnalysisInput): Post[] => {
    const posts: Post[] = [];
    const topics = [
        inputs.topic,
        `anti-${inputs.topic}`,
        `${inputs.country} politics`,
        'economic impact',
        'social issues',
        'foreign relations'
    ];
    const authors = ['NewsNetwork', 'AnalystPro', 'CitizenVoice', 'StateMediaBot', 'FactChecker', 'ConcernedCitizen'];

    for (let i = 0; i < count; i++) {
        const source = Math.random() > 0.3 ? 'X/Twitter' : 'Google News';
        const author = authors[Math.floor(Math.random() * authors.length)];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        const contentTemplates = [
            `Breaking: New developments regarding ${topic} in ${inputs.country}. Experts are worried. #elections #${inputs.country}`,
            `Is ${topic} really the biggest issue for ${inputs.country}? A deep dive into the data reveals a surprising truth.`,
            `The government's stance on ${topic} is causing widespread debate. Here's what you need to know.`,
            `A coordinated campaign is pushing false narratives about ${topic} in ${inputs.country}. We must be vigilant. #disinformation`,
            `Our new poll shows that ${Math.floor(Math.random() * 60) + 20}% of people in ${inputs.country} are concerned about ${topic}.`,
            `This is a clear example of foreign interference. The messaging around ${topic} mirrors known propaganda techniques.`
        ];
        
        const post: Post = {
            id: `post_${Date.now()}_${i}`,
            source,
            author: author,
            authorHandle: `@${author}${Math.floor(Math.random() * 1000)}`,
            content: contentTemplates[Math.floor(Math.random() * contentTemplates.length)],
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: {
                likes: Math.floor(Math.random() * (author.includes('Bot') ? 500 : 2000)),
                retweets: Math.floor(Math.random() * (author.includes('Bot') ? 1000 : 500)),
                replies: Math.floor(Math.random() * 150)
            },
            imageUrl: Math.random() > 0.8 ? `https://picsum.photos/seed/${i}/600/400` : undefined,
            link: `https://example.com/post/${i}`
        };
        posts.push(post);
    }
    return posts;
};


export const mockFetchPosts = (inputs: AnalysisInput): Post[] => {
    console.log('Simulating fetching posts for inputs:', inputs);
    // Generate a random number of posts to simulate real-world variability
    const postCount = Math.floor(Math.random() * 150) + 50; // 50 to 200 posts
    return generateMockPosts(postCount, inputs);
};
