import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <>
      <Link to="/" className="w-fit">
        <div className="flex gap-2 font-bold text-2xl ">
          <img src="./assets/full-logo.svg" alt="Logo" />{" "}
     
        </div>
      </Link>
    </>
  );
}
