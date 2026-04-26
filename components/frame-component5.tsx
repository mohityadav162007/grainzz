"use client";
import type { NextPage } from "next";
import { useState } from "react";
import NavTab from "./nav-tab";

export type FrameComponent5Type = {
  className?: string;
};

const FrameComponent5: NextPage<FrameComponent5Type> = ({ className = "" }) => {
  const [navTabItems] = useState([
    {
      property1: "Default" as const,
      shopAll: "Shop All",
      shopAllColor: "#1a1a1a" as const,
    },
    {
      property1: "Default" as const,
      shopAll: "Combos",
      shopAllColor: undefined,
    },
    {
      property1: "Default" as const,
      shopAll: "Sale!",
      shopAllColor: "#b00912" as const,
    },
    {
      property1: "Default" as const,
      shopAll: "About Us",
      shopAllColor: undefined,
    },
    {
      property1: "Default" as const,
      shopAll: "FAQs",
      shopAllColor: undefined,
    },
    {
      property1: "Default" as const,
      shopAll: "Contact Us",
      shopAllColor: undefined,
    },
  ]);
  return (
    <div
      className={`self-stretch border-[#e4e4e4] border-solid border-t-[1px] border-b-[1px] flex items-start py-2.5 px-20 ${className}`}
    >
      <nav className="m-0 flex-1 flex items-center justify-center gap-11 text-left text-lg text-brand-black font-sans">
        {navTabItems.map((item, index) => (
          <NavTab
            key={index}
            property1={item.property1}
            shopAll={item.shopAll}
            shopAllColor={item.shopAllColor}
          />
        ))}
      </nav>
    </div>
  );
};

export default FrameComponent5;
