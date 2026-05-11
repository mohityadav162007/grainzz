import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions – Grainzz',
  description: 'Terms and Conditions for Grainzz Gifting — rules and guidelines for using our website.',
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-[48px] md:py-[64px]">
      <div className="max-w-[720px] mx-auto px-[20px] md:px-[40px]">
        {/* Title */}
        <h1 className="text-[32px] md:text-[40px] font-bold text-brand-black text-center tracking-tight leading-[1.15] mb-[8px]" style={{ fontFamily: 'serif' }}>
          Terms & Conditions
        </h1>
        <p className="text-[13px] text-[#888] text-center mb-[40px] md:mb-[48px]">
          Last updated: May 11, 2026
        </p>

        {/* Content */}
        <div className="space-y-[32px] text-[14px] md:text-[15px] leading-[1.75] text-[#333] font-normal">
          <section>
            <p>
              Welcome to Grainzz Gifting, operated by GRAINZZ India (“we”, “our”, “us”). By visiting our website <a href="https://www.grainzzindia.com" className="text-brand-green underline">www.grainzzindia.com</a> or making a purchase, you agree to the following Terms & Conditions. Please read them carefully before using our website or placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">1. General Information</h2>
            <p>
              This website is operated by GRAINZZ India. Throughout the site, the terms “we”, “us”, and “our” refer to Grainzz India. By accessing or purchasing from our site, you agree to be bound by these Terms of Service, including any additional terms, conditions, and policies referenced herein.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">2. Products and Availability</h2>
            <p>
              All our products are food items—roasted, not fried, made with natural ingredients and limited shelf life. While we strive to keep all products in stock, availability may vary. In the event a product is unavailable, we reserve the right to cancel or modify your order with prior notice and offer an appropriate replacement or refund.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">3. Pricing and Payments</h2>
            <p>
              All prices listed on our website are in INR (₹) and inclusive of applicable GST. We accept online payments via PhonePe, Credit/Debit Cards, UPI, and Net Banking. Orders will only be processed after successful payment confirmation. We reserve the right to modify prices at any time without prior notice, but such changes will not affect orders already placed.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">4. Shipping & Delivery</h2>
            <p>
              Orders are shipped within 1–3 business days and typically delivered within 3–7 business days, depending on the destination. For corporate gifting or bulk orders, shipping timelines may vary based on quantity and customization. For full details, please refer to our <a href="/shipping" className="text-brand-green underline">Shipping Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">5. Returns & Refunds</h2>
            <p>
              Due to the perishable nature of our snacks, we only accept refund requests for damaged or incorrect items reported within 48 hours of delivery. Please email us at <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline">contact@grainzzindia.com</a> with photos of the product and packaging. For detailed conditions, please see our <a href="/returns" className="text-brand-green underline">Refund Policy and Return Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">6. Intellectual Property</h2>
            <p>
              All content on this website, including images, text, product names, and designs, are the exclusive property of Grainzz India. Unauthorized use, reproduction, or distribution of any material is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">7. Third-Party Services</h2>
            <p>
              We may use third-party platforms such as Shopify, PhonePe, or logistics partners to facilitate payments and deliveries. These third parties have their own privacy and data policies, and we encourage users to review them.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">8. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our products or website. All products are manufactured and packaged under FSSAI-approved conditions to ensure safety and quality.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, with jurisdiction in Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-brand-black mb-[12px]">10. Contact Us</h2>
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
