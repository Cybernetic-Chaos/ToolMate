import { UserContext } from "@/context/userContext";
import { useUser } from "@clerk/clerk-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

export default function DarkLogo() {
  const { user } = useUser();
  const { userData } = useContext(UserContext);
  return (
    <>
      <Link to={`${user ? "/dashboard" : "/"}`} className="flex items-center mr-2 gap-2">
        <img src="/assets/icons/black-full-logo.svg" alt="Logo" />
        {
          userData?.planAccess && userData.planAccess[1] && <div><Plan planName={"Essential"} /></div>
        }
        {
          userData?.planAccess && userData.planAccess[2] && <div><Plan planName={"Pro"} /></div>
        }
      </Link>
    </>
  );
}

function Plan({ planName }: {
  planName: string
}) {
  return (
    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow to-lightOrange text-black font-medium shadow-md hover:shadow-lg transition-shadow duration-300">
      {planName}
    </div>
  )
}