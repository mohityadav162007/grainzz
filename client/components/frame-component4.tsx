import type { NextPage } from "next";
import Image from "next/image";

export type FrameComponent4Type = {
  className?: string;
};

const FrameComponent4: NextPage<FrameComponent4Type> = ({ className = "" }) => {
  return (
    <div
      className={`self-stretch flex items-center justify-between py-6 px-20 gap-5 ${className}`}
    >
      <div className="w-[178px] flex flex-col items-start">
        <Image
          className="w-full relative max-h-full h-auto object-cover"
          loading="lazy"
          width={164}
          height={50}
          sizes="100vw"
          alt=""
          src="/image-2@2x.png"
        />
      </div>
      <div className="w-[452px] rounded-[999px] border-[#8e8e8e] border-solid border-[1px] box-border flex items-center py-3 pl-[22px] pr-8 gap-2">
        <Image
          className="w-[26px] relative max-h-full"
          width={26}
          height={26}
          sizes="100vw"
          alt=""
          src="/search.svg"
        />
        <input
          className="w-[calc(100%_-_80px)] [border:none] [outline:none] font-sans text-lg bg-[transparent] relative leading-[140%] text-[#707070] text-left inline-block"
          placeholder="Search for.. "
          type="text"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-[50px] w-[50px] flex flex-col items-center justify-center">
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto"
            width={38}
            height={38}
            sizes="100vw"
            alt=""
            src="/account-circle.svg"
          />
        </div>
        <div className="h-[50px] w-[50px] flex flex-col items-center justify-center">
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto"
            width={38}
            height={38}
            sizes="100vw"
            alt=""
            src="/shopping-cart.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default FrameComponent4;
