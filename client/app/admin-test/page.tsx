import Head from 'next/head';

export default function TestPage() {
  return (
    <div className="flex flex-col gap-4 bg-gray-200 min-h-screen">
      <img src="/Slider-Background@2x.png" width={400} />
      <img src="/Content-Background@2x.png" width={400} />
      <img src="/Product-Background@2x.webp" width={400} />
      <img src="/Offer-Background@2x.png" width={400} />
      <img src="/image-24@2x.png" width={200} />
      <img src="/image-23@2x.png" width={200} />
      <img src="/image-25@2x.png" width={200} />
    </div>
  )
}
