import { AuthContext } from "@/context/AuthContext";
import { Bell, BookOpen, Bot, CreditCard, PieChart, Sparkles, Map, LogOut, Box } from "lucide-react";
import { useContext } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

const data = [
    {
        title: "Reach",
        items: [
            { label: "Edit price", to: "/edit-price", icon: <CreditCard /> },
            { label: "Blogs", to: "/blogs", icon: <BookOpen /> },
            { label: "Push notification", to: "/push-notification", icon: <Bell /> },
            { label: "Add Product", to: "/add-product", icon: <Box /> },
        ],
    },
    {
        title: "Analysis",
        items: [
            { label: "User chats", to: "/user-chats", icon: <Bot /> },
            { label: "Reports and query's", to: "/reports-queries", icon: <PieChart /> },
            { label: "Feedback", to: "/feedback", icon: <Sparkles /> },
            { label: "Community's", to: "/community", icon: <Map /> },
        ],
    },
];

export default function PrivateLayout() {
    const {isAuth} = useContext(AuthContext)
    const navigate = useNavigate()

    if(!isAuth){
        navigate('/login')
    }
    return (
        <div className="flex">
            <aside className="w-64 bg-gray-800 text-white h-screen p-4">
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Dashboard</h2>
                </div>
                {data.map((group, index) => (
                    <div key={index} className="mb-4">
                        <h3 className="text-lg font-semibold">{group.title}</h3>
                        <ul>
                            {group.items.map((item, idx) => (
                                <li key={idx} className="my-2">
                                    <Link to={item.to} className="flex items-center">
                                        {item.icon}
                                        <span className="ml-2">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <div className="mt-auto">
                    <button className="flex items-center w-full text-left p-2 hover:bg-gray-700">
                        <LogOut />
                        <span className="ml-2">Logout</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    );
}
