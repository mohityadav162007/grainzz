import type { NextPage } from "next";
import Image from "next/image";

export type NumbersInfoType = {
  className?: string;
  group10: string;
  dataValues?: string;
  customersServed?: string;
};

const NumbersInfo: NextPage<NumbersInfoType> = ({
  className = "",
  group10,
  dataValues,
  customersServed,
}) => {
  return (
    <div
      className={`flex-1 rounded-[14px] bg-brand-light border-brand-green border-solid border-[1px] box-border flex flex-col items-center py-[18px] px-5 gap-8 min-w-[215px] max-w-[287px] text-center text-[38px] text-brand-black font-sans ${className}`}
    >
      <Image
        className="w-[64px] h-[64px] relative object-cover"
        width={64}
        height={64}
        sizes="100vw"
        alt=""
        src={group10}
      />
      <div className="flex flex-col items-center gap-3">
        <h2 className="m-0 relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[23px] mq450:leading-[30px] mq800:text-3xl mq800:leading-10">
          {dataValues}
        </h2>
        <div className="relative text-lg leading-[140%]">{customersServed}</div>
      </div>
    </div>
  );
};

export default NumbersInfo;
