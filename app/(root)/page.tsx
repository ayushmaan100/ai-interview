// Built-in Next.js components
import Link from "next/link";
import Image from "next/image";

// UI components
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

// Server actions for data fetching
import { getCurrentUser } from "@/lib/actions/auth.action";
// import {
//     getInterviewsByUserId,
//     getLatestInterviews,
// } from "@/lib/actions/general.action";

// Async Server Component
async function Home() {
    // Get the currently authenticated user
    const user = await getCurrentUser();

    // Fetch interviews in parallel:
    // - Interviews the user has taken
    // - All available interviews (excluding ones they've done)
    const [userInterviews, allInterview] = await Promise.all([
        getInterviewsByUserId(user?.id!),         // User's past interviews
        getLatestInterviews({ userId: user?.id! }) // Interviews available to take
    ]);

    // Check if user has any past or available interviews
    const hasPastInterviews = userInterviews?.length! > 0;
    const hasUpcomingInterviews = allInterview?.length! > 0;

    return (
        <>
            {/* Hero / CTA Section */}
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice real interview questions & get instant feedback
                    </p>

                    {/* Button to start an interview */}
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                {/* Hero image */}
                <Image
                    src="/robot.png"
                    alt="robo-dude"
                    width={400}
                    height={400}
                    className="max-sm:hidden"
                />
            </section>

            {/* Past Interviews Section */}
            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>

                <div className="interviews-section">
                    {hasPastInterviews ? (
                        // Render cards for each past interview
                        userInterviews?.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                userId={user?.id}
                                interviewId={interview.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                            />
                        ))
                    ) : (
                        <p>You haven&apos;t taken any interviews yet</p>
                    )}
                </div>
            </section>

            {/* Available Interviews Section */}
            <section className="flex flex-col gap-6 mt-8">
                <h2>Take Interviews</h2>

                <div className="interviews-section">
                    {hasUpcomingInterviews ? (
                        // Render cards for each available interview
                        allInterview?.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                userId={user?.id}
                                interviewId={interview.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                            />
                        ))
                    ) : (
                        <p>There are no interviews available</p>
                    )}
                </div>
            </section>
        </>
    );
}

export default Home;