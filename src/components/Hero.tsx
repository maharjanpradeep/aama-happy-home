import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Star, Clock, AlertCircle, Quote } from 'lucide-react';
import { reviews } from "@/data/reviews";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Auto-import all images from src/assets/photos
const images = import.meta.glob("../assets/photos/*.{jpg,png,jpeg}", { eager: true, import: 'default' });
const photoUrls = Object.values(images) as string[];
import yelpLogo from "@/assets/yelp logo.png";

// Select a focused review for the sneak peek
const FEATURED_REVIEW = reviews[0];

interface HeroProps {
  backToHomeButton?: boolean;
}

const Hero: React.FC<HeroProps> = ({ backToHomeButton }) => {
  const [row1Photos, setRow1Photos] = useState<string[]>([]);
  const [row2Photos, setRow2Photos] = useState<string[]>([]);

  useEffect(() => {
    const mid = Math.ceil(photoUrls.length / 2);
    const firstHalf = photoUrls.slice(0, mid);
    const secondHalf = photoUrls.slice(mid);

    setRow1Photos([...firstHalf, ...firstHalf, ...firstHalf, ...firstHalf, ...firstHalf, ...firstHalf]);
    setRow2Photos([...secondHalf, ...secondHalf, ...secondHalf, ...secondHalf, ...secondHalf, ...secondHalf]);
  }, []);

  const handleScheduleClick = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLearnMoreClick = () => {
    const programsSection = document.getElementById('programs-section');
    if (programsSection) {
      programsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToReviews = () => {
    const section = document.getElementById('about-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Background Ticker */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-[0.10]">
        <div className="absolute inset-x-[-50%] top-[-50%] bottom-[-50%] flex flex-col justify-center gap-8 -rotate-[6deg] scale-110">
          {/* Row 1 */}
          <div className="flex w-max animate-hero-scroll gap-6">
            {row1Photos.map((url, idx) => (
              <div key={`hero-r1-${url}-${idx}`} className="relative w-[350px] h-[250px] md:w-[500px] md:h-[350px] flex-shrink-0 overflow-hidden rounded-[2rem]">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex w-max animate-hero-scroll gap-6" style={{ animationDelay: '-150s', animationDirection: 'reverse' }}>
            {row2Photos.map((url, idx) => (
              <div key={`hero-r2-${url}-${idx}`} className="relative w-[350px] h-[250px] md:w-[500px] md:h-[350px] flex-shrink-0 overflow-hidden rounded-[2rem]">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_auto] gap-12 items-center min-h-[80vh]">

        {/* Main Content (Left/Center) */}
        <div className="text-center lg:text-left mx-auto lg:mx-0 max-w-4xl pt-12 lg:pt-0">
          {/* Scarcity Badge (Updated Style) */}
          <div className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 mb-8 rounded-full bg-white border border-slate-200 shadow-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-slate-500">
              Hurry, only 3 spots left.
            </span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tight text-slate-900">
            Welcome to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-secondary animate-gradient-x">
              Aama Daycare
            </span>
          </h1>

          <p className="text-xl md:text-3xl mb-4 leading-relaxed max-w-2xl font-medium text-slate-600/90">
            A safe, loving daycare in San Ramon, CA — where little dreams grow big.
          </p>
          <p className="text-base md:text-lg mb-10 leading-relaxed max-w-2xl text-slate-500">
            Infant, toddler, preschool &amp; after-school care — proudly serving San Ramon, Dublin, Danville &amp; Pleasanton.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center">
            <button
              onClick={handleScheduleClick}
              className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(var(--primary-rgb),0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
              <span className="relative z-10 text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Schedule Visit ✨
              </span>
            </button>

            <button
              onClick={handleLearnMoreClick}
              className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg bg-white/50 backdrop-blur-md"
            >
              <span className="relative z-10 text-xl font-bold text-slate-700">Learn More</span>
            </button>
          </div>
        </div>

        {/* Floating Review Sneak Peek (Right Side) */}
        <div className="hidden lg:flex flex-col gap-8 items-end animate-slide-in-right opacity-0" style={{ animationDelay: '0.5s' }}>

          {/* Sneak Peek Card */}
          <div
            onClick={scrollToReviews}
            className="relative bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-xl w-[320px] cursor-pointer hover:scale-105 transition-transform group"
          >
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-3 rounded-full shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
              <Quote className="w-5 h-5 fill-current" />
            </div>

            <p className="text-slate-700 font-serif italic text-lg leading-relaxed mb-6">
              "{FEATURED_REVIEW.text.substring(0, 90)}..."
            </p>

            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                <AvatarImage src={FEATURED_REVIEW.image} alt={FEATURED_REVIEW.user} />
                <AvatarFallback>{FEATURED_REVIEW.user[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-slate-900">{FEATURED_REVIEW.user}</div>
                <div className="flex text-yellow-500 text-xs gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
            </div>

            <div className="text-primary text-xs font-bold uppercase tracking-wider mt-4 group-hover:underline">
              Read more stories →
            </div>
          </div>

          {/* Stats (Pushed down slightly) */}
          <div className="flex flex-col gap-8 items-end mt-4">
            {/* Yelp Stat */}
            <a href="https://www.yelp.com/biz/aama-day-care-san-ramon-2?uid=Lbx-MMHku3EXTb9AWGrFsw&utm_campaign=www_business_share_popup&utm_medium=copy_link&utm_source=(direct)" target="_blank" rel="noopener noreferrer" className="group cursor-pointer text-right hover:opacity-80 transition-opacity">
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-7xl font-black text-slate-900 tracking-tighter">5.0</span>
                <div className="flex flex-col items-end leading-none">
                  <span className="text-red-600 font-bold text-xl uppercase tracking-wider flex items-center gap-1">
                    <img src={yelpLogo} alt="Yelp" className="h-8 w-auto object-contain" />
                  </span>
                  <div className="flex text-yellow-500 mt-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>
              </div>
            </a>

            {/* Experience Stat */}
            <div className="text-right">
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-7xl font-black text-slate-900 tracking-tighter">10+</span>
                <div className="flex flex-col items-end leading-none">
                  <span className="text-blue-600 font-bold text-xl uppercase tracking-wider">Years</span>
                  <span className="text-slate-400 font-bold text-sm uppercase">Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats (Stacked) */}
        <div className="lg:hidden flex justify-center gap-8 text-center pb-12 w-full mt-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-slate-900">10+</span>
            <span className="text-xs uppercase font-bold text-blue-600">Years Exp.</span>
          </div>
          <a href="https://www.yelp.com/biz/aama-day-care-san-ramon-2?uid=Lbx-MMHku3EXTb9AWGrFsw&utm_campaign=www_business_share_popup&utm_medium=copy_link&utm_source=(direct)" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <span className="text-4xl font-black text-slate-900 flex items-center gap-1">5.0 <Star className="w-4 h-4 text-yellow-500 fill-current" /></span>
            <span className="text-xs uppercase font-bold text-red-600 flex items-center gap-1"><img src={yelpLogo} alt="Yelp" className="h-5 w-auto" /></span>
          </a>
        </div>

      </div>

      <style>{`
        @keyframes hero-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hero-scroll {
          animation: hero-scroll 400s linear infinite;
          will-change: transform;
        }
        @keyframes gradient-x {
           0%, 100% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
           background-size: 200% 200%;
           animation: gradient-x 6s ease infinite;
        }
        .animate-slide-in-right {
           animation: slideInRight 1s ease-out forwards;
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

// Simple Yelp SVG Icon
const YelpIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.388 15.696L14.77 13.8L16.276 8.52599C16.378 8.16999 16.208 7.78099 15.868 7.64499L14.474 7.08799C14.134 6.95199 13.744 7.12199 13.625 7.47899L12.317 12.05L9.63205 8.12599C9.42805 7.81999 9.00305 7.73499 8.68105 7.93899L7.37305 8.82299C7.05105 9.02699 6.96605 9.45199 7.17005 9.77399L10.958 15.357L5.59205 14.659C5.22805 14.616 4.88005 14.871 4.82905 15.237L4.65905 16.715C4.60805 17.072 4.87205 17.403 5.22805 17.446L11.586 18.278L10.379 23.363C10.294 23.728 10.515 24.085 10.881 24.17L12.359 24.493C12.725 24.57 13.081 24.323 13.166 23.958L14.364 16.715L18.818 19.349C19.123 19.535 19.521 19.442 19.725 19.12L20.523 17.659C20.693 17.337 20.6 16.921 20.278 16.735L19.388 15.696Z" />
    <path d="M12.9877 0.994995C12.6397 0.918995 12.2837 1.13999 12.1907 1.47999L11.0867 5.76199L15.3607 6.84599L14.3247 1.48899C14.2487 1.13999 13.9267 0.918995 13.5617 0.833995L12.9877 0.994995Z" />
  </svg>
)

export default Hero;