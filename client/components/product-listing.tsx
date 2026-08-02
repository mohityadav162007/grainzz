import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';

export type ProductListingType = {
  className?: string;
};

const ProductListing: NextPage<ProductListingType> = ({ className = "" }) => {
  return (
    <div
      className={`w-[1440px] bg-brand-orange-light flex items-center py-[100px] px-20 box-border relative isolate gap-16 text-left text-base text-brand-green font-sans mq450:pt-[42px] mq450:pb-[42px] mq450:box-border mq800:gap-4 mq1125:pt-[65px] mq1125:pb-[65px] mq1125:box-border mq1350:gap-8 mq1350:pl-10 mq1350:pr-10 mq1350:box-border ${className}`}
    >
      <div className="h-[669px] w-[587px] relative rounded-[14px] bg-cover bg-no-repeat bg-[top] z-[0]">
        <Image
          className="absolute top-[0px] left-[0px] rounded-[14px] w-full h-full object-cover hidden"
          width={587}
          height={669}
          sizes="100vw"
          alt=""
          src="/Rectangle-10@2x.png"
        />
        <div className="absolute top-[602px] left-[20px] rounded-[99px] bg-[#fff] border-brand-green border-solid border-[1px] hidden items-center justify-center py-[13px] px-6">
          <div className="relative leading-[132%] capitalize font-semibold shrink-0">
            quick view
          </div>
        </div>
      </div>
      <section className="h-[669px] w-[629px] flex flex-col items-start gap-12 z-[1] text-left text-lg text-brand-black font-sans mq450:h-auto mq800:gap-6">
        <div className="self-stretch flex flex-col items-start gap-6 shrink-0">
          <div className="w-[584px] flex flex-col items-start gap-5 text-[45px] text-brand-green">
            <div className="self-stretch flex flex-col items-start gap-3">
              <h2 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[27px] mq450:leading-9 mq800:text-4xl mq800:leading-[48px]">
                The Essential Snack Box
              </h2>
              <div className="relative text-base leading-[140%] text-[#555]">
                High-Fibre | No Palm Oil | Baked Crunch
              </div>
            </div>
            <div className="flex items-center gap-3 text-[38px] text-brand-black">
              <h2 className="m-0 relative text-[length:inherit] leading-[132%] font-semibold font-[inherit] mq450:text-[23px] mq450:leading-[30px] mq800:text-3xl mq800:leading-10">
                ₹149
              </h2>
              <h3 className="m-0 relative text-[22px] [text-decoration:line-through] leading-[140%] font-normal font-[inherit] text-[#707070] mq450:text-lg mq450:leading-[25px]">
                MRP ₹199
              </h3>
            </div>
          </div>
          <div className="w-[357px] flex flex-col items-start gap-5">
            <div className="self-stretch relative leading-[140%] font-semibold">
              Select your box
            </div>
            <div className="self-stretch flex items-center gap-4 mq450:flex-wrap">
              <button className="cursor-pointer border-[#8e8e8e] border-solid border-[1px] py-3 px-6 bg-[transparent] rounded-[99px] flex items-center justify-center shrink-0">
                <div className="relative text-base leading-[132%] font-medium font-sans text-brand-black text-left">
                  Box of 6 Grainzz
                </div>
              </button>
              <button className="cursor-pointer border-[#8e8e8e] border-solid border-[1px] py-3 px-6 bg-[transparent] rounded-[99px] flex items-center justify-center shrink-0">
                <div className="relative text-base leading-[132%] font-medium font-sans text-brand-black text-left">
                  Box of 10 Grainzz
                </div>
              </button>
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-center gap-4">
            <div className="w-[585px] h-[24px] relative leading-[134%] font-medium flex items-center">
              Description
            </div>
            <div className="self-stretch relative text-sm leading-[140%] text-[#555]">
              <p className="[margin-block-start:0] [margin-block-end:16px]">
                Lorem ipsum dolor sit amet consectetur. Cursus consequat
                consectetur quisque id sollicitudin. Elit aliquet fusce vel
                aliquet interdum aenean. Ornare sed dui tempor egestas elementum
                volutpat nulla nunc. Vitae mi eget ac nisl ultrices ut lacinia
                quis condimentum. Lectus vulputate sagittis nulla et amet eu
                adipiscing nibh.
              </p>
              <p className="m-0">
                Lorem ipsum dolor sit amet consectetur. Cursus consequat
                consectetur quisque id sollicitudin. Elit aliquet fusce vel
                aliquet interdum aenean. Ornare sed dui tempor egestas elementum
                volutpat nulla nunc
              </p>
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-end gap-6 shrink-0 text-[31px]">
          <div className="self-stretch flex items-center flex-wrap content-center gap-11 mq800:gap-[22px]">
            <div className="w-[192px] flex items-center justify-between gap-5">
              <Image
                className="h-[52px] w-[52px] relative object-cover"
                loading="lazy"
                width={52}
                height={52}
                sizes="100vw"
                alt=""
                src="/Group-17@2x.png"
              />
              <div className="relative leading-[134%] font-semibold mq450:text-[19px] mq450:leading-[25px] mq800:text-[25px] mq800:leading-[33px]">
                1
              </div>
              <div className="h-[52px] w-[52px] relative">
                <div className="absolute w-full top-[0px] right-[0%] left-[0%] rounded-[50%] border-brand-black border-solid border-[0px] box-border h-full" />
                <Image
                  className="absolute w-[84.62%] top-[4px] right-[7.69%] left-[7.69%] max-w-full overflow-hidden h-[44px] object-cover z-[1]"
                  width={44}
                  height={44}
                  sizes="100vw"
                  alt=""
                  src="/Button-Space@2x.png"
                />
              </div>
            </div>
            <button className="cursor-pointer border-brand-green border-solid border-[1px] py-[13px] px-10 bg-[transparent] flex-1 rounded-[99px] flex items-center justify-center">
              <div className="relative text-lg leading-[132%] capitalize font-semibold font-sans text-brand-green text-left">
                Add to Cart
              </div>
            </button>
          </div>
          <button className="cursor-pointer border-brand-green border-solid border-[1px] py-[13px] px-10 bg-brand-black self-stretch rounded-[99px] flex items-center justify-center">
            <div className="relative text-lg leading-[132%] capitalize font-semibold font-sans text-[#fff] text-left">
              Quick Buy
            </div>
          </button>
        </div>
      </section>
      <Image
        className="w-[2.22%] absolute !!m-[0 important] h-[3.68%] top-[13.9%] right-[55.14%] bottom-[82.42%] left-[42.64%] max-w-full overflow-hidden max-h-full z-[2]"
        width={32}
        height={32}
        sizes="100vw"
        alt=""
        src="/Layer-x0020-1.svg"
      />
    </div>
  );
};

export default ProductListing;

