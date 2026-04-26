import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type AccordianType = {
  className?: string;

  /** Variant props */
  property1?: CSSProperties["property1"];
};

const Accordian: NextPage<AccordianType> = ({
  className = "",
  property1 = "Accordian Default",
}) => {
  return (
    <div
      className={`self-stretch flex flex-col items-start gap-8 text-left text-[26px] text-brand-black font-sans ${className}`}
    >
      <div className="self-stretch rounded-[14px] border-[#dedede] border-solid border-[1px] flex items-start p-6 gap-[60px]">
        <div className="flex-1 flex flex-col items-start justify-center gap-6">
          <div className="self-stretch relative leading-[132%] font-semibold">
            What makes Grainzz different from regular snacks?
          </div>
          <div className="self-stretch relative text-lg leading-[140%] text-[#555]">
            Most snacks are deep-fried in palm oil and made from refined flour
            (maida). At Grainzz, we do things differently. We use ancient Indian
            supergrains like Jowar, Ragi, and Quinoa, and we slow-roast them
            instead of frying. This gives you the same satisfying crunch with
            zero palm oil, zero trans fat, and way more nutrition.
          </div>
        </div>
        <Image
          className="w-[44px] relative max-h-full object-cover"
          width={44}
          height={44}
          sizes="100vw"
          alt=""
          src="/Hidden-Answer@2x.png"
        />
      </div>
      <div className="self-stretch rounded-[14px] border-[#dedede] border-solid border-[1px] flex items-start p-6 gap-[60px]">
        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="self-stretch relative leading-[132%] font-semibold">
            Are Grainzz products suitable for kids and elderly?
          </div>
        </div>
        <Image
          className="w-[44px] relative max-h-full object-cover"
          width={44}
          height={44}
          sizes="100vw"
          alt=""
          src="/Toggle-Buttons@2x.png"
        />
      </div>
      <div className="self-stretch rounded-[14px] border-[#dedede] border-solid border-[1px] flex items-center p-6 gap-[60px]">
        <div className="flex-1 relative leading-[132%] font-semibold">
          How long will it take for my snacks to arrive?
        </div>
        <Image
          className="w-[44px] relative max-h-full object-cover"
          width={44}
          height={44}
          sizes="100vw"
          alt=""
          src="/Toggle-Buttons@2x.png"
        />
      </div>
      <div className="self-stretch rounded-[14px] border-[#dedede] border-solid border-[1px] flex items-center p-6 gap-[60px]">
        <div className="flex-1 relative leading-[132%] font-semibold">
          Do you offer Free Shipping?
        </div>
        <Image
          className="w-[44px] relative max-h-full object-cover"
          width={44}
          height={44}
          sizes="100vw"
          alt=""
          src="/Toggle-Buttons@2x.png"
        />
      </div>
      <div className="self-stretch rounded-[14px] border-[#dedede] border-solid border-[1px] flex items-center p-6 gap-[60px]">
        <div className="flex-1 relative leading-[132%] font-semibold">
          Do you deliver to my city?
        </div>
        <Image
          className="w-[44px] relative max-h-full object-cover"
          width={44}
          height={44}
          sizes="100vw"
          alt=""
          src="/Toggle-Buttons@2x.png"
        />
      </div>
    </div>
  );
};

export default Accordian;
