import { UserContext } from "@/context/userContext";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

export default function LogoSmall() {
    const { user } = useUser();
    const { userData } = useContext(UserContext);
    return (
        <>
            <Link to={user && !userData?.planAccess[0] ? "/dashboard" : "/"}>
                <img src="/assets/icons/small-logo.svg" alt="Logo" />{" "}
            </Link>
        </>
    );
}
