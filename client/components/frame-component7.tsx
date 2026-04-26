"use client";
import type { NextPage } from "next";
import { useState } from "react";
import NumbersInfo from "./numbers-info";

export type FrameComponent7Type = {
  className?: string;
};

const FrameComponent7: NextPage<FrameComponent7Type> = ({ className = "" }) => {
  const [numbersInfoItems] = useState([
    {
      group10: "/Group-103@2x.png",
      dataValues: " 5000+ ",
      customersServed: "customers served",
    },
    {
      group10: "/Group-102@2x.png",
      dataValues: " 30,000+ ",
      customersServed: "products sold",
    },
    {
      group10: "/Group-101@2x.png",
      dataValues: " 15,000+ ",
      customersServed: "packets sold",
    },
    {
      group10: "/Group-10@2x.png",
      dataValues: "29+",
      customersServed: "Indian states served",
    },
  ]);
  return (
    <section
      className={`w-[1320px] flex flex-col items-center py-0 px-5 box-border gap-11 text-center text-[45px] text-brand-black font-sans mq800:gap-[22px] ${className}`}
    >
      <h2 className="m-0 w-[847px] relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] flex items-center justify-center mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
        Our Numbers Talk
      </h2>
      <div className="self-stretch flex items-center justify-center flex-wrap content-center gap-11 text-[38px] mq800:gap-[22px]">
        {numbersInfoItems.map((item, index) => (
          <NumbersInfo
            key={index}
            group10={item.group10}
            dataValues={item.dataValues}
            customersServed={item.customersServed}
          />
        ))}
      </div>
    </section>
  );
};

export default FrameComponent7;
