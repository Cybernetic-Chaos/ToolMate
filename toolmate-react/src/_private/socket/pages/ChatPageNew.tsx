import Aichat from "@/components/custom/Aichat";
import { Chat } from "@/components/custom/Chat";
import { useSocket } from "@/context/socketContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ChatPageNew() {
    const socket = useSocket(); // socket can be null
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.emit("createNewUserSession");

            socket.on("newSessionAcknowledge", (data: {
                sessionId: string
            }) => {
                localStorage.setItem('retrieveChat', "no")
                console.log(data, "newSessionAcknowledge")
                navigate(`/matey/${data.sessionId}?new=true`)
            })

        }
    }, [socket]);

    return (
        <div>
            <Chat role="user" message={localStorage.getItem("userPrompt") || "Hey Matey!"} />
        </div>
    );
}
