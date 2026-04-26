'use client';
import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getSiteContent, getProductBySlug } from '@/lib/api';

export default function EssentialSnackBox() {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [featuredConfig, setFeaturedConfig] = useState<any>(null);
  const [selectedBox, setSelectedBox] = useState('Box of 6 Grainzz');
  const { addItem } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await getSiteContent('featured_product');
        if (config) {
          setFeaturedConfig(config);
          const slug = config.slug || 'essential-snack-box-mixed';
          try {
            const res = await getProductBySlug(slug);
            if (res.data) setProduct(res.data);
          } catch {}
        }
      } catch {}
    };
    loadData();
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: `${product.name} - ${selectedBox}`,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: qty,
      tags: [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const heading = featuredConfig?.heading || 'The Essential Snack Box';
  const supportingLine = featuredConfig?.supporting_line || product?.nutrition_info || 'High-Fibre | No Palm Oil | Baked Crunch';
  const description = featuredConfig?.description || product?.description || 'Lorem ipsum dolor sit amet consectetur. Cursus consequat consectetur quisque id sollicitudin. Elit aliquet fusce vel aliquet interdum aenean.';
  const price = product?.price || 149;
  const mrp = product?.mrp || 199;

  return (
    <section className="py-[40px] md:py-[60px] bg-[#FCF9F2] w-full border-y border-[#EEEEEE]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        <div className="flex flex-col lg:flex-row items-start gap-[40px] md:gap-[60px]">
          
          {/* Product Image */}
          <div className="w-full lg:w-[460px] xl:w-[500px] h-auto relative rounded-[20px] overflow-hidden bg-[#F9F7F3] border border-[#EAEAEA] flex-shrink-0">
            {/* Discount Pill */}
             <div className="absolute top-[20px] right-[20px] w-[20px] h-[20px] bg-white rounded-[4px] p-[3px] z-10 shadow-sm flex items-center justify-center border border-[#e0e0e0]">
               <div className="w-[10px] h-[10px] rounded-full bg-brand-green" />
             </div>
            <img
              src={product?.images?.[0] || '/Rectangle-10@2x.png'}
              alt={heading}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>

          {/* Product Content */}
          <div className="flex-1 flex flex-col items-start pt-[10px]">
            <h2 className="m-0 text-[32px] md:text-[36px] font-bold text-brand-black leading-[1.2] tracking-tight font-sans mb-[8px]">
              {heading}
            </h2>
            <div className="text-[14px] md:text-[16px] text-[#666666] leading-[1.5] font-sans font-medium mb-[20px]">
              {supportingLine}
            </div>

            <div className="flex items-center gap-[12px] text-brand-black mb-[32px]">
              <span className="text-[32px] md:text-[36px] font-bold leading-[1] font-sans tracking-tight">₹{price}</span>
              <span className="text-[18px] md:text-[20px] text-[#999999] font-medium line-through font-sans">MRP ₹{mrp}</span>
            </div>

            {/* Select Box Size */}
            <div className="w-full mb-[20px]">
              <p className="text-[14px] md:text-[15px] font-bold text-brand-black mb-[12px]">Select your box</p>
              <div className="flex flex-wrap gap-[12px]">
                {['Box of 6 Grainzz', 'Box of 10 Grainzz'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedBox(opt)}
                    className={`px-[20px] py-[8px] md:py-[10px] rounded-full text-[13px] md:text-[14px] font-bold transition-all border ${
                      selectedBox === opt 
                        ? 'bg-white border-brand-black justify-center items-center flex' 
                        : 'bg-white border-[#EAEAEA] text-[#666666] hover:border-[#cccccc]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="w-full mb-[40px]">
              <p className="text-[15px] font-bold text-brand-black mb-[8px]">Description</p>
              <p className="text-[14px] leading-[1.6] text-[#666666] font-medium max-w-[580px]">
                {description}
              </p>
            </div>

            {/* Purchase Row */}
            <div className="w-full flex flex-col gap-[12px] md:gap-[16px]">
              <div className="flex flex-row items-center gap-[12px] md:gap-[16px] w-full">
                {/* Quantity */}
                <div className="flex items-center gap-[16px] md:gap-[20px] min-w-[120px] justify-between border-[1.5px] border-[#EAEAEA] rounded-[40px] px-[16px] py-[10px] md:py-[12px] bg-white">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex items-center justify-center text-[#888888] hover:text-brand-black transition-colors"
                  >
                    <Minus size={18} strokeWidth={2} />
                  </button>
                  <span className="text-[16px] md:text-[18px] font-bold text-brand-black">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="flex items-center justify-center text-[#888888] hover:text-brand-black transition-colors"
                  >
                    <Plus size={18} strokeWidth={2} />
                  </button>
                </div>

                {/* Add to Cart Outline */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 w-full h-[48px] md:h-[54px] border-[1.5px] border-brand-black bg-transparent text-brand-black rounded-[40px] font-bold text-[15px] md:text-[16px] hover:bg-[#EAEAEA] transition-all cursor-pointer tracking-wide"
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>

              {/* Quick Buy Solid Block */}
              <button 
                className="w-full h-[48px] md:h-[54px] bg-brand-black text-white rounded-[40px] font-bold text-[15px] md:text-[16px] hover:bg-[#333] transition-all cursor-pointer tracking-wide border-none"
              >
                Quick Buy
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
