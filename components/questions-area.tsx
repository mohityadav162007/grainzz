import type { NextPage } from "next";
import Accordian from "./accordian";

export type QuestionsAreaType = {
  className?: string;
};

const QuestionsArea: NextPage<QuestionsAreaType> = ({ className = "" }) => {
  return (
    <section
      className={`w-[1157px] flex flex-col items-center py-0 px-5 box-border gap-[54px] text-center text-[45px] text-[#000] font-sans mq800:gap-[27px] ${className}`}
    >
      <h2 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
        Frequently asked questions
      </h2>
      <Accordian property1="Accordian Default" />
    </section>
  );
};

export default QuestionsArea;
