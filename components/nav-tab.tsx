"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";

export type NavTabType = {
  className?: string;
  shopAll?: string;

  /** Variant props */
  property1?: CSSProperties["property1"];

  /** Style props */
  shopAllColor?: CSSProperties["color"];
};

const NavTab: NextPage<NavTabType> = ({
  className = "",
  property1 = "Default",
  shopAll,
  shopAllColor,
}) => {
  const shopAllStyle: CSSProperties = useMemo(() => {
    return {
      color: shopAllColor,
    };
  }, [shopAllColor]);

  return (
    <div
      className={`flex items-center justify-center py-2.5 px-0 text-left text-lg text-brand-black font-sans ${className}`}
    >
      <div className="relative leading-[134%] font-medium" style={shopAllStyle}>
        {shopAll}
      </div>
    </div>
  );
};

export default NavTab;
