import { createContext, ReactNode, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { env } from "@/lib/environment";
import { useAuth } from "@clerk/clerk-react";
import { ChatItem, iChatname } from '@/types/types';
import { useNavigate } from 'react-router-dom';


interface UserData {
    planAccess: [boolean, boolean, boolean];
    id: string;
    activePlan: string;
    sideBarHisotry: iChatname[];
    isFree?: boolean | null,
    route?: string | null
    suspendedPlan?: string | null
}

interface UserContextType {
    userId: string | null | undefined;
    userData: UserData | undefined;
    historyData: iChatname[] | undefined;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    isOverdue: boolean;
    newIdForCache: (id: string) => void;
    unshiftiChatname: (newItem: ChatItem) => void;
    retrieveCache: () => ChatItem[];
    deleteCacheElement: (id: string) => void,
    setIsOverdue: (status: boolean) => void
}

const INITIAL_USER_DATA: UserContextType = {
    userId: undefined,
    userData: undefined,
    historyData: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    isOverdue: false,
    unshiftiChatname: () => { },
    newIdForCache: () => { },
    retrieveCache: () => { return [] },
    deleteCacheElement: () => { },
    setIsOverdue: () => { }
};

const UserContext = createContext<UserContextType>(INITIAL_USER_DATA);

function UserContextProvider({ children }: { children: ReactNode }) {
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const [isOverdue, setIsOverdue] = useState<boolean>(false);
    const navigate = useNavigate()
    const { data: userData, isLoading, isError, isFetching } = useQuery<UserData, Error>({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error("User ID is not available");
            }
            console.log(userId, "userId");
            const response = await axios.post<{ data: UserData, route: string | null }>(`${env.domain}/api/v1/getUserPaidAndPersonalInfo`, {
                clerkUserId: userId,
            });
            console.log(
                response.data.data,
                "response.data.datasdfsdfsdfsd"
            )
            if (response.data.route !== null) {
                if (response.data.route === "/overdue") {
                    setIsOverdue(true)
                }
                console.log("redirecting to ", response.data)
                navigate(response.data.route)
            }
            const res = response.data.data;

            return res;
        },
        enabled: !!userId,                  // Only run the query if userId exists
        refetchOnWindowFocus: false,         // No refetch on window focus
        refetchOnReconnect: false,           // No refetch when network reconnects
        refetchInterval: false,              // No periodic refetch
        staleTime: Infinity,                 // Data is always considered fresh
        // Cache data forever (you can change this if you want a specific time)
    });
    useEffect(() => {
        console.log(userData?.id, "userId");
    }, [userData?.id])


    function deleteCacheElement(id: string) {
        const tempCache = JSON.parse(localStorage.getItem("tempCache") || "[]");
        const mainCache = JSON.parse(localStorage.getItem("mainCache") || "[]");

        const newTempCache = tempCache.filter((item: {
            id: string,
            usage: number
        }) => item.id !== id);

        const newMainCache = mainCache.filter((item: string) => item !== id);

        localStorage.setItem("tempCache", JSON.stringify(newTempCache))
        localStorage.setItem("mainCache", JSON.stringify(newMainCache))

    }

    function newIdForCache(id: string) {
        // Initialize caches if they don't exist
        const tempCache = JSON.parse(localStorage.getItem("tempCache") || "[]");
        const mainCache = JSON.parse(localStorage.getItem("mainCache") || "[]");

        // Add new ID to temp cache if it's not already there
        const existingTempId = tempCache.find((item: any) => item.id === id);
        if (existingTempId) {
            // If ID is in tempCache, increase its usage count
            existingTempId.usage += 1;
        } else {
            // If not in tempCache, add it with usage count of 1
            tempCache.push({ id, usage: 1 });
        }

        // Sort tempCache by usage in descending order
        tempCache.sort((a: any, b: any) => b.usage - a.usage);

        // Keep tempCache to a maximum of 10 items
        if (tempCache.length > 10) {
            tempCache.pop();
        }

        // Check if any IDs should be promoted to main cache
        const mostUsedIds = tempCache.filter((item: any) => item.usage >= 3);  // Threshold for high usage
        mostUsedIds.forEach((item: any) => {
            if (!mainCache.includes(item.id)) {
                mainCache.push(item.id);
            }
        });

        // Keep mainCache to a maximum of 6 items
        if (mainCache.length > 6) {
            mainCache.shift();  // Remove oldest entry when exceeding limit
        }

        // Update local storage with new tempCache and mainCache
        localStorage.setItem("tempCache", JSON.stringify(tempCache));
        localStorage.setItem("mainCache", JSON.stringify(mainCache));
    }
    function retrieveCache() {
        const mainCache = JSON.parse(localStorage.getItem("mainCache") || "[]");
        console.log("mainCache", mainCache);
        // If no mainCache is available, return top 6 from historyData
        console.log(historyData?.map((item) => item.data).slice(0, 6), "historyData.map((item) => item.data).slice(0, 6)");
        if (mainCache.length === 0 && historyData) {
            console.log(historyData.flatMap((item) => item.data).slice(0, 6), "historyData.map((item) => item.data).slice(0, 6)");
            return historyData.flatMap((item) => item.data).slice(0, 6)
        }
        const resp = mainCache.map((id: string) => {
            const chatItem = historyData?.flatMap((item) => item.data).find((chat) => chat.id === id);
            return chatItem;
        }).filter((item: ChatItem | undefined): item is ChatItem => item !== undefined).slice(0, 6);
        console.log(resp, "here cahce")
        return resp
    }


    const { data: historyData } = useQuery<iChatname[], Error>({
        queryKey: ['chatHistory', userData?.id],
        queryFn: async () => {
            console.log("calling hisotry data");
            if (!userData?.id) {
                throw new Error("User ID is not available");
            }
            console.log(userData.id, "userData.id");
            const response = await axios.post<{ data: iChatname[] }>(`${env.domain}/api/v1/getChatHistory`, {
                userId: userData.id,
            });
            console.log(response.data.data, "response.data.data");
            return response.data.data;
        },
        enabled: !!userData?.id,             // Only run when userData.id exists
        refetchOnWindowFocus: false,         // No refetch on window focus
        refetchOnReconnect: false,           // No refetch when network reconnects
        refetchInterval: false,              // No periodic refetch
        staleTime: Infinity,                 // Data is always considered fresh
    });

    useEffect(() => {
        console.log(historyData, "historyData");
        console.log(userData, "userData");

    }, [historyData, userData])
    const mutation = useMutation<iChatname[], Error, iChatname[], { previousHistory: iChatname[] | undefined }>({
        mutationFn: (newHistory: iChatname[]) => {
            console.log("mutation called");
            return axios.post(`${env.domain}/api/v1/updateChatHistory`, {
                userId: userData?.id,
                newHistory,
            });
        },
        onMutate: async (newHistory: iChatname[]) => {
            await queryClient.cancelQueries({ queryKey: ['chatHistory', userData?.id] });
            const previousHistory = queryClient.getQueryData<iChatname[]>(['chatHistory', userData?.id]);
            queryClient.setQueryData(['chatHistory', userData?.id], newHistory);
            return { previousHistory };
        },
        onError: (_, v, context) => {
            if (context?.previousHistory) {
                queryClient.setQueryData(['chatHistory', userData?.id], context.previousHistory);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['chatHistory', userData?.id] });
        },
    });

    const unshiftiChatname = (newItem: ChatItem) => {
        const today = "today";
        const updatedHistory = historyData ? [...historyData] : [];

        const todayItemIndex = updatedHistory.findIndex((item) => item.dateDiff === today);

        if (todayItemIndex > -1) {
            updatedHistory[todayItemIndex].data.unshift(newItem);
        } else {
            updatedHistory.unshift({
                dateDiff: today,
                data: [newItem],
            });
        }
        console.log(updatedHistory, "updatedHistory");
        mutation.mutate(updatedHistory);
    };

    useEffect(()=>{
        return ()=>{
            setIsOverdue(false)
        }
    })

    const value: UserContextType = {
        userId,
        userData,
        historyData,
        isOverdue,
        isLoading,
        isError,
        isFetching,
        unshiftiChatname,
        setIsOverdue,
        newIdForCache,
        retrieveCache,
        deleteCacheElement
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;
export { UserContext };
