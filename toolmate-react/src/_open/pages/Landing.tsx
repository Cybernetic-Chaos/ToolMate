import DemoVideo from "@/components/custom/DemoVideo";
import CommunityExample from "@/components/custom/CommunityExample";
import FeatureWindow from "@/components/custom/FeatureWindow";
import Price from "@/components/custom/Price";
import ButtonCustom from "@/components/custom/ButtonCustom";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { MobileMock } from "@/components/custom/Mobile-mock";



const largeFeatureCardsContent = [
  {
    icon: "/assets/icons/largeOrangeToolbox.svg",
    titleLable: "Tailored for Your Project",
    title: "Find the Perfect Tool for Every Job",
    desc: "Matey suggests the right tools for your DIY needs, ensuring efficiency.",
    ctaText: "Find Tools with Matey",
    mateyImagePath: "/assets/images/temp.png",
    leftGradient: true,
  },
  {
    icon: "/assets/icons/priceTag.svg",
    titleLable: "Tools That Fit Your Budget",
    title: "Get the Best Tools at the Best Prices",
    desc: "Matey offers budget-friendly tool suggestions for all DIYers.",
    ctaText: "Budget-Friendly Tools",
    mateyImagePath: "/assets/images/temp2.png",
    leftGradient: false,
  },
  {
    icon: "/assets/icons/helmet.svg",
    titleLable: "Work Smarter, Work Safer",
    title: "Always Equipped with the Right Safety Gear",
    desc: "Matey recommends the best protective gear for safe DIY projects.",
    ctaText: "Safeguard DIY Project",
    mateyImagePath: "/assets/images/temp.png",
    leftGradient: true,
  },
];

