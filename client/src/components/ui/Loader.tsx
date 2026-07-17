import React from "react";
import { LOADERS_DATA } from "../../constants/catalog";

interface LoaderProps {
  loaderIndex: number;
  isFullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ loaderIndex, isFullScreen = false }) => {
  const loader = LOADERS_DATA[loaderIndex] || LOADERS_DATA[0];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center text-center gap-5">
      <style>{`
        @keyframes magicalWand {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes sparkFloat1 {
          0% { transform: translateY(10px) translateX(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-30px) translateX(-15px) scale(1.2); opacity: 0; }
        }
        @keyframes sparkFloat2 {
          0% { transform: translateY(10px) translateX(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-35px) translateX(15px) scale(1); opacity: 0; }
        }
        @keyframes shinobiRun {
          0%, 100% { transform: skewX(-20deg) translateY(0); }
          50% { transform: skewX(-22deg) translateY(-4px); }
        }
        @keyframes speedLine {
          0% { transform: translateX(50px) scaleX(0.1); opacity: 0; }
          10%, 80% { opacity: 0.6; }
          100% { transform: translateX(-80px) scaleX(1.5); opacity: 0; }
        }
        @keyframes kiPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px 2px rgba(255,46,67,0.3); }
          50% { transform: scale(1.15); box-shadow: 0 0 35px 8px rgba(255,46,67,0.6); }
        }
        @keyframes sparkSwirl {
          0% { transform: rotate(0deg) scale(1) translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(360deg) scale(0.2) translate(-10px, -10px); opacity: 0; }
        }
        @keyframes sleepBreath {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(1.05) scaleX(1.02); }
        }
        @keyframes zzzFloat {
          0% { transform: translate(15px, 0) scale(0.6); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(30px, -40px) scale(1.2); opacity: 0; }
        }
        @keyframes sushiSlide {
          0% { transform: translateX(-80px) rotate(0deg); }
          40% { transform: translateX(-10px) rotate(0deg); }
          50% { transform: translateX(0px) translateY(-20px) rotate(180deg); }
          60% { transform: translateX(10px) translateY(-20px) rotate(360deg); }
          70% { transform: translateX(20px) translateY(0deg) rotate(360deg); }
          100% { transform: translateX(80px) rotate(360deg); }
        }
        .animate-magicalwand { animation: magicalWand 2s infinite ease-in-out; }
        .animate-shinobirun { animation: shinobiRun 0.5s infinite ease-in-out; }
        .animate-kipulse { animation: kiPulse 1s infinite ease-in-out; }
        .animate-sleepbreath { animation: sleepBreath 3s infinite ease-in-out; }
        .animate-sushislide { animation: sushiSlide 2.5s infinite linear; }
      `}</style>

      {/* Dynamic Animated Mascot */}
      <div className="relative flex items-center justify-center min-h-[72px] w-full">
        {loaderIndex === 0 && (
          <div className="relative w-24 h-20 flex items-center justify-center">
            <div className="text-5xl animate-magicalwand select-none">🪄</div>
            <div className="absolute text-lg select-none pointer-events-none" style={{ animation: "sparkFloat1 1.5s infinite ease-out", left: "20%", top: "30%" }}>💖</div>
            <div className="absolute text-sm select-none pointer-events-none" style={{ animation: "sparkFloat2 1.8s infinite ease-out", right: "20%", top: "20%" }}>✨</div>
            <div className="absolute text-xs select-none pointer-events-none" style={{ animation: "sparkFloat1 1.2s infinite ease-out", right: "30%", top: "50%" }}>⭐</div>
          </div>
        )}
        {loaderIndex === 1 && (
          <div className="relative w-28 h-20 flex flex-col items-center justify-center overflow-hidden">
            <div className="text-5xl select-none" style={{ animation: "shinobiRun 0.5s infinite ease-in-out", transformOrigin: "bottom center" }}>🥷</div>
            <div className="absolute h-0.5 bg-slate-500 rounded-full" style={{ width: "30px", animation: "speedLine 0.5s infinite linear", top: "30%", right: "10%" }} />
            <div className="absolute h-0.5 bg-[#ff2e43]/40 rounded-full" style={{ width: "45px", animation: "speedLine 0.7s infinite linear", top: "50%", right: "5%", animationDelay: "0.2s" }} />
            <div className="absolute h-0.5 bg-slate-500 rounded-full" style={{ width: "25px", animation: "speedLine 0.4s infinite linear", top: "70%", right: "15%", animationDelay: "0.1s" }} />
          </div>
        )}
        {loaderIndex === 2 && (
          <div className="relative w-24 h-20 flex items-center justify-center">
            <div className="w-10 h-10 bg-[#ff2e43] rounded-full flex items-center justify-center shadow-lg animate-kipulse">
              <span className="text-white text-xs select-none font-black">⚡</span>
            </div>
            <div className="absolute w-20 h-20 border border-[#ff2e43]/20 rounded-full" style={{ animation: "spin 2s infinite linear" }} />
            <div className="absolute text-sm select-none" style={{ animation: "sparkSwirl 1.5s infinite ease-in-out", transformOrigin: "40px 40px" }}>🔥</div>
            <div className="absolute text-xs select-none" style={{ animation: "sparkSwirl 1.2s infinite ease-in-out", animationDelay: "0.4s", transformOrigin: "35px 35px" }}>⚡</div>
          </div>
        )}
        {loaderIndex === 3 && (
          <div className="relative w-24 h-20 flex flex-col items-center justify-center">
            <div className="text-5xl select-none animate-sleepbreath" style={{ transformOrigin: "bottom center" }}>🐼</div>
            <div className="absolute text-sm select-none" style={{ top: "10%", left: "45%", animation: "magicalWand 3s infinite ease-in-out" }}>🍃</div>
            <div className="absolute text-xs font-bold text-indigo-400 select-none" style={{ animation: "zzzFloat 2s infinite ease-out" }}>💤</div>
            <div className="absolute text-[10px] font-bold text-indigo-300 select-none" style={{ animation: "zzzFloat 2s infinite ease-out", animationDelay: "0.8s" }}>💤</div>
          </div>
        )}
        {loaderIndex === 4 && (
          <div className="relative w-40 h-20 flex flex-col items-center justify-end overflow-hidden pb-1">
            <div className="text-4xl select-none absolute animate-sushislide" style={{ bottom: "12px" }}>🍣</div>
            <div className="w-32 h-0.5 bg-[#1f212a] rounded-full flex justify-between px-6">
              <span className="text-slate-655 text-[10px] select-none -translate-y-2">🥢</span>
              <span className="text-slate-655 text-[10px] select-none -translate-y-2">🥢</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#ff2e43] animate-pulse">
          {loader.text}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed animate-pulse">
          {loader.subtext}
        </p>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#f3f4f6] flex flex-col items-center justify-center font-sans gap-6 p-4">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#ff2e43]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="bg-[#0f1015]/85 border border-[#1f212a] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
          {loaderContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1015]/40 border border-[#1f212a] rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-6 min-h-[350px] animate-in fade-in duration-300">
      {loaderContent}
    </div>
  );
};
