import { GoogleGenAI } from '@google/genai';

// In a real app, you'd want to ensure the API key is handled securely
// and not exposed client-side if it has broad permissions.
// Here we assume it's provided via environment variables.

export const translateLyrics = async (lyrics: string, language: string): Promise<string> => {
    // FIX: Per guidelines, instantiate GoogleGenAI with process.env.API_KEY directly.
    // The ! operator is used because the app logic ensures the API key exists before this function is called.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const prompt = `
        You are an expert in music and cultural linguistics. 
        Translate the following song lyrics into ${language}.
        Your translation MUST be culturally authentic and maintain the original song's rhythm, rhyme, and emotional intent. 
        Do not just provide a literal translation. Adapt idioms and metaphors appropriately for a ${language}-speaking audience.
        The final output should ONLY be the translated lyrics, with no extra explanations or titles.

        Original Lyrics:
        ---
        ${lyrics}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error translating lyrics:", error);
        throw new Error("Failed to translate lyrics. Please check the console for details.");
    }
};


export const generateVideo = async (prompt: string): Promise<string> => {
    // FIX: Per guidelines, instantiate GoogleGenAI with process.env.API_KEY directly.
    // The ! operator is used because the app logic ensures the API key exists before this function is called.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        // Append API key for fetching
        // FIX: Per guidelines, use process.env.API_KEY directly for fetching the video.
        const fetchUrl = `${downloadLink}&key=${process.env.API_KEY!}`;
        const videoResponse = await fetch(fetchUrl);
        
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video file. Status: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
};