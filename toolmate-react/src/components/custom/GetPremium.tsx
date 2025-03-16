import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Price from "./Price";

export default function GetPremium() {
  return (
    <div className="flex justify-between md:w-[400px] w-[500px] h-fit p-5 bg-gradient-to-t from-lightOrange via-softYellow to-paleYellow rounded-lg ">
      {/* icon */}
      <div>
        <img src="/assets/icons/doze.svg" width={80} alt="doze" />
      </div>

      {/* content */}
      <div className="flex flex-col gap-2 text-left">
        {/* text content */}
        <div>
          <p className="font-black text-2xl">Toolmate Pro</p>
          <p className="text-gray">Unlock All Tools Of Toolmate</p>
        </div>

        {/* link */}
        <div>
          <Dialog>
            <DialogTrigger>
              <div className="font-semibold underline hover:font-light">
                Check Features
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-full m-4">
              <div className="w-fit">
                <Price />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
