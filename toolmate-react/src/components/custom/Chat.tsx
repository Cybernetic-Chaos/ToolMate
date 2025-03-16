import { useSocket } from "@/context/socketContext";
import { useEffect } from "react";

export function Chat({
    message,
    role,
}: {
    message: string,
    role: string
}) {


    return (
        <div className={` w-full h-fit p-2 flex ${role === "user" ? "justify-end" : "justify-start"}`}>
            {
                role == "user" ? (
                    <div className="w-fit px-3 py-2 bg-yellow rounded-lg">
                        <p className="font-semibold">{message}</p>
                    </div>
                ) : (
                    <div className="w-fit px-3 py-2 bg-mangoYellow rounded-lg">
                        <h1>{message}</h1>
                    </div>
                )
            }
        </div>
    )
}