import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";
import Tab from "./tab";

export type TabGroupType = {
  className?: string;
  property1?: any;
  property2?: any;
};

const TabGroup: NextPage<TabGroupType> = ({
  className = "",
  property1,
  property2,
}) => {
  return (
    <div
      className={`flex items-center flex-wrap content-center gap-5 ${className}`}
    >
      <button className="cursor-pointer [border:none] py-2 px-6 bg-brand-green rounded-[99px] flex items-center justify-center gap-2">
        <Image
          className="w-[34px] relative max-h-full object-cover"
          width={34}
          height={34}
          sizes="100vw"
          alt=""
          src="/image-K6ajnEunSyn0dpLf3ZXfW4cvI1dCO3-1@2x.png"
        />
        <div className="relative text-lg leading-[132%] font-medium font-sans text-[#fff] text-left">
          Bestsellers
        </div>
      </button>
      <Tab property1={property1} property2={property2} />
      <button className="cursor-pointer [border:none] py-2 px-6 bg-[transparent] rounded-[99px] flex items-center justify-center gap-2">
        <Image
          className="w-[34px] relative max-h-full object-cover"
          width={34}
          height={34}
          sizes="100vw"
          alt=""
          src="/image-K6ajnEunSyn0dpLf3ZXfW4cvI1dCO3-11@2x.png"
        />
        <div className="relative text-lg leading-[134%] font-medium font-sans text-brand-black text-left">
          Healthy Chips
        </div>
      </button>
      <button className="cursor-pointer [border:none] py-2 px-6 bg-[transparent] rounded-[99px] flex items-center justify-center gap-2">
        <Image
          className="w-[34px] relative max-h-full object-cover"
          width={34}
          height={34}
          sizes="100vw"
          alt=""
          src="/Gemini-Generated-Image-2j4clz2j4clz2j4c-1-1@2x.png"
        />
        <div className="relative text-lg leading-[134%] font-medium font-sans text-brand-black text-left">
          Grain Puffs
        </div>
      </button>
    </div>
  );
};

export default TabGroup;
