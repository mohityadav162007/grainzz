import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';
import FrameComponent1 from "./frame-component1";

export type FrameComponent3Type = {
  className?: string;
};

const FrameComponent3: NextPage<FrameComponent3Type> = ({ className = "" }) => {
  return (
    <div
      className={`self-stretch bg-brand-light flex items-center py-[100px] px-20 box-border gap-6 max-w-full mq450:pt-[42px] mq450:pb-[42px] mq450:box-border mq1125:pt-[65px] mq1125:pb-[65px] mq1125:box-border mq1350:flex-wrap mq1350:pl-5 mq1350:pr-5 mq1350:box-border ${className}`}
    >
      <Image
        className="w-[519px] relative rounded-[14px] max-h-full object-cover max-w-full mq1350:flex-1"
        loading="lazy"
        width={599}
        height={663}
        sizes="100vw"
        alt=""
        src="/Content-Background@2x.png"
      />
      <section className="h-[663px] w-[735px] flex flex-col items-start justify-between py-0 px-6 box-border gap-5 max-w-full text-left text-[45px] text-brand-black font-sans mq800:h-auto mq800:gap-5 mq1125:gap-5 mq1125:min-w-full mq1350:flex-1 mq1350:gap-5">
        <div className="self-stretch flex flex-col items-center">
          <h1 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
            Healthy Snacking With
            <br />
            Benefits Beyond The Ordinary
          </h1>
        </div>
        <div className="self-stretch flex flex-col items-start gap-11 text-[26px] mq800:gap-[22px]">
          <div className="self-stretch flex items-center gap-11 mq800:gap-[22px] mq800:flex-wrap">
            <FrameComponent1
              cleanSnacking="Clean Snacking"
              weveRemovedTheBadStuffOur={`We’ve removed the "bad stuff”. Our snacks are crafted with zero palm oil, zero trans fat, and no added preservatives.`}
            />
            <FrameComponent1
              cleanSnacking="Powered by Supergrains"
              weveRemovedTheBadStuffOur="We skip refined flour (maida). Instead, we use a base of nutrient-dense millets and grains like Jowar, Bajra, Quinoa, and Oats."
            />
          </div>
          <div className="self-stretch flex items-start gap-11 mq800:gap-[22px] mq800:flex-wrap">
            <FrameComponent1
              cleanSnacking="Roasted, Not Deep-Fried"
              weveRemovedTheBadStuffOur="We believe great taste shouldn't come at the cost of your heart health. That’s why we use roasting techniques instead of deep-frying."
            />
            <FrameComponent1
              cleanSnacking={`Bold, Authentic & Indian`}
              weveRemovedTheBadStuffOur={`We refuse to let "healthy" mean "bland." We use real spices and natural seasonings to bring you the nostalgic zing of Indian food.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FrameComponent3;

