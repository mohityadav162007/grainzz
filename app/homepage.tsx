"use client";
import type { NextPage } from "next";
import { useState } from "react";
import NavigationBar from "../components/navigation-bar";
import SliderContainer from "../components/slider-container";
import HeroContent from "../components/hero-content";
import FrameComponent2 from "../components/frame-component2";
import FrameComponent3 from "../components/frame-component3";
import FrameComponent6 from "../components/frame-component6";
import FrameComponent from "../components/frame-component";
import FrameComponent7 from "../components/frame-component7";
import ProductListing from "../components/product-listing";
import GroupComponent from "../components/group-component";
import FollowUs from "../components/follow-us";
import QuestionsArea from "../components/questions-area";
import Footer from "../components/footer";

const Homepage: NextPage = () => {
  const [frameComponentItems] = useState([
    {
      frameSectionBackgroundColor: "#ffdfd6" as const,
      offerBackground: "/Offer-Background@2x.png",
      property1: "Outlined" as const,
      property2: "Default" as const,
      buyNow: "Buy Now",
    },
    {
      frameSectionBackgroundColor: "#eefbdc" as const,
      offerBackground: "/Offer-Background@2x.png",
      property1: "Outlined" as const,
      property2: "Default" as const,
      buyNow: "Buy Now",
    },
    {
      frameSectionBackgroundColor: undefined,
      offerBackground: "/Offer-Background@2x.png",
      property1: "Outlined" as const,
      property2: "Default" as const,
      buyNow: "Buy Now",
    },
  ]);
  return (
    <div className="w-full h-[7769px] relative bg-[#fff] overflow-hidden flex flex-col items-start pt-0 px-0 pb-[6922px] box-border leading-[normal] tracking-[normal] mq1350:h-auto">
      <NavigationBar property1="Web" />
      <div className="self-stretch h-[733px] flex flex-col items-end pt-0 px-0 pb-[92px] box-border max-w-full shrink-0 mq800:pb-[60px] mq800:box-border">
        <SliderContainer />
        <section className="w-[736px] flex items-start justify-end py-0 px-20 box-border max-w-full mt-[-529px] relative mq800:pl-10 mq800:pr-10 mq800:box-border">
          <HeroContent />
        </section>
      </div>
      <main className="self-stretch flex flex-col items-center gap-[100px] max-w-full z-[2] shrink-0 mq450:gap-[25px] mq800:gap-[50px]">
        <FrameComponent2 />
        <section className="self-stretch flex flex-col items-start max-w-full">
          <FrameComponent3 />
          <FrameComponent6 />
        </section>
        <section className="flex flex-col items-center py-0 px-5 gap-11 text-center text-[45px] text-brand-black font-sans mq800:gap-[22px]">
          <h2 className="m-0 w-[847px] relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] flex items-center justify-center mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
            Powered by Real Grains
          </h2>
          <div className="self-stretch flex items-center justify-center flex-wrap content-center gap-6 mq800:grid-cols-[minmax(253px,_1fr)] mq1125:justify-center mq1125:grid-cols-[repeat(2,_minmax(253px,_439px))]">
            {frameComponentItems.map((item, index) => (
              <FrameComponent
                key={index}
                frameSectionBackgroundColor={item.frameSectionBackgroundColor}
                offerBackground={item.offerBackground}
                property1={item.property1}
                property2={item.property2}
                buyNow={item.buyNow}
              />
            ))}
          </div>
        </section>
        <FrameComponent7 />
        <section className="flex flex-col items-start max-w-full">
          <ProductListing />
          <GroupComponent />
        </section>
        <FollowUs />
        <QuestionsArea />
        <Footer property1="web" />
      </main>
    </div>
  );
};

export default Homepage;
