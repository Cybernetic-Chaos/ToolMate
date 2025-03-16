import { useState, FormEvent, useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { AuthContext } from "@/context/AuthContext"
import { LoaderCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Helper function to encrypt and decrypt data using Base64
const encryptData = (data: string) => btoa(data);
const decryptData = (data: string) => atob(data);

const Page: React.FC = () => {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const { setUserData, setIsAuth } = useContext(AuthContext)
    const [attempts, setAttempts] = useState<number>(0);
    const [timeoutEnd, setTimeoutEnd] = useState<number | null>(null);
    const navigate = useNavigate()
    useEffect(() => {
        const storedAttempts = localStorage.getItem('userInteraction');
        const storedTimeoutEnd = localStorage.getItem('userInteractionTime');

        if (storedAttempts && storedTimeoutEnd) {
            setAttempts(parseInt(decryptData(storedAttempts)));
            setTimeoutEnd(parseInt(decryptData(storedTimeoutEnd)));
        }
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        // Check if user is currently rate-limited
        const now = Date.now();
        if (timeoutEnd && now < timeoutEnd) {
            setError(true);
            const remainingTime = Math.ceil((timeoutEnd - now) / 60000); // minutes
            setErrorMessage(`Rate limited. Try again in ${remainingTime} minute(s).`);
            return;
        }

        setLoading(true);
        const serverUrl = import.meta.env.VITE_SERVER_URL!;

        try {
            const data = await axios.post(`${serverUrl}/api/v1/admin/login`, {
                username,
                password,
            });
            console.log(data)
            // On successful login
            setError(false);
            setAttempts(0);
            if (data.status === 200) {
                // update the user context
                setUserData({
                    username: data.data.username,
                    role: data.data.permissions,
                });
                setIsAuth(true)
                navigate('/dashboard');
            }
            localStorage.removeItem('userInteraction');
            localStorage.removeItem('userInteractionTime');
        } catch (error) {
            console.error(error);
            setError(true);
            setErrorMessage("Login failed. Please check your credentials.");

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 5) {
                // Add 5 minutes to the timeout for each failed attempt beyond 5
                const newTimeoutEnd = Date.now() + (newAttempts - 4) * 5 * 60000;
                setTimeoutEnd(newTimeoutEnd);
                localStorage.setItem('userInteractionTime', encryptData(newTimeoutEnd.toString()));
            }

            localStorage.setItem('userInteraction', encryptData(newAttempts.toString()));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                setError(false);
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [error]);

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        You Are Not Logged In Yet! Please Enter Your Credentials Below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        {error && (
                            <div className="bg-red-100 text-red-500 p-2 rounded-md">
                                {errorMessage}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Username</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full text-white">
                            {loading ? <LoaderCircle className="animate-spin " /> : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Page;
