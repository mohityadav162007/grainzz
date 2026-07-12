import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from '@/components/ui/OptimizedImage';
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
          <span className="emoji-font text-[18px]">🇮🇳</span>
        </div>
      </div>
      <FrameComponent4 />
      <FrameComponent5 />
    </header>
  );
};

export default NavigationBar;

