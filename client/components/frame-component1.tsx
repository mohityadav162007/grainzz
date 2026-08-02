import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';

export type FrameComponent1Type = {
  className?: string;
  cleanSnacking?: string;
  weveRemovedTheBadStuffOur?: string;
};

const FrameComponent1: NextPage<FrameComponent1Type> = ({
  className = "",
  cleanSnacking,
  weveRemovedTheBadStuffOur,
}) => {
  return (
    <div
      className={`flex-1 flex flex-col items-start gap-6 min-w-[209px] text-left text-[26px] text-brand-black font-sans ${className}`}
    >
      <Image
        className="w-[64px] h-[64px] relative object-cover"
        loading="lazy"
        width={64}
        height={64}
        sizes="100vw"
        alt=""
        src="/Group-103@2x.png"
      />
      <div className="self-stretch flex flex-col items-center gap-3">
        <h2 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[21px] mq450:leading-[27px]">
          {cleanSnacking}
        </h2>
        <div className="self-stretch relative text-base leading-[140%] text-[#555]">
          {weveRemovedTheBadStuffOur}
        </div>
      </div>
    </div>
  );
};

export default FrameComponent1;

