import { NextResponse } from 'next/server';
import { openai, getGeminiModel } from '@/lib/ai-clients';

export async function POST(req: Request) {
    try {
        const { model, messages } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1].content;

        let reply = '';

        if (model === 'gpt') {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo', // Or gpt-4
                messages: messages.map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'assistant', // Map your custom roles if needed
                    content: m.content
                })),
            });
            reply = completion.choices[0].message.content || 'No response from GPT';
        } else if (model === 'gemini') {
            const geminiModel = getGeminiModel();
            // Gemini history format is different, but for simplest turn, we can just prompt.
            // Or we can reconstruct history.
            // For now, let's just use generateContent with the last prompt for simplicity, 
            // or build a chat session.

            const chat = geminiModel.startChat({
                history: messages.slice(0, -1).map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }],
                })),
            });

            const result = await chat.sendMessage(lastMessage);
            const response = await result.response;
            reply = response.text();
        } else {
            return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 });
        }

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('AI API Error:', error);
        console.error('Error Details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ error: error.message || 'Internal Server Error', details: error }, { status: 500 });
    }
}
