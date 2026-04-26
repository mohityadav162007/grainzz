import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";
import FrameComponent4 from "./frame-component4";
import FrameComponent5 from "./frame-component5";

export type NavigationBarType = {
  className?: string;

  /** Variant props */
  property1?: any;
};

const NavigationBar: NextPage<NavigationBarType> = ({
  className = "",
  property1 = "Mobile",
}) => {
  return (
    <header
      className={`w-[1440px] bg-[#fff] flex flex-col items-center z-[3] shrink-0 text-left text-lg text-[#fff] font-['Helvetica_Neue'] ${className}`}
    >
      <div className="w-[1440px] bg-[#1e5e20] flex items-start justify-between py-2.5 px-[60px] box-border">
        <div className="flex items-center gap-1.5">
          <div className="relative leading-[132%] font-medium">{`Start this year with a healthy choice: Shipping PAN India `}</div>
          <Image
            className="cursor-pointer [border:none] p-0 bg-[transparent] w-[24px] relative max-h-full"
            width={24}
            height={24}
            sizes="100vw"
            alt=""
            src="/.svg"
          />
        </div>
      </div>
      <FrameComponent4 />
      <FrameComponent5 />
    </header>
  );
};

export default NavigationBar;
