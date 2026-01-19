import { NextResponse } from 'next/server';
import { openai, getGeminiModel } from '@/lib/ai-clients';

export async function POST(req: Request) {
    try {
        const { model, messages, isBattle } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1].content;

        // System instruction for battle mode
        const systemPrompt = isBattle
            ? "You are a competitive debater in a heated argument. The user's initial question is just the topic. You are NOT answering the user anymore. You are arguing with the previous speaker (your opponent). Your goal is to defeat their logic. Do NOT replicate their answer. If they say 'No', you say 'Yes' and invent a reason. If they rely on facts, use emotion or obscure counter-facts. Be short, punchy, and aggressive. Directly quote their last point and mock it. START YOUR RESPONSE BY ATTACKING THEIR LAST CLAIM."
            : "You are a helpful AI assistant.";

        let reply = '';

        if (model === 'gpt') {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo', // Or gpt-4
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.map((m: any) => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content
                    }))
                ],
            });
            reply = completion.choices[0].message.content || 'No response from GPT';
        } else if (model === 'gemini') {
            const geminiModel = getGeminiModel();
            // Gemini history format is different, but for simplest turn, we can just prompt.
            // Or we can reconstruct history.
            // For now, let's just use generateContent with the last prompt for simplicity, 
            // or build a chat session.

            const chatHistory = messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));

            // Inject system prompt as the very first turn context
            // But Gemini chat selection requires alternating user/model. System prompts are better handled by checking if we made a new helper.
            // Let's modify the chat start to include the system instruction in the first 'user' usage or just prepend to the last message.
            // actually, let's just create a new model instance here with the system instruction if possible, 
            // OR just prepend the instruction to the last message.

            const lastMsgContent = lastMessage + "\n\n(Context: " + systemPrompt + ")";

            const chat = geminiModel.startChat({
                history: chatHistory,
            });

            const result = await chat.sendMessage(lastMsgContent);
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
