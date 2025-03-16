import { IMateyExpression } from "@/types/types";

export default function MateyExpression({expression}:{expression:IMateyExpression}) {
  const emojiClass = "animate-rotate-shake"; // Tailwind class for rotation effect

  switch (expression) {
    case "laugh":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/largeSmile.svg"
          alt="exited"
          width={55}
          height={55}
        />
      );
    case "hello":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/hello.svg"
          alt="hello"
          width={55}
          height={55}
        />
      );
    case "smile":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/smile.svg"
          alt="happy"
          width={55}
          height={55}
        />
      );
    case "offer":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/take.svg"
          alt="offer"
          width={55}
          height={55}
        />
      );
    case "1thumb":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/thumb1.svg"
          alt="thumb1"
          width={55}
          height={55}
        />
      );
    case "2thumb":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/thumbs2.svg"
          alt="thumb2"
          width={55}
          height={55}
        />
      );
    case "tool":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/tool.svg"
          alt="tool"
          width={55}
          height={55}
        />
      );
    case "thinking":
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/thinking.svg"
          alt="thinking"
          width={55}
          height={55}
        />
      );
    default:
      return (
        <img
          className={emojiClass}
          src="/assets/matey-emoji/smile.svg"
          alt="exited"
          width={55}
          height={55}
        />
      );
  }
}
