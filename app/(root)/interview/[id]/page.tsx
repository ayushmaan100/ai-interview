import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent"; // Component that handles interview call
import { getRandomInterviewCover } from "@/lib/utils"; // Utility to get a random image

// Firebase action functions
import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

import DisplayTechIcons from "@/components/DisplayTechIcons"; // Shows icons for tech stack


const InterviewDetails = async ({ params }: RouteParams) => {
    const { id } = await params; // Get the interview ID from the route params

    const user = await getCurrentUser(); // Get logged-in user

    const interview = await getInterviewById(id); // Get interview by ID
    if (!interview) redirect("/"); // If not found, redirect to homepage

    // Fetch feedback if exists for this interview
    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user?.id!,
    });

    return (
        <>
            <div className="flex flex-row gap-4 justify-between">
                {/* Left Side: Role and Tech Stack */}
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        {/* Interview cover image */}
                        <Image
                            src={getRandomInterviewCover()}
                            alt="cover-image"
                            width={40}
                            height={40}
                            className="rounded-full object-cover size-[40px]"
                        />
                        {/* Interview Role Title */}
                        <h3 className="capitalize">{interview.role} Interview</h3>
                    </div>

                    {/* Tech stack icons */}
                    <DisplayTechIcons techStack={interview.techstack} />
                </div>

                {/* Interview Type Badge (e.g., Technical / Behavioral) */}
                <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
                    {interview.type}
                </p>
            </div>

            {/* Agent Component starts the AI interview call */}
            <Agent
                userName={user?.name!}
                userId={user?.id}
                interviewId={id}
                type="interview" // different than "generate"
                questions={interview.questions}
                feedbackId={feedback?.id} // if feedback exists, pass its ID
            />
        </>
    );
};

export default InterviewDetails;