export function ToolbarLabel({
    name,
    icon
}: {
    name: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center p-2 bg-slate-200 rounded-md w-full">
            <div className="mr-2">
                {icon}
            </div>
            <div className="font-semibold capitalize">
                {name}
            </div>
        </div>
    )
}