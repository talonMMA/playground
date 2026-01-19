import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    const key = process.env.GOOGLE_API_KEY;

    if (!key) {
        return NextResponse.json({ error: 'GOOGLE_API_KEY is missing' }, { status: 500 });
    }

    try {
        console.log("Testing Gemini API...");
        const genAI = new GoogleGenerativeAI(key);
        // Explicitly use the model we are betting on
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            status: "Success",
            model: "gemini-2.0-flash",
            reply: text
        });

    } catch (error: any) {
        console.error("Test Error:", error);
        return NextResponse.json({
            status: "Error",
            message: error.message,
            details: error
        }, { status: 500 });
    }
}
