'use client';

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import demoPic from '@/assets/authPic.webp';

export default function SignInPage() {
    return (
        <div className="flex min-h-screen">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <Image
                    src={demoPic}
                    alt="Authentication"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Right side - Sign In Form */}
            <div className="flex items-center justify-center w-full lg:w-1/2 bg-gray-50">
                <SignIn afterSignInUrl="/auth/callback" />
            </div>
        </div>
    );
}