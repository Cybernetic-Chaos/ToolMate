import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function ErrorPage({ title }: { title: string }) {

    return (
        <div className="p-4 w-full h-full">
            <Logo />
            <section className="w-full h-full flex flex-col  justify-center items-center">
                <img
                    src="/assets/matey/confident.svg"
                    alt="error"
                    className="w-80 h-80"
                />
                <p className="font-semibold text-xl">{title}</p>
                <Link to="/">
                    <div className="font-semibold p-4 bg-orange rounded-md ">Go back to home</div>
                </Link>

            </section>
        </div>
    )

}