import type { NextPage } from "next";
import Image from "next/image";

export type GroupComponentType = {
  className?: string;
};

const GroupComponent: NextPage<GroupComponentType> = ({ className = "" }) => {
  return (
    <div
      className={`w-[1440px] h-[700px] flex items-start py-0 pl-[204px] pr-20 box-border relative isolate gap-[202px] max-w-full mq450:gap-[50px] mq450:pl-5 mq450:box-border mq800:gap-[101px] mq800:pl-[102px] mq800:pr-10 mq800:box-border mq1350:h-auto mq1350:flex-wrap ${className}`}
    >
      <Image
        className="h-full w-full absolute !!m-[0 important] top-[0px] left-[0px] [filter:blur(1px)] object-cover shrink-0"
        width={1440}
        height={700}
        sizes="100vw"
        alt=""
        src="/Product-Background@2x.png"
      />
      <section className="flex flex-col items-start pt-[97px] px-0 pb-0 box-border max-w-full shrink-0 text-left text-sm text-[#fff] font-sans mq800:pt-[63px] mq800:box-border mq1350:flex-1">
        <div className="rounded-2xl bg-[#fff] flex flex-col items-start p-3 gap-6">
          <div className="w-[302px] h-[303px] flex flex-col items-end pt-3.5 px-0 pb-[0.2px] box-border relative isolate gap-[207.1px] mq450:gap-[104px]">
            <Image
              className="w-full h-full absolute !!m-[0 important] top-[0px] left-[0px] rounded-[14px] object-cover shrink-0"
              width={301.9}
              height={303}
              sizes="100vw"
              alt=""
              src="/Vector-1@2x.png"
            />
            <div className="w-[302px] flex items-start py-0 px-5 box-border shrink-0">
              <div className="rounded-[999px] bg-brand-red flex items-center justify-center py-1 px-[9px]">
                <div className="relative leading-[140%]">-25%</div>
              </div>
            </div>
            <Image
              className="w-[53.7px] h-[53.7px] relative object-cover z-[1] shrink-0"
              loading="lazy"
              width={53.7}
              height={53.7}
              sizes="100vw"
              alt=""
              src="/Group-3@2x.png"
            />
          </div>
          <div className="self-stretch bg-[#fff] flex flex-col items-start gap-3.5 text-[26px] text-brand-black font-['Helvetica_Neue']">
            <div className="flex items-center gap-2 text-sm font-sans">
              <div className="rounded bg-brand-yellow flex items-center justify-center py-1.5 px-2.5">
                <div className="relative leading-[140%]">Jar</div>
              </div>
              <div className="rounded bg-brand-yellow flex items-center justify-center py-1.5 px-2.5">
                <div className="relative leading-[140%]">150g</div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start gap-2">
              <h2 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-medium font-[inherit] mq450:text-[21px] mq450:leading-[27px]">{`Oats Chips – Peri Peri `}</h2>
              <div className="self-stretch relative text-base leading-[140%] font-sans text-[#555]">
                High-Fibre | No Palm Oil | Baked Crunch 
              </div>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="m-0 relative text-[length:inherit] leading-[132%] font-medium font-[inherit] mq450:text-[21px] mq450:leading-[27px]">
                ₹149
              </h2>
              <div className="relative text-lg [text-decoration:line-through] leading-[140%] font-sans text-[#707070]">
                MRP ₹199
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="h-[700px] w-[628px] bg-brand-light flex flex-col items-start justify-between py-[52px] px-8 box-border gap-5 max-w-full z-[2] shrink-0 text-left text-[22px] text-brand-black font-sans mq450:h-auto mq450:gap-5 mq800:gap-5 mq800:pt-[34px] mq800:pb-[34px] mq800:box-border mq1125:gap-5 mq1125:min-w-full mq1350:flex-1 mq1350:gap-5">
        <h3 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-lg mq450:leading-[23px]">
          What people are saying about Grainz
        </h3>
        <div className="self-stretch flex flex-col items-start gap-[54px] text-[31px] mq800:gap-[27px]">
          <div className="self-stretch relative leading-[134%] font-semibold mq450:text-[19px] mq450:leading-[25px] mq800:text-[25px] mq800:leading-[33px]">
            "Finally, a snack that doesn't make me choose between my health and
            my cravings! Grainzz has become my go-to for mid-day hunger. I love
            that it’s roasted and made from millets!"
          </div>
          <div className="flex items-center gap-[18px] text-[22px] mq450:flex-wrap">
            <Image
              className="w-[66px] relative rounded-[50%] max-h-full object-cover"
              loading="lazy"
              width={66}
              height={66}
              sizes="100vw"
              alt=""
              src="/User-Icon@2x.png"
            />
            <div className="w-[199px] flex flex-col items-start gap-2">
              <h3 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-lg mq450:leading-[23px]">
                Sophia Maren
              </h3>
              <div className="self-stretch relative text-base leading-[140%]">
                Director of Product
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-[50px] w-[50px] flex flex-col items-center justify-center py-6 px-0 box-border opacity-[0.4]">
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto shrink-0"
              width={34}
              height={34}
              sizes="100vw"
              alt=""
              src="/chevron-backward2.svg"
            />
          </div>
          <div className="flex items-center gap-1">
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-[48px] relative max-h-full"
              width={48}
              height={34}
              sizes="100vw"
              alt=""
              src="/chevron-backward1.svg"
            />
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-[34px] relative max-h-full"
              width={34}
              height={34}
              sizes="100vw"
              alt=""
              src="/chevron-backward.svg"
            />
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-[34px] relative max-h-full"
              width={34}
              height={34}
              sizes="100vw"
              alt=""
              src="/chevron-backward.svg"
            />
          </div>
          <div className="h-[50px] w-[50px] flex flex-col items-center justify-center py-6 px-0 box-border">
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-full relative max-h-full h-auto shrink-0"
              width={34}
              height={34}
              sizes="100vw"
              alt=""
              src="/chevron-forward.svg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default GroupComponent;
