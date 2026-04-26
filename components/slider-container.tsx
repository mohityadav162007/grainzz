import type { NextPage } from "next";
import Image from "next/image";

export type SliderContainerType = {
  className?: string;
};

const SliderContainer: NextPage<SliderContainerType> = ({ className = "" }) => {
  return (
    <div
      className={`self-stretch flex flex-col items-center gap-3 z-[1] ${className}`}
    >
      <Image
        className="self-stretch h-[579px] relative max-w-full overflow-hidden shrink-0 object-cover"
        width={1440}
        height={579}
        sizes="100vw"
        alt=""
        src="/Slider-Background@2x.png"
      />
      <div className="flex items-center py-0 px-5 gap-3">
        <div className="h-[50px] w-[50px] flex flex-col items-center justify-center py-6 px-0 box-border opacity-[0.4]">
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto shrink-0"
            width={34}
            height={34}
            sizes="100vw"
            alt=""
            src="/chevron-backward2.svg"
          />
        </div>
        <div className="flex items-center gap-1">
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-[48px] relative max-h-full"
            width={48}
            height={34}
            sizes="100vw"
            alt=""
            src="/chevron-backward1.svg"
          />
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-[34px] relative max-h-full"
            width={34}
            height={34}
            sizes="100vw"
            alt=""
            src="/chevron-backward.svg"
          />
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-[34px] relative max-h-full"
            width={34}
            height={34}
            sizes="100vw"
            alt=""
            src="/chevron-backward.svg"
          />
        </div>
        <div className="h-[50px] w-[50px] flex flex-col items-center justify-center py-6 px-0 box-border">
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto shrink-0"
            width={34}
            height={34}
            sizes="100vw"
            alt=""
            src="/chevron-forward.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default SliderContainer;
