import type { NextPage } from "next";
import ButtonPrimary from "./button-primary";

export type HeroContentType = {
  className?: string;
};

const HeroContent: NextPage<HeroContentType> = ({ className = "" }) => {
  return (
    <div
      className={`flex-1 flex flex-col items-start gap-9 max-w-full text-left text-[22px] text-[#fff] font-sans mq800:gap-[18px] ${className}`}
    >
      <div className="self-stretch flex flex-col items-start gap-4 shrink-0">
        <h3 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-lg mq450:leading-[23px]">
          Upto 40% OFF
        </h3>
        <h1 className="m-0 self-stretch relative text-[54px] leading-[132%] font-bold font-[inherit] mq450:text-[32px] mq450:leading-[43px] mq800:text-[43px] mq800:leading-[57px]">
          Power of Real Grainz
          <br />
          for better gainzz.
        </h1>
        <div className="self-stretch relative leading-[140%] mq450:text-lg mq450:leading-[25px]">
          Get the power packed shakti of ragi, bajra and jowar now in snack
          form.
        </div>
      </div>
      <div className="rounded-[99px] bg-[#fff] border-[#fff] border-solid border-[1px] hidden items-center justify-center py-3 px-[38px] whitespace-nowrap shrink-0 text-lg text-brand-black">
        <div className="relative leading-[132%] capitalize font-semibold">
          Buy Now
        </div>
      </div>
      <ButtonPrimary property1="Primary" property2="Default" buyNow="Buy Now" />
    </div>
  );
};

export default HeroContent;
