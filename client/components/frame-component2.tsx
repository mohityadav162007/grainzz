"use client";
import type { NextPage } from "next";
import { useState } from "react";
import TabGroup from "./tab-group";
import ProductCard from "./product-card";
import ButtonPrimary from "./button-primary";

export type FrameComponent2Type = {
  className?: string;
};

const FrameComponent2: NextPage<FrameComponent2Type> = ({ className = "" }) => {
  const [productCardItems] = useState([
    {
      property1: "Default" as const,
      vector1: "/Vector-11@2x.png",
    },
    {
      property1: "Default" as const,
      vector1: "/Vector-11@2x.png",
    },
    {
      property1: "Default" as const,
      vector1: "/Vector-11@2x.png",
    },
    {
      property1: "Default" as const,
      vector1: "/Vector-11@2x.png",
    },
  ]);
  return (
    <section
      className={`flex flex-col items-center py-0 px-5 gap-11 text-center text-[45px] text-brand-black font-sans mq800:gap-[22px] ${className}`}
    >
      <h1 className="m-0 w-[847px] relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] flex items-center justify-center mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
        Our Product Segments
      </h1>
      <div className="self-stretch flex flex-col items-center gap-9 mq800:gap-[18px]">
        <TabGroup property1="Large" property2="Default" />
        <div className="self-stretch grid items-center gap-6 grid-cols-[repeat(4,_minmax(226px,_1fr))] mq450:grid-cols-[minmax(226px,_1fr)] mq1125:justify-center mq1125:grid-cols-[repeat(2,_minmax(226px,_393px))]">
          {productCardItems.map((item, index) => (
            <ProductCard
              key={index}
              property1={item.property1}
              vector1={item.vector1}
            />
          ))}
        </div>
      </div>
      <ButtonPrimary
        property1="Outlined"
        property2="Default"
        buyNow="view all products"
      />
    </section>
  );
};

export default FrameComponent2;