export default function Landing() {


  return (
    <div className="w-full capitalize flex items-center justify-center">

      <div className="md:px-20 px-2 scroll-smooth overflow-x-hidden max-w-[1480px]">
        <div className="md:mt-28 mt-20">
          {/* hero section */}
          <section className="flex justify-between md:flex-row flex-col md:p-12 p-2 relative">
            {/* left side */}
            <div className="text-center md:justify-start justify-center md:items-start items-center md:text-left md:w-2/3 max-w-2/5 place-content-center flex flex-col gap-8">
              <p className="text-transparent flex md:hidden justify-center items-center w-full text-center bg-clip-text bg-gradient-to-r from-black to-black font-extrabold text-4xl sm:text-5xl leading-tight">
                Find The Right Tool For Every DIY Job!
              </p>
              <p className="text-transparent text-center hidden sm:block md:block lg:block bg-clip-text bg-gradient-to-r from-black to-black font-[1000] sm:text-6xl md:text-8xl lg:text-8xl text-6xl sm:text-left md:text-left lg:text-left">
                Find The Right<br /> Tool For
                Every <br /> DIY Job!
              </p>
              <p className="md:w-2/3 text-center font-bold md:text-lg text-md w-full md:text-left">
                Meet Matey, your ultimate DIY companion. From novices to experts, Matey guides you to the perfect tools for every project.
              </p>
              <div className="md:block flex gap-2 items-center justify-center md:justify-start md:items-start ">
                <ButtonCustom
                  navigator="/preview"
                  text="Chat With Matey Now"
                  isArrow={true}
                  isDark={true}
                />
              </div>
              <div className="flex gap-2 flex-col mt-5">
                {/* users */}
                <div className="font-bold text-3xl items-center gap-10 text-left w-fit flex  ">
                  <div>
                    <img
                      src="/assets/icons/image.png"
                      alt="user"
                      className="max-w-32 md:block hidden"
                      width={220}
                    />
                  </div>
                  {/* <Separator
                  orientation="vertical"
                  className="border border-gray"
                /> */}
                  {/* <div className="flex items-center flex-col text-left">
                  <p className="font-semibold text-left opacity-80 text-slate-500 text-md">
                    Trusted by People
                  </p>
                  <p className="font-mono md:text-2xl text-lg">100K+ Users</p>
                </div> */}
                </div>
              </div>
            </div>


            <div className="md:p-2 py-5 w-full md:w-3/5 h-full flex justify-center items-start">
              <div className="md:mt-0 hidden md:flex  absolute md:w-[700px]  md:h-[700px] w-[400px] -top-9  -z-20 justify-center bg-[url('/assets/images/square.svg')] bg-cover bg-center bg-no-repeat"></div>
              <MobileMock />
            </div>
          </section>
          <div className="w-full items-center flex justify-center">
            <img
              src="/assets/icons/image.png"
              alt="user"
              className="max-w-32 md:hidden block"
              width={220}
            />
          </div>

          {/* demo video section */}
          <section className="w-full mt-5 md:mt-10">
            {/* main/base */}
            <div className="bg-white p-0 rounded-2xl px-0">

              <DemoVideo />
            </div>
          </section>






          {/* grid stock video section */}
          <div id="impact" className="mb-10 p-6"></div>
          <p className="hidden md:block md:text-8xl text-4xl my-5 font-black text-center px-4 h-full">
            How
            <span className="text-orange text-left"> Matey </span>
            Simplifies Your <br />
            DIY Journey
          </p>
          <p className="text-4xl block md:hidden font-bold leading-8 my-3">How <span className="text-orange text-left"> Matey </span> Simplifies Your DIY Journey </p>

          <div className="flex items-center justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:w-[calc(100%-5rem)]">
              {/* card 1 */}
              <div className="relative col-span-1 md:col-span-2 bg-slate-400 rounded-3xl shadow-md h-[350px] md:h-[440px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  src="public/assets/images/bg-1.jpg"
                />
                <div
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl bg-gradient-to-br from-black/60 via-black/30 to-transparent"
                />
                <div className="absolute inset-0 bg-black opacity-35 rounded-3xl"></div>
                <div className="relative z-10 p-7 drop-shadow-sm h-full text-left flex flex-col justify-between">
                  {/* content */}
                  <div>
                    <p className="md:text-5xl text-3xl md:w-3/4 w-full font-bold text-white">
                      Find the Right Tools Fast
                    </p>
                    <p className="text-slate-300 text-xl font-bold mt-4 w-3/4</p>">
                      Effortlessly discover the perfect tools tailored to your
                      unique projects.
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    to={"/preview"}
                    className="w-fit bg-orange hover:bg-lightOrange rounded-lg px-4 py-2  text-white hover:bg-transparent hover:text-orange border-2 border-orange"
                  >
                    <p className="font-bold">Explore Tool Suggestions</p>
                  </Link>
                </div>
              </div>

              {/* card2 */}
              <div className="relative bg-slate-400 rounded-3xl shadow-md md:h-[440px] h-[200px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  src="/assets/images/tools.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent rounded-3xl"></div>


                <div className="relative z-10 p-7 drop-shadow-sm h-full text-left flex flex-col justify-between">
                  {/* content */}
                  <div>
                    <p className="md:text-5xl text-3xl md:w-3/4 w-full font-bold text-white">
                      Your Project, Your Tools, One Click
                    </p>
                    <p className="text-slate-300 text-xl font-semibold mt-4 w</p>-3/4">
                      Get a complete list of what you need, instantly.
                    </p>
                  </div>
                </div>
              </div>

              {/* card3 */}
              <div className="relative bg-slate-400 rounded-3xl shadow-md h-[440px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  src="/assets/images/personalized.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/40 to-transparent rounded-3xl"></div>

                <div className="relative z-10 p-7 drop-shadow-sm h-full text-left flex flex-col justify-between">
                  {/* content */}
                  <div>
                    <p className="md:text-5xl text-3xl md:w-3/4 w-full font-bold text-white">
                      Keep Track of Every Project and Tool
                    </p>
                    <p className="text-white text-xl font-semibold mt-4 w-3/4">
                      Personalized help based on what you've used before.
                    </p>
                  </div>
                </div>
              </div>

              {/* card 4 */}
              <div className="relative col-span-1 md:col-span-2 bg-slate-400 rounded-3xl shadow-md h-[440px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                  src="public/assets/images/bg-3.jpg"
                />
                <div
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl bg-gradient-to-br from-black/90 via-black/30 to-transparent"
                />
                <div className="absolute inset-0 bg-black opacity-35 rounded-3xl"></div>
                <div className="relative z-10 p-7 drop-shadow-sm h-full text-left flex flex-col justify-between">
                  {/* content */}
                  <div>
                    <p className="md:text-5xl text-3xl p-0 md:w-3/4 w-full font-bold text-white">
                      Join a DIY Community
                    </p>
                    <p className="text-slate-300 text-xl font-bold mt-4 w-3/4">
                      Connect, share, and learn with fellow DIY enthusiasts through
                      our dedicated community.
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    to={"/preview"}
                    className="w-fit bg-orange hover:bg-lightOrange rounded-lg px-4 py-2 text-white hover:bg-transparent hover:text-orange border-2 border-orange"
                  >
                    <p className="font-bold">Join the DIY Community</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* community section */}
          <div className="w-full flex items-center justify-center ">

            <div className="md:mx-16 w-full md:w-[calc(100%-5rem)]">

              <p className="md:text-8xl text-4xl font-bold leading-7 mt-20 block md:flex gap-3">
                Explore
                <span className="text-orange text-left"> Interactive </span>
                Community
              </p>
              {/* content */}
              <CommunityExample />
            </div>
          </div>

          {/* feature window section */}
          <div id="features" className="mb-10 md:p-6 p-0 md:px-2 px-0"></div>

          <div className="mt-30">
            {/* header */}
            <p className="md:text-8xl text-4xl  font-black hidden md:block">
              Every Tool You Need,
              <span className="text-orange"> Matey’s </span>
              Got You Covered!
            </p>
            <FeatureWindow />
          </div>

          {/* price page */}

          <div className="my-20 md:my-36">
            {/* header */}
            <p className="md:text-8xl text-4xl my-5 font-black md:text-center text-left px-4">
              Get Started With
              <span className="text-orange text-left"> ToolMate </span>
              Today
            </p>
            {/* prices */}

            <Price />
          </div>
        </div>
      </div>
    </div>
  );
}
