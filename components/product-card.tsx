import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type ProductCardType = {
  className?: string;
  vector1: string;

  /** Variant props */
  property1?: CSSProperties["property1"];
};

const ProductCard: NextPage<ProductCardType> = ({
  className = "",
  property1 = "Default",
  vector1,
}) => {
  return (
    <section
      className={`w-[302px] flex flex-col items-start gap-6 text-left text-sm text-[#fff] font-sans ${className}`}
    >
      <div className="w-[302px] h-[303px] relative">
        <Image
          className="absolute top-[0px] left-[0px] rounded-[14px] w-[301.9px] h-[303px] object-cover"
          width={301.9}
          height={303}
          sizes="100vw"
          alt=""
          src={vector1}
        />
        <div className="absolute top-[14px] left-[19.8px] w-[261px] flex items-center justify-between gap-5">
          <div className="w-[56.4px] rounded-[999px] bg-brand-red flex items-center justify-center py-1 px-[11px] box-border">
            <div className="relative leading-[140%] shrink-0">-25%</div>
          </div>
          <Image
            className="w-[26px] relative max-h-full"
            width={26}
            height={26}
            sizes="100vw"
            alt=""
            src="/Veg-symbol-2.svg"
          />
        </div>
        <div className="absolute top-[251px] left-[250px] w-[52px] h-[52px]">
          <div className="absolute w-full top-[0px] right-[0%] left-[0%] rounded-[50%] bg-brand-black border-brand-black border-solid border-[1px] box-border h-[52px]" />
          <Image
            className="absolute w-[84.62%] top-[4px] right-[7.69%] left-[7.69%] max-w-full overflow-hidden h-[44px] object-cover"
            width={44}
            height={44}
            sizes="100vw"
            alt=""
            src="/Frame-1171278744@2x.png"
          />
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start gap-3 text-[26px] text-brand-black">
        <div className="self-stretch flex flex-col items-start">
          <h2 className="m-0 self-stretch relative text-[length:inherit] leading-[132%] font-semibold font-[inherit]">{`Oats Chips – Peri Peri `}</h2>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="m-0 relative text-[length:inherit] leading-[132%] font-semibold font-[inherit]">
            ₹149
          </h2>
          <div className="relative text-lg [text-decoration:line-through] leading-[140%] text-[#707070]">
            MRP ₹199
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="rounded bg-brand-yellow flex items-center justify-center py-1.5 px-2.5">
            <div className="relative leading-[140%]">Jar</div>
          </div>
          <div className="rounded bg-brand-yellow flex items-center justify-center py-1.5 px-2.5">
            <div className="relative leading-[140%]">150g</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
