import React from "react";
import LogoHeader from "@/components/LogoHeader";
import HomeButton from "@/components/HomeButton";
import FullscreenButton from "@/components/FullscreenButton";

export default function ScreenHeader() {
  return (
    <div className="absolute top-4 inset-x-4 md:top-6 md:inset-x-6 z-50 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto">
        <LogoHeader />
      </div>
      <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
        <HomeButton />
        <FullscreenButton />
      </div>
    </div>
  );
}