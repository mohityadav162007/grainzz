import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type TabType = {
  className?: string;

  /** Variant props */
  property1?: any;
  property2?: any;
};

const Tab: NextPage<TabType> = ({
  className = "",
  property1 = "Large",
  property2 = "Default",
}) => {
  return (
    <button
      className={`cursor-pointer [border:none] py-2 px-6 bg-[transparent] rounded-[99px] flex items-center justify-center gap-2 ${className}`}
    >
      <Image
        className="w-[34px] relative max-h-full object-cover"
        width={34}
        height={34}
        sizes="100vw"
        alt=""
        src="/Gemini-Generated-Image-3aabw13aabw13aab-1@2x.png"
      />
      <div className="relative text-lg leading-[134%] font-medium font-sans text-brand-black text-left">
        Puffed Rice
      </div>
    </button>
  );
};

export default Tab;
