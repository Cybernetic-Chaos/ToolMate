
import { Link } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CommunityCreationForm } from "@/components/custom/CommunityCreationForm";

export function MyCommunity() {
    return (
        <div className="p-2 mt-9 flex items-start">

            <Dialog>
                <DialogTrigger>
                    <div className="bg-gradient-to-br from-lightYellow to-paleYellow rounded-lg border-2 border-slate-300 w-96 h-52 hover:shadow-lg flex items-center justify-center">
                        <div className="text-center flex justify-center items-center flex-col">
                            <img src="/assets/matey-emoji/newComm.svg" alt="community" className="w-16 h-16" />
                            <p className="text-lg font-semibold">Create New Community</p>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex ml-3 items-center space-x-3">
                            <img
                                src="/assets/matey-emoji/newComm.svg"
                                alt="community"
                                className="w-14 h-14"
                            />
                            <div>
                                <DialogTitle>Create New Community</DialogTitle>
                                <p className="text-sm text-gray-400">Fill in the details to create a new community</p>
                            </div>

                        </div>
                    </DialogHeader>
                    <DialogDescription>
                        <CommunityCreationForm />
                    </DialogDescription>
                </DialogContent>
            </Dialog>


        </div>
    );
}
