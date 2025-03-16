import ButtonCustom from "./ButtonCustom";

interface LargeFeatureCardProps {
  icon: string;
  titleLable: string;
  title?: string;
  desc: string;
  ctaText?: string;
  mateyImagePath: string;
  leftGradient?: boolean;
}

export default function LargeFeatureCard({
  icon,
  titleLable,
  title,
  desc,
  ctaText,
  mateyImagePath,
  leftGradient = true,
}: LargeFeatureCardProps) {
  console.log(title);
  return (
    <div
      className={`flex justify-between ${
        leftGradient ? "flex-row" : "flex-row-reverse"
      } justify-between border-1 border-yellow ${
        leftGradient ? "bg-gradient-to-l" : "bg-gradient-to-r"
      } from-lightYellow via-white to-white border-2 border-yellow rounded-3xl mt-5 md:px-24 md:py-12 p-5 w-full`}
    >
      {/* left side */}
      <div className={`text-left flex flex-col justify-center gap-8 `}>
        <img src={icon} alt={icon} width={60} height={60} />
        <div>
          <p className={`text-black font-black text-2xl md:text-4xl lg:text-6xl`}>
            {titleLable}
          </p>
          <br />
          <p className={`w-full text-base md:text-xl lg:text-2xl font-bold md:w-3/4`}>
            {desc}
          </p>
        </div>
        <div className="flex gap-2 items-center md:items-start">
          <ButtonCustom
            navigator="/preview"
            text={ctaText || "Chat With Matey Now"}
            isArrow={true}
            isDark={true}
          />
        </div>
      </div>

      {/* right side */}
      <div className="md:block hidden">
        <img
          src={mateyImagePath}
          alt={mateyImagePath}
          width={500}
          height={500}
        />
      </div>
    </div>
  );
}
