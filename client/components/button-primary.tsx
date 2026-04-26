import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type ButtonPrimaryType = {
  className?: string;
  buyNow?: string;

  /** Variant props */
  property1?: any;
  property2?: any;
};

const getButtonPrimaryStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Outlined-Default":
      return "[&]:border-brand-green [&]:border-solid [&]:border-[1px] [&]:bg-[transparent] [&]:[flex-shrink:unset]";
  }
};

const ButtonPrimary: NextPage<ButtonPrimaryType> = ({
  className = "",
  property1 = "Primary",
  property2 = "Default",
  buyNow,
}) => {
  const variantKey = [property1, property2].join("-");

  return (
    <button
      className={`cursor-pointer [border:none] py-1 pl-[18px] pr-1 bg-[#fff] rounded-[99px] flex items-center gap-6 shrink-0 ${getButtonPrimaryStyle(variantKey)} ${className}`}
    >
      <div className="relative text-lg leading-[132%] capitalize font-semibold font-sans text-brand-green text-left">
        {buyNow}
      </div>
      <Image
        className="h-[42px] w-[42px] relative object-cover"
        width={42}
        height={42}
        sizes="100vw"
        alt=""
        src="/Frame-1171279552@2x.png"
      />
    </button>
  );
};

export default ButtonPrimary;
