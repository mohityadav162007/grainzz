'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col animate-pulse">
      {/* Image Container Skeleton */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 w-full mb-4">
        {/* Bottom Right Scoop Button Placeholder */}
        <div className="absolute bottom-0 right-0">
          <div className="relative w-[48px] h-[48px] md:w-[60px] md:h-[60px] bg-white rounded-tl-[24px] md:rounded-tl-[30px] flex items-center justify-center">
            <div className="w-[36px] h-[36px] md:w-[44px] md:h-[44px] bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="flex flex-col space-y-3">
        {/* Tags Placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-12 bg-gray-100 rounded-[4px]" />
          <div className="h-6 w-16 bg-gray-100 rounded-[4px]" />
        </div>

        {/* Title Placeholder */}
        <div className="h-7 w-3/4 bg-gray-100 rounded-md" />

        {/* Subtitle Placeholder */}
        <div className="h-4 w-1/2 bg-gray-100 rounded-md" />

        {/* Price Placeholder */}
        <div className="h-7 w-1/4 bg-gray-100 rounded-md mt-1" />
      </div>
    </div>
  );
}
