import React from 'react';

interface SampleAdProps {
  type: 'banner' | 'sidebar' | 'inline' | 'footer';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SampleAd: React.FC<SampleAdProps> = ({
  type,
  size = 'medium',
  className = ''
}) => {
  // Sample ad content variations
  const sampleAds = {
    baby: {
      title: "Bebek Bezi Fırsatları",
      description: "Premium bebek bezlerinde %30 indirim! Ücretsiz kargo avantajı ile.",
      brand: "BabyComfort",
      image: "👶",
      bgColor: "from-pink-100 to-rose-100",
      textColor: "text-pink-800"
    },
    health: {
      title: "Hamilelik Vitaminleri",
      description: "Doktor önerili vitamin kompleksleri. Sağlıklı hamilelik için.",
      brand: "HealthPlus",
      image: "🤱",
      bgColor: "from-green-100 to-emerald-100",
      textColor: "text-green-800"
    },
    family: {
      title: "Aile Sigortası",
      description: "Aileniniz için en kapsamlı sigorta planları. Hemen teklif alın.",
      brand: "FamilyGuard",
      image: "👨‍👩‍👧‍👦",
      bgColor: "from-blue-100 to-cyan-100",
      textColor: "text-blue-800"
    },
    education: {
      title: "Çocuk Gelişim Kursları",
      description: "Çocuğunuzun gelişimi için uzman eğitmenlerden online kurslar.",
      brand: "KidsLearn",
      image: "📚",
      bgColor: "from-purple-100 to-violet-100",
      textColor: "text-purple-800"
    }
  };

  // Randomly select a sample ad
  const adKeys = Object.keys(sampleAds) as (keyof typeof sampleAds)[];
  const randomAd = sampleAds[adKeys[Math.floor(Math.random() * adKeys.length)]];

  // Determine dimensions based on type and size
  const getDimensions = () => {
    switch (type) {
      case 'banner':
        return size === 'large' ? 'w-full h-24' : size === 'small' ? 'w-80 h-16' : 'w-96 h-20';
      case 'sidebar':
        return size === 'large' ? 'w-80 h-64' : size === 'small' ? 'w-64 h-48' : 'w-72 h-56';
      case 'inline':
        return size === 'large' ? 'w-full h-32' : size === 'small' ? 'w-80 h-20' : 'w-96 h-24';
      case 'footer':
        return size === 'large' ? 'w-full h-28' : size === 'small' ? 'w-80 h-18' : 'w-96 h-22';
      default:
        return 'w-96 h-24';
    }
  };

  const isVertical = type === 'sidebar';

  return (
    <div className={`${getDimensions()} ${className} relative`}>
      {/* Sample Ad Container */}
      <div className={`
        w-full h-full
        bg-gradient-to-br ${randomAd.bgColor}
        border border-gray-200
        rounded-lg
        p-3
        flex ${isVertical ? 'flex-col' : 'items-center'}
        justify-between
        shadow-sm
        hover:shadow-md
        transition-shadow
        cursor-pointer
        relative
        overflow-hidden
      `}>
        {/* Debug Label */}
        <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-800 text-xs px-1 py-0.5 rounded text-[10px] font-medium">
          DEBUG
        </div>

        {/* Ad Content */}
        <div className={`flex ${isVertical ? 'flex-col items-center text-center' : 'items-center'} flex-1`}>
          {/* Icon/Image */}
          <div className={`text-2xl ${isVertical ? 'mb-2' : 'mr-3'}`}>
            {randomAd.image}
          </div>

          {/* Text Content */}
          <div className={`flex-1 ${isVertical ? 'text-center' : ''}`}>
            <h3 className={`font-semibold ${randomAd.textColor} text-sm leading-tight`}>
              {randomAd.title}
            </h3>
            <p className={`text-xs text-gray-600 mt-1 ${isVertical ? '' : 'hidden sm:block'}`}>
              {randomAd.description}
            </p>
            {isVertical && (
              <div className="mt-2">
                <button className="bg-white text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50 transition-colors">
                  Detayları Gör
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Brand/CTA */}
        {!isVertical && (
          <div className="ml-2">
            <button className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors">
              {randomAd.brand}
            </button>
          </div>
        )}

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] bg-repeat"></div>
        </div>
      </div>
    </div>
  );
};