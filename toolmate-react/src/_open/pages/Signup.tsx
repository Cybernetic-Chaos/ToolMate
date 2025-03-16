import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
    return (
        <div className="my-32  flex justify-center items-center">
            <SignUp
                forceRedirectUrl={'/dashboard'}
                signInUrl="/signin"
            />
        </div>
    );
}