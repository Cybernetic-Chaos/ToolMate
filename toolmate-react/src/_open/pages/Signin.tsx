import { SignIn, useUser } from "@clerk/clerk-react";

export default function Signup() {
    const { isSignedIn } = useUser();
    return (
        <div className="my-32  flex justify-center items-center">
            <SignIn
                forceRedirectUrl={'/signup'}
                signUpUrl="/signup"
            />
        </div>
    );
}