interface AdBannerProps {
  position: 'header' | 'sidebar' | 'grid' | 'content';
  className?: string;
}

export default function AdBanner({ position, className }: AdBannerProps) {
  // Placeholder for AdSense
  return (
    <div className={`bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium overflow-hidden ${className}`}>
      {position === 'header' && <div className="w-full h-24">Advertisement Banner</div>}
      {position === 'sidebar' && <div className="w-full h-64">Sidebar Ad</div>}
      {position === 'grid' && <div className="w-full h-full min-h-[300px]">Sponsored Tool</div>}
      {position === 'content' && <div className="w-full h-32 my-8">Content Ad</div>}
    </div>
  );
}
