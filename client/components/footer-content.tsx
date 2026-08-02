import type { NextPage } from "next";
import Image from '@/components/ui/AppImage';

export type FooterContentType = {
  className?: string;
};

const FooterContent: NextPage<FooterContentType> = ({ className = "" }) => {
  return (
    <footer
      className={`self-stretch bg-brand-green flex items-start py-20 px-[60px] gap-[100px] text-left text-base text-brand-light font-sans ${className}`}
    >
      <div className="w-[392px] flex flex-col items-start gap-8">
        <Image
          className="w-[229.6px] h-[70px] relative object-cover"
          loading="lazy"
          width={229.6}
          height={70}
          sizes="100vw"
          alt=""
          src="/Mask-group@2x.png"
        />
        <div className="self-stretch flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <Image
              className="w-[24px] relative max-h-full"
              width={24}
              height={24}
              sizes="100vw"
              alt=""
              src="/call.svg"
            />
            <div className="relative leading-[140%]">96262425 , 9375 6546</div>
          </div>
          <div className="flex items-center gap-3">
            <Image
              className="w-[24px] relative max-h-full"
              width={24}
              height={24}
              sizes="100vw"
              alt=""
              src="/mail.svg"
            />
            <div className="relative leading-[140%]">
              katariavibhor9@gmail.com
            </div>
          </div>
          <div className="self-stretch flex items-start gap-3">
            <Image
              className="w-[24px] relative max-h-full"
              width={24}
              height={24}
              sizes="100vw"
              alt=""
              src="/location-on.svg"
            />
            <div className="flex-1 relative leading-[140%]">
              B-291, MIG Flats, East of Loni road, Delhi, Delhi - 110093, India
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-start gap-[54px] text-lg text-[#fff]">
        <div className="w-[100px] flex flex-col items-start gap-5">
          <div className="relative leading-[134%] font-medium">Quick Links</div>
          <div className="self-stretch flex flex-col items-start gap-4 text-base text-brand-light">
            <div className="self-stretch relative [text-decoration:underline] leading-[140%] text-[#fff]">
              Home
            </div>
            <div className="relative leading-[140%]">About Us</div>
            <div className="relative leading-[140%]">FAQs</div>
            <div className="relative leading-[140%]">Contact Us</div>
            <div className="relative leading-[140%]">My Account</div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-5">
          <div className="relative leading-[134%] font-medium">Shop</div>
          <div className="self-stretch flex flex-col items-start gap-4 text-base text-brand-light">
            <div className="relative leading-[140%]">All Products</div>
            <div className="relative leading-[140%]">Combos</div>
            <div className="relative leading-[140%]">Sale!</div>
          </div>
        </div>
        <div className="w-[165px] flex flex-col items-start gap-5">
          <div className="relative leading-[134%] font-medium">Policies</div>
          <div className="flex flex-col items-start gap-4 text-base text-brand-light">
            <div className="self-stretch relative leading-[140%]">Shipping</div>
            <div className="relative leading-[140%]">Return/exchange</div>
            <div className="relative leading-[140%]">{`Terms & Conditions`}</div>
            <div className="relative leading-[140%]">Privacy Policy</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start gap-8">
          <div className="self-stretch flex flex-col items-start gap-4">
            <div className="self-stretch relative leading-[140%]">
              Subscribe to get latest offers
            </div>
            <div className="self-stretch rounded-lg border-brand-light border-solid border-[1px] flex items-center py-3 pl-[22px] pr-3 gap-6">
              <input
                className="w-[calc(100%_-_60px)] [border:none] [outline:none] font-sans text-lg bg-[transparent] flex-1 relative leading-[140%] text-brand-light text-left inline-block"
                placeholder="Enter your email"
                type="text"
              />
              <Image
                className="cursor-pointer [border:none] p-0 bg-[transparent] w-[26px] relative max-h-full"
                width={26}
                height={26}
                sizes="100vw"
                alt=""
                src="/send.svg"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-[32px] relative rounded-[100px] max-h-full"
              width={32}
              height={32}
              sizes="100vw"
              alt=""
              src="/Icon-1.svg"
            />

            <Image
              className="cursor-pointer [border:none] p-0 bg-[transparent] w-[32px] relative rounded-[100px] max-h-full"
              width={32}
              height={32}
              sizes="100vw"
              alt=""
              src="/Icon-3.svg"
            />
            <Image
              className="self-stretch w-[32px] relative rounded-[100px] max-h-full"
              loading="lazy"
              width={32}
              height={32}
              sizes="100vw"
              alt=""
              src="/Icon-4.svg"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterContent;

