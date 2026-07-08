"use client";

export default function FlowbeeLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 bg-[#f97316]/5 rounded-full blur-2xl animate-ping" style={{ animationDuration: '3s' }} />
        <img 
          src="https://flowbee.io/images/logo.png" 
          alt="loading" 
          className="h-6.5 w-auto object-contain animate-pulse z-10" 
        />
      </div>
    </div>
  );
}
