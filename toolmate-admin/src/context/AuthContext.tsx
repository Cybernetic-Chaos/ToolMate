import React, { createContext, useState, ReactNode, useEffect } from 'react';


interface eachUser {
    username: string;
    role: ["all" | "add-product" | "edit-product" | "delete-product" | "view-product" | "add-user" | "edit-user" | "delete-user" | "view-user"];
}
interface AuthContextProps {
    userData: eachUser;
    isAuth: boolean;
    setIsAuth: (isAuth: boolean) => void;
    setUserData: (userData: eachUser) => void;
}

const initialUserData: eachUser = {
    username:"allan",
    role: ["all"],
};

const intitialContext = {
    userData: initialUserData,
    isAuth: false,
    setIsAuth: () => { },
    setUserData: () => { },
};

const AuthContext = createContext<AuthContextProps>(intitialContext);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<eachUser>(initialUserData);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    // testing
    useEffect(()=>{
        console.log(userData, "userData")
    },[])
    return (
        <AuthContext.Provider value={{ userData, isAuth, setIsAuth, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };