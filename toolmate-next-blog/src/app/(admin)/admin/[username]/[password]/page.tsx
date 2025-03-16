'use client'
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function page() {
    const { username, password } = useParams()
    const [isLoading, setIsloading] = useState(true)
    const [isAuth, setIsAuth] = useState(false)
    useEffect(() => {
        if (username && password) {
            setIsloading(false)
            if (username === 'allan8585684' && password === 'allan52495204952348059284305') {
                setIsAuth(true)
            }
        }
    }, [username, password])


    return (
        <div className="bg-white">
            {isLoading && <h1>Loading...</h1>}
            {!isAuth && <h1>Nothign to see here ! call admin </h1>}

        </div>
    )
}