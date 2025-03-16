import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null); // Type for video element

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log("flag", entry.isIntersecting);

        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play(); // Start video when visible
        } else if (videoRef.current) {
          videoRef.current.pause(); // Pause video when not visible
        }
      },
      { threshold: 0.5 } // The video must be at least 50% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center p-0 w-full md:h-full">
      <div className="border-1 border-slate-400  w-full  rounded-2xl h-[calc(100%-50px)] md:h-full md:w-[calc(100%-5rem)]">
        <Link to="/preview" className="flex h-[calc(100%-2rem)] items-center gap-2 text-white rounded-2xl w-full md:h-full">
          <video
            ref={videoRef}
            src="sanoke.mp4"
            muted
            className="rounded-3xl w-full "
          ></video>
        </Link>
      </div>
    </div>
  );
}
