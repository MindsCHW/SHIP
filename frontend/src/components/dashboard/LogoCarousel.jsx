import React, { useMemo } from 'react';

const LogoCarousel = () => {
  const logos = useMemo(() => {
    // Dynamically import all logos from the assets/logos1 directory
    const modules = import.meta.glob('../../assets/logos1/*.{png,svg,jpg,jpeg,webp}', { eager: true });
    return Object.values(modules).map((mod) => mod.default);
  }, []);

  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden flex items-center h-full ml-10 relative">
      <style>
        {`
          .logo-track {
            display: flex;
            width: max-content;
            will-change: transform;
            animation: scrollTrack 20s linear infinite;
          }
          .logo-track:hover {
            animation-play-state: paused;
          }
          @keyframes scrollTrack {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .carousel-logo {
            height: 34px;
            width: auto;
            max-width: none;
            flex-shrink: 0;
            object-fit: contain;
            transition: transform 0.25s ease, filter 0.25s ease;
            cursor: pointer;
          }
          .carousel-logo:hover {
            transform: scale(1.08);
            filter: drop-shadow(0 8px 24px rgba(0,0,0,0.12));
          }
          @media (min-width: 640px) {
            .carousel-logo { height: 42px; }
          }
          @media (min-width: 768px) {
            .carousel-logo { height: 52px; }
          }
        `}
      </style>
      <div className="logo-track">
        {/* First Sequence */}
        <div className="flex items-center shrink-0 min-w-max gap-6 sm:gap-9 md:gap-12 pr-6 sm:pr-9 md:pr-12">
          {logos.map((logo, index) => (
            <img key={`logo-1-${index}`} src={logo} alt={`Logo ${index + 1}`} className="carousel-logo" />
          ))}
        </div>
        {/* Second Sequence */}
        <div className="flex items-center shrink-0 min-w-max gap-6 sm:gap-9 md:gap-12 pr-6 sm:pr-9 md:pr-12">
          {logos.map((logo, index) => (
            <img key={`logo-2-${index}`} src={logo} alt={`Logo ${index + 1}`} className="carousel-logo" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoCarousel;
