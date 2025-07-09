// Import the Agent component (likely an AI chat agent or interview generator)
import Agent from "@/components/Agent";

// Import server-side action to get user data from session
import { getCurrentUser } from "@/lib/actions/auth.action";

// This is a Server Component in Next.js
const Page = async () => {
    // Fetch the logged-in user (from Firebase session cookie)
    const user = await getCurrentUser();

    return (
        <>
            <h3>Interview generation</h3>

            {/* Render the Agent component with user data */}
            <Agent
                userName={user?.name!}             // User's name (forced non-null using '!')
                userId={user?.id}                  // Firebase UID
                profileImage={user?.profileURL}    // Optional profile image URL
                type="generate"                    // Mode passed to Agent (can be used to determine behavior)
            />
        </>
    );
};

export default Page;