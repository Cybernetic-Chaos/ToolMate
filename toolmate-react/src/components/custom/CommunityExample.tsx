import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";

export default function CommunityExample() {
  const communityState = [
    {
      name: "Awesome Community 1",
      members: 100,
      tag: "most active",
      description:
        "This is the most active community. Join now to connect with like-minded individuals and participate in engaging discussions.",
      cta: "Join Now",
    },
    {
      name: "Awesome Community 2",
      members: 50,
      tag: "popular",
      description:
        "This is a popular community. Explore a wide range of topics, share your knowledge, and learn from others.",
      cta: "Learn More",
    },
    {
      name: "Awesome Community 3",
      members: 200,
      tag: "new group",
      description:
        "This is a new community. Be one of the first members and help shape the future of this vibrant community.",
      cta: "Get Started",
    },
    {
      name: "Awesome Community 4",
      members: 75,
      tag: "most active",
      description:
        "This is the most active community. Join now to connect with like-minded individuals and participate in engaging discussions.",
      cta: "Join Now",
    },
    {
      name: "Awesome Community 5",
      members: 120,
      tag: "popular",
      description:
        "This is a popular community. Explore a wide range of topics, share your knowledge, and learn from others.",
      cta: "Learn More",
    },
    {
      name: "Awesome Community 6",
      members: 90,
      tag: "new group",
      description:
        "This is a new community. Be one of the first members and help shape the future of this vibrant community.",
      cta: "Get Started",
    },
  ];

  return (
    <section className="w-full mt-5 md:mt-10">

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="flex w-full">
          {communityState.map((community, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 w-full  lg:basis-1/3  flex justify-between "
            >
              <div className="border border-slate-300 rounded-2xl flex flex-col justify-between overflow-hidden bg-gradient-to-tr bg-slate-50">
                {/* top side  */}
                <div className="p-4">
                  {/* community header and profile image section */}
                  <div className="flex items-center gap-4 my-2">
                    <img src="/assets/icons/dummyCommuIcon.svg" alt="" />
                    <p className="font-semibold text-lg">{community.name}</p>
                  </div>
                  <Separator className="border border-slate-300" />

                  {/* communit follower and tag section */}
                  <div className="flex justify-between my-3 ">
                    {/* memeber count */}
                    <p className="text-lg font-semibold">
                      {community.members} members
                    </p>

                    {/* tag */}
                    <div className="px-2 py-1 text-center flex items-center justify-center  bg-lightOrange rounded-md capitalize text-md">
                      {community.tag}
                    </div>
                  </div>

                  {/* description */}
                  <div className="text-left">
                    <p className="font-normal text-lg">Description</p>
                    <p className="text-slate-600">{community.description}</p>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full p-4 bg-lightOrange hover:bg-orange transition-all duration-300 ease-in-out">
                  <p className="font-semibold">{community.cta}</p>
                </button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute md:w-14  h-10 w-10 left-5 bottom-0 bg-lightOrange hover:bg-lightOrange border-2 border-black" />
        <CarouselNext className="absolute md:w-14 h-10 w-10 right-5 bg-lightOrange hover:bg-lightOrange border-2 border-black" />
      </Carousel>
    </section>
  );
}

// <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
//                 <div className="border-2 p-4 border-slate-400 bg-gradient-to-tr from-white via-white to-lightyellow-500rounded-lg ">
//                   <div>
// {/* community header and profile image section */}
// <div className="flex items-center gap-4 mb-2">
//   <img
//     src="/assets/icons/dummyCommuIcon.svg"
//     alt=""
//   />
//   <p className="font-semibold text-lg">{community.name}</p>
// </div>
// <Separator className="border border-slate-300" />

// {/* communit follower and tag section */}
// <div className="flex justify-between my-1">
//   {/* memeber count */}
//   <p className="text-lg font-medium">
//     {community.members} members
//   </p>

//   {/* tag */}
//   <div className="p-2 bg-yellow-500rounded-sm px-2 capitalize">
//     {community.tag}
//   </div>
// </div>

// {/* description */}
// <div className="text-left">
//   <p className="font-semibold text-lg">Description</p>
//   <p className="text-slate-600">{community.description}</p>
// </div>
//                   </div>
//                 </div>
//                 {/* CTA */}
//                 <div className="w-full overflow-hidden bg-black">
//                   <button>{community.cta}</button>
//                 </div>
//               </CarouselItem>
