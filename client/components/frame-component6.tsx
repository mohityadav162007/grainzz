import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';

export type FrameComponent6Type = {
  className?: string;
};

const FrameComponent6: NextPage<FrameComponent6Type> = ({ className = "" }) => {
  return (
    <section
      className={`self-stretch bg-brand-green overflow-hidden flex items-center justify-center py-[30px] px-2.5 box-border gap-10 max-w-full text-left text-[31px] text-[#fff] font-sans mq800:gap-5 mq1350:flex-wrap mq1350:justify-start ${className}`}
    >
      <div className="flex items-center gap-7 max-w-full shrink-0 mq800:flex-wrap">
        <h2 className="m-0 relative text-[length:inherit] leading-[134%] font-semibold font-[inherit] mq450:text-[19px] mq450:leading-[25px] mq800:text-[25px] mq800:leading-[33px]">
          Also Available on:
        </h2>
        <Image
          className="w-[99px] relative max-h-full"
          width={99}
          height={30}
          sizes="100vw"
          alt=""
          src="/Amazon-logo-1.svg"
        />
        <Image
          className="w-[63px] relative max-h-full object-cover"
          width={63}
          height={50}
          sizes="100vw"
          alt=""
          src="/image-27@2x.png"
        />
      </div>
      <Image
        className="h-[23.8px] w-[23.8px] relative shrink-0"
        width={23.8}
        height={23.8}
        sizes="100vw"
        alt=""
        src="/1.svg"
      />
      <div className="flex items-center gap-7 max-w-full shrink-0 mq800:flex-wrap">
        <h2 className="m-0 relative text-[length:inherit] leading-[134%] font-semibold font-[inherit] mq450:text-[19px] mq450:leading-[25px] mq800:text-[25px] mq800:leading-[33px]">
          Also Available on:
        </h2>
        <Image
          className="w-[99px] relative max-h-full"
          width={99}
          height={30}
          sizes="100vw"
          alt=""
          src="/Amazon-logo-1.svg"
        />
        <Image
          className="w-[63px] relative max-h-full object-cover"
          width={63}
          height={50}
          sizes="100vw"
          alt=""
          src="/image-27@2x.png"
        />
      </div>
      <Image
        className="h-[23.8px] w-[23.8px] relative shrink-0"
        width={23.8}
        height={23.8}
        sizes="100vw"
        alt=""
        src="/1.svg"
      />
      <div className="flex items-center gap-7 max-w-full shrink-0 mq800:flex-wrap">
        <h2 className="m-0 relative text-[length:inherit] leading-[134%] font-semibold font-[inherit] mq450:text-[19px] mq450:leading-[25px] mq800:text-[25px] mq800:leading-[33px]">
          Also Available on:
        </h2>
        <Image
          className="w-[99px] relative max-h-full"
          width={99}
          height={30}
          sizes="100vw"
          alt=""
          src="/Amazon-logo-1.svg"
        />
        <Image
          className="w-[63px] relative max-h-full object-cover"
          width={63}
          height={50}
          sizes="100vw"
          alt=""
          src="/image-27@2x.png"
        />
      </div>
    </section>
  );
};

export default FrameComponent6;

