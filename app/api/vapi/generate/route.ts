// Import AI SDK for text generation
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Firebase Admin Firestore (server-side only)
import { db } from "@/firebase/admin";

// Utility to get random interview cover image
import { getRandomInterviewCover } from "@/lib/utils";

// -----------------------------
// POST Handler: Create Interview
// -----------------------------
export async function POST(request: Request) {
    // Extract request body
    const { type, role, level, techstack, amount, userid } = await request.json();

    try {
        // Ask Gemini model to generate interview questions
        const { text: questions } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        Thank you! <3
    `,
        });

        // Construct interview document to save in Firestore
        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: techstack.split(","), // Convert comma-separated string into array
            questions: JSON.parse(questions), // Parse AI-generated JSON array
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(), // Random image for UI
            createdAt: new Date().toISOString(),
        };

        // Add interview document to "interviews" collection
        await db.collection("interviews").add(interview);

        // Return success response
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);

        // Return error if anything fails (like JSON.parse or AI failure)
        return Response.json({ success: false, error: error }, { status: 500 });
    }
}

// -----------------------------
// GET Handler (for testing only)
// -----------------------------
export async function GET() {
    return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}