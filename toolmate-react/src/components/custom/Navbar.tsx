"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Logo from "./Logo";
import { Button, buttonVariants } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, LoaderPinwheel } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignOutButton, useAuth } from "@clerk/clerk-react";

// Dropdown components example
const components: { title: string; href: string; description: string, icon: string }[] = [
  {
    title: "Matey",
    href: "/preview",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
    icon: "/assets/mobileNavIcons/hammer.svg"
  },

];


const info: { title: string; href: string; description: string, icon: string }[] = [
  {
    title: "Help & Support",
    href: "/help",
    description:
      "Get help with your account, billing, and more.",
    icon: "/assets/mobileNavIcons/help.svg"
  },
  {
    title: "About",
    href: "/about",
    description: "Learn more about Toolmate and our team.",
    icon: "/assets/mobileNavIcons/about.svg"
  },
  {
    title: "Contact Us",
    href: "/contact",
    description: "Reach out to us for help or feedback.",
    icon: "/assets/mobileNavIcons/contact.svg"
  },
  {
    title: "Partner",
    description: "Join our partner program to grow your business.",
    href: "/partner",
    icon: "/assets/mobileNavIcons/partner.svg"
  },
]


// Define the structure of NavItem to handle dropdown
type NavItem = {
  name: string;
  href?: string; // href for normal links
  icon?: string; // icon for normal links
  dropdown?: { title: string; href: string; description: string, icon: string }[]; // dropdown links
  isMobileShow?: boolean;
};

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: "/assets/mobileNavIcons/home.svg"
  },
  // {
  //   name: "Products", // Dropdown example
  //   dropdown: components,
  //   icon: "/assets/mobileNavIcons/box.svg"
  // },
  {
    name: "Pricing",
    href: "/pricing",
    icon: "/assets/mobileNavIcons/percentage.svg"
  },
  {
    name: "Impact",
    href: "#impact",
    icon: "/assets/mobileNavIcons/impact.svg",
    isMobileShow: false,
  },
  {
    name: "Features",
    href: "#features",
    icon: "/assets/mobileNavIcons/impact.svg",
    isMobileShow: false,
  },

  {
    name: "Blog",
    href: "/blog",
    icon: "/assets/mobileNavIcons/blog.svg"
  },
  {
    name: "About",
    href: "/about",
    icon: "/assets/mobileNavIcons/about.svg"
  }
];
const navItemsOther: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: "/assets/mobileNavIcons/home.svg"
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: "/assets/mobileNavIcons/percentage.svg"
  },
  {
    name: "Blog",
    href: "/blog",
    icon: "/assets/mobileNavIcons/blog.svg"
  },
  {
    name: "About",
    href: "/about",
    icon: "/assets/mobileNavIcons/about.svg"
  }
];

