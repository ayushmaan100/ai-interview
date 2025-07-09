import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

// Async Server Component: Displays logos for a given tech stack
const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
    // Get array of tech logos using utility (e.g., [{ tech: "React", url: "/react.svg" }, ...])
    const techIcons = await getTechLogos(techStack);

    return (
        <div className="flex flex-row">
            {/* Only show up to 3 icons */}
            {techIcons.slice(0, 3).map(({ tech, url }, index) => (
                <div
                    key={tech}
                    className={cn(
                        "relative group bg-dark-300 rounded-full p-2 flex flex-center",
                        index >= 1 && "-ml-3"
                    )}
                >
                    {/* Tooltip that appears on hover (assumes CSS handles visibility) */}
                    <span className="tech-tooltip">{tech}</span>

                    <Image
                        src={url}
                        alt={tech}
                        width={100}
                        height={100}
                        className="size-5"
                    />
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;