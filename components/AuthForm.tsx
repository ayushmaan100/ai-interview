"use client"; // This is a client component (needed for hooks and events)

// ------------------------
// Imports
// ------------------------
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; // Toast for notifications
import { auth } from "@/firebase/client"; // Firebase client SDK
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/actions/auth.action"; // Server actions
import FormField from "./FormField";

// ------------------------
// Form Schema (Zod Validation)
// ------------------------
const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    });
};

// ------------------------
// AuthForm Component
// ------------------------
const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter(); // For navigation

    const formSchema = authFormSchema(type); // Get schema based on form type (sign-in / sign-up)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    // ------------------------
    // Handle form submit
    // ------------------------
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (type === "sign-up") {
                const { name, email, password } = data;

                // Firebase Auth: create user
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // Save user to Firestore using server action
                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if (!result.success) {
                    toast.error(result.message);
                    return;
                }

                toast.success("Account created successfully. Please sign in.");
                router.push("/sign-in");

            } else {
                const { email, password } = data;

                // Firebase Auth: sign in
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // Get Firebase ID token (JWT)
                const idToken = await userCredential.user.getIdToken();

                if (!idToken) {
                    toast.error("Sign in Failed. Please try again.");
                    return;
                }

                // Set secure session cookie via server action
                await signIn({
                    email,
                    idToken,
                });

                toast.success("Signed in successfully.");
                router.push("/");
            }
        } catch (error) {
            console.log(error);
            toast.error(`There was an error: ${error}`);
        }
    };

    const isSignIn = type === "sign-in"; // Flag to toggle content

    // ------------------------
    // JSX Return (UI)
    // ------------------------
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                {/* App Logo */}
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38} />
                    <h2 className="text-primary-100">PrepWise</h2>
                </div>

                <h3>Practice job interviews with AI</h3>

                {/* Form Wrapper */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4 form"
                    >
                        {/* Name Field (only for sign-up) */}
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Name"
                                placeholder="Your Name"
                                type="text"
                            />
                        )}

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your email address"
                            type="email"
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                        />

                        {/* Submit Button */}
                        <Button className="btn" type="submit">
                            {isSignIn ? "Sign In" : "Create an Account"}
                        </Button>
                    </form>
                </Form>

                {/* Footer link toggle */}
                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Have an account already?"}
                    <Link
                        href={!isSignIn ? "/sign-in" : "/sign-up"}
                        className="font-bold text-user-primary ml-1"
                    >
                        {!isSignIn ? "Sign In" : "Sign Up"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;