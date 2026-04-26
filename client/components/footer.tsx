import type { NextPage } from "next";
import { type CSSProperties } from "react";
import FooterContent from "./footer-content";

export type FooterType = {
  className?: string;

  /** Variant props */
  property1?: any;
};

const Footer: NextPage<FooterType> = ({
  className = "",
  property1 = "web",
}) => {
  return (
    <section
      className={`self-stretch flex flex-col items-start text-left text-lg text-[#555] font-sans ${className}`}
    >
      <FooterContent />
      <div className="self-stretch bg-brand-orange-light flex items-center justify-between py-4 px-[60px]">
        <div className="relative leading-[140%] font-medium">
          Copyright © 2026 Grainzz by Vitalicious
        </div>
      </div>
    </section>
  );
};

export default Footer;