export default function Navbar() {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = React.useState(false);
  const [renderNavItem, setRenderNavItem] = React.useState(navItemsOther);
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const currentRoute = location.pathname;
  React.useEffect(() => {
    if (currentRoute === "/") {
      setRenderNavItem(navItems)
    } else {
      setRenderNavItem(navItemsOther)
    }
  }, [currentRoute])
  return (
    <div className="w-full items-center justify-center z-50 bg-white/50 backdrop-blur-md shadow-md fixed top-0">
      <div className="max-w-[1450px] top-0 left-0 md:pt-0 pt-2 w-full right-0 mx-auto">
        {/* desktop navigation menu */}
        <div className="justify-between items-center m-0 p-2 hidden md:flex px-24">
          <Logo />

          <NavigationMenu>
            <NavigationMenuList>
              {renderNavItem.map((item) => (
                <NavigationMenuItem
                  key={item.name}
                  className="bg-transparent text-black"
                >
                  {item.dropdown ? (
                    <>
                      <NavigationMenuTrigger className="hover:bg-ligherYellow font-semibold">
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.dropdown.map((dropdownItem) => (
                            <ListItem
                              className="hover:bg-lightYellow list-none"
                              key={dropdownItem.title}
                              title={dropdownItem.title}
                              href={dropdownItem.href}
                            >
                              {dropdownItem.description}
                            </ListItem>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <a href={item.href}>
                      <NavigationMenuLink
                        className={`${navigationMenuTriggerStyle()} hover:bg-lightYellow text-black font-semibold`}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    </a>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div>
            <div className="w-full flex  items-center">
              {isLoaded && isSignedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`${buttonVariants({
                      variant: "orangeGradient",
                    })}`}
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <div>
                  <Link
                    to="/signin"
                    className="font-bold font-roboto transition-all p-1 rounded-md px-3 cursor-pointer"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`${buttonVariants({
                      variant: "orangeGradient",
                    })} text-lg p-0`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}



            </div>
          </div>
        </div>

        {/* mobile navigation menu */}

        <div className="flex px-2 py-1 md:hidden items-center justify-between">
          <Logo />
          <Sheet>
            <SheetTrigger>
              <div className=" w-12 h-12  flex justify-center items-center">
                <img src="/assets/line2.svg" alt="menu" className="w-8 h-8" />
              </div>
            </SheetTrigger>
            <SheetContent side={"left"} className=" overflow-y-auto max-h-[calc(100vh)] ">
              <SheetHeader>
                <div className="absolute top-9  right-0  w-full flex justify-start flex-col ">
                  <SheetTitle className=" px-2 py-1 w-full">
                    <div className="w-full flex  items-center">
                      {isLoaded && isSignedIn ? (
                        <>
                          <Link
                            to="/dashboard"
                            className={`w-full text-md ${buttonVariants({
                              variant: "orangeGradient",
                            })}`}
                          >
                            Go to Dashboard
                          </Link>
                        </>
                      ) : (
                        <div>
                          <Link
                            to="/signin"
                            className="underline font-bold text-base font-roboto transition-all p-1 rounded-md px-3 cursor-pointer"
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            className={`${buttonVariants({
                              variant: "orangeGradient",
                            })}`}
                          >
                            Sign Up
                          </Link>
                        </div>
                      )}



                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    <hr />
                    <div className="flex flex-col mt-8">
                      {navItems.map((item) => {
                        const isActive = currentRoute === item.href;
                        const isMobileShow = item.isMobileShow == false ? false : true;
                        return (
                          <div key={item.name} className={`${isMobileShow ? "" : "hidden"} `}>
                            {item.dropdown ? (
                              <div>
                                {/* header */}
                                <div className="mx-4 py-1 flex">
                                  <img src={item.icon} alt="" />
                                  <p className="text-slate-500 px-7 py-[2px] font-bold text-base text-left">
                                    {item.name}
                                  </p>
                                </div>

                                {/* items */}
                                <div className="border-l-2 border-slate-300 ml-7">
                                  {item.dropdown.map((dropdownItem) => {
                                    const isActive = currentRoute === dropdownItem.href;
                                    return (
                                      <div
                                        key={dropdownItem.title}
                                        className={`${isActive ? "bg-lightOrange" : ""} flex items-center`}
                                      >
                                        <Link to={dropdownItem.href} className="flex">
                                          <img
                                            src={dropdownItem.icon}
                                            alt="icon"
                                            className={`${isActive ? "text-white" : ""
                                              } w-6 h-6 mx-2`}
                                          />
                                          <p className="text-slate-500 px-4 py-[2px] font-bold text-base text-left">
                                            {dropdownItem.title}
                                          </p>
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`${isActive ? "bg-lightOrange " : ""
                                  } rounded-md mx-2 py-1`}
                              >
                                <Link to={item.href || "/"} className="flex gap-2 items-center">
                                  <img
                                    src={item.icon}
                                    alt="icon"
                                    className={`${isActive ? "text-white" : "text-black"
                                      } w-6 h-6 mx-2`}
                                  />
                                  <p className="text-black px-4 py-[2px] font-bold text-base text-left">
                                    {item.name}
                                  </p>
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SheetDescription>
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div >

    </div>
  );
}

// ListItem component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <div>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 list-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-md font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-md leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </div>
  );
});
ListItem.displayName = "ListItem";
