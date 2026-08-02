import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';

export type FollowUsType = {
  className?: string;
};

const FollowUs: NextPage<FollowUsType> = ({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-col items-center gap-[54px] text-left text-[45px] text-brand-black font-sans mq800:gap-[27px] ${className}`}
    >
      <div className="w-[1280px] flex items-center justify-between gap-5">
        <h2 className="m-0 w-[628px] relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] flex items-center shrink-0 mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
          Follow us on Instagram
        </h2>
        <button className="cursor-pointer [border:none] py-3.5 px-10 bg-brand-black rounded-[99px] flex items-center justify-center gap-2.5 hover:bg-[#4d4d4d]">
          <Image
            className="w-[24px] relative max-h-full"
            width={24}
            height={24}
            sizes="100vw"
            alt=""
            src="/Instagram-Glyph-White-1.svg"
          />
          <div className="relative text-lg leading-[140%] font-semibold font-sans text-[#fff] text-left">
            grainzbyvitalicious
          </div>
        </button>
      </div>
      <div className="self-stretch flex items-start justify-center gap-6 mq450:grid-cols-[minmax(226px,_1fr)] mq800:grid-cols-[repeat(2,_minmax(226px,_393px))] mq1125:justify-center mq1125:grid-cols-[repeat(3,_minmax(226px,_393px))] mq1350:flex-wrap">
        <Image
          className="w-[302px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={302}
          height={536}
          sizes="100vw"
          alt=""
          src="/image-24@2x.png"
        />
        <Image
          className="w-[302px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={302}
          height={536}
          sizes="100vw"
          alt=""
          src="/image-24@2x.png"
        />
        <Image
          className="w-[301px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={301}
          height={536}
          sizes="100vw"
          alt=""
          src="/image-25@2x.png"
        />
        <Image
          className="w-[302px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={302}
          height={536}
          sizes="100vw"
          alt=""
          src="/image-23@2x.png"
        />
        <Image
          className="w-[301px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={301}
          height={536}
          sizes="100vw"
          alt=""
          src="/609216963-17861980689559678-5190492068987603702-n-1@2x.png"
        />
        <Image
          className="w-[301px] relative rounded-lg max-h-full object-cover shrink-0 mq450:w-full"
          loading="lazy"
          width={301}
          height={536}
          sizes="100vw"
          alt=""
          src="/609216963-17861980689559678-5190492068987603702-n-1@2x.png"
        />
      </div>
    </section>
  );
};

export default FollowUs;

