import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function PublicLayout(){
    const {isAuth} = useContext(AuthContext)
    const location = useLocation()
    console.log(isAuth)
    if(!isAuth && !(location.pathname === '/login')){
        return <Navigate to="/login"/>
    }
    return (
        <div>
           <Outlet/>
        </div>
    )
}