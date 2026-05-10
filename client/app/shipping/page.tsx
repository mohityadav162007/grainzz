import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy – Grainzz',
  description: 'Shipping Policy for Grainzz — how we handle delivery and logistics.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-[48px] md:py-[64px]">
      <div className="max-w-[720px] mx-auto px-[20px] md:px-[40px]">
        {/* Title */}
        <h1 className="text-[32px] md:text-[40px] font-bold text-brand-black text-center tracking-tight leading-[1.15] mb-[8px]" style={{ fontFamily: 'serif' }}>
          Shipping Policy
        </h1>
        <p className="text-[13px] text-[#888] text-center mb-[40px] md:mb-[48px]">
          Last updated: May 10, 2026
        </p>

        {/* Content */}
        <div className="space-y-[32px] md:space-y-[40px] text-[14px] md:text-[15px] leading-[1.75] text-[#333] font-normal">
          <section>
            <p className="mb-[16px]">
              At Grainzz Gifting, we do our best to make sure your order reaches you fresh and on time.
            </p>
            <ul className="list-disc pl-[24px] space-y-[12px]">
              <li>
                <strong>Dispatch:</strong> Orders are usually dispatched within 1–2 business days after confirmation.
              </li>
              <li>
                <strong>Timeline:</strong> Delivery timelines vary by location and courier partner but generally take 3–7 working days across India.
              </li>
              <li>
                <strong>Coverage:</strong> We currently ship only within India through reputed logistics partners. Tracking details are shared by email or SMS once your order is shipped.
              </li>
              <li>
                <strong>Charges:</strong> Shipping charges may vary based on order size and delivery pin code. Final shipping costs, if any, are shown during checkout.
              </li>
              <li>
                <strong>Accuracy:</strong> Please make sure your delivery address and contact details are accurate. Once dispatched, orders cannot be redirected.
              </li>
              <li>
                <strong>Damage:</strong> If your package appears damaged or tampered with, please refuse delivery and inform us immediately at <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline">contact@grainzzindia.com</a>. We’ll look into it and assist as needed.
              </li>
              <li>
                <strong>Exclusions:</strong> At present, we don’t offer international shipping or cash-on-delivery options.
              </li>
              <li>
                <strong>Bulk Orders:</strong> For corporate or bulk orders, delivery timelines and logistics will be communicated directly by our team.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">Contact Information</h2>
            <p className="flex flex-col gap-1">
              <span>📧 <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline">contact@grainzzindia.com</a></span>
              <span>🌐 <a href="https://www.grainzzindia.com" target="_blank" className="text-brand-green underline">www.grainzzindia.com</a></span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
