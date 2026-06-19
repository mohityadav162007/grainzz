"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import Image from "next/image";
import ButtonPrimary from "./button-primary";

export type FrameComponentType = {
  className?: string;
  offerBackground: string;
  property1?: string;
  property2?: string;
  buyNow?: string;

  /** Style props */
  frameSectionBackgroundColor?: CSSProperties["backgroundColor"];
};

const FrameComponent: NextPage<FrameComponentType> = ({
  className = "",
  frameSectionBackgroundColor,
  offerBackground,
  property1 = "Primary",
  property2,
  buyNow,
}) => {
  const frameSectionStyle: CSSProperties = useMemo(() => {
    return {
      backgroundColor: frameSectionBackgroundColor,
    };
  }, [frameSectionBackgroundColor]);

  return (
    <section
      className={`flex-1 rounded-[14px] bg-brand-peach-light flex flex-col items-start min-w-[253px] text-center text-lg text-brand-black font-sans ${className}`}
      style={frameSectionStyle}
    >
      <Image
        className="w-[338px] h-[351px] relative rounded-t-[14px] rounded-b-none object-cover"
        loading="lazy"
        width={338}
        height={351}
        sizes="100vw"
        alt=""
        src={offerBackground}
      />
      <div className="self-stretch flex flex-col items-center p-6 gap-6">
        <div className="self-stretch flex flex-col items-start gap-3">
          <div className="self-stretch relative leading-[140%]">
            upto 40% off
          </div>
          <h2 className="m-0 self-stretch relative text-[26px] leading-[132%] font-semibold font-[inherit] mq450:text-[21px] mq450:leading-[27px]">
            Vegetable Chips
          </h2>
        </div>
        <ButtonPrimary
          property1={property1}
          property2={property2}
          buyNow={buyNow}
        />
      </div>
    </section>
  );
};

export default FrameComponent;
