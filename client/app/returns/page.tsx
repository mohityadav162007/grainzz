import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy – Grainzz',
  description: 'Return and Refund Policy for Grainzz — how we handle returns and refunds for our food products.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-[48px] md:py-[64px]">
      <div className="max-w-[720px] mx-auto px-[20px] md:px-[40px]">
        {/* Title */}
        <h1 className="text-[32px] md:text-[40px] font-bold text-brand-black text-center tracking-tight leading-[1.15] mb-[8px]" style={{ fontFamily: 'serif' }}>
          Return & Refund Policy
        </h1>
        <p className="text-[13px] text-[#888] text-center mb-[40px] md:mb-[48px]">
          Last updated: May 10, 2026
        </p>

        {/* Content */}
        <div className="space-y-[32px] md:space-y-[40px] text-[14px] md:text-[15px] leading-[1.75] text-[#333] font-normal">
          <section>
            <p className="mb-[16px]">
              At Grainzz Gifting, every order is packed with care to ensure you receive your snacks fresh and intact.
            </p>
            <ul className="list-disc pl-[24px] space-y-[12px]">
              <li>
                <strong>Food Items:</strong> Since our products are food items, we do not accept returns once a package has been opened or consumed.
              </li>
              <li>
                <strong>Damaged Items:</strong> If you receive a wrong, damaged, or tampered product, please reach out to us at <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline">contact@grainzzindia.com</a> within 48 hours of delivery.
              </li>
              <li>
                <strong>Verification:</strong> Include your order number and clear photos of the item and packaging, this helps us verify and resolve the issue quickly.
              </li>
              <li>
                <strong>Resolution:</strong> Once verified, we’ll issue a replacement or refund for the affected item.
              </li>
              <li>
                <strong>Refund Process:</strong> Refunds are processed to your original payment method within 7–10 working days after approval.
              </li>
              <li>
                <strong>Exclusions:</strong> Refunds are not applicable for taste preferences, minor packaging variations, or delays caused by courier partners.
              </li>
              <li>
                <strong>Cancellations:</strong> We currently don’t support exchanges or cancellations after an order has been dispatched.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">Contact Information</h2>
            <p className="flex flex-col gap-1">
              <span>📧 <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline">contact@grainzzindia.com</a></span>
              <span>🌐 <a href="https://www.vitaliciousindia.com" target="_blank" className="text-brand-green underline">www.vitaliciousindia.com</a></span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
