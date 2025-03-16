import Logo from "./Logo";
import MateyExpression from "./MateyExpression";

export default function LoadingPage({
    title
}: {
    title: string
}) {
    return (
        <div
            className="p-4 w-full h-full bg-gray-100"
        >
            {/* <Logo /> */}
            <div className="flex items-center justify-center flex-col w-full h-[calc(100vh-200px)] ">
                <img
                    className={'motion-scale-in-[0.5] motion-translate-x-in-[-120%] motion-translate-y-in-[-60%] motion-opacity-in-[33%] motion-rotate-in-[-1080deg] motion-blur-in-[10px] motion-delay-[0.38s]/scale motion-duration-[0.38s]/opacity motion-duration-[1.20s]/rotate motion-duration-[0.15s]/blur motion-delay-[0.60s]/blur motion-ease-spring-bouncier motion-iteration-infinite'}
                    src="/assets/matey-emoji/tool.svg"
                    alt="tool"
                    width={55}
                    height={55}
                />
                <p className="font-semibold text-lg animate-pulse text-black">{title}</p>
            </div>
        </div>
    )
}