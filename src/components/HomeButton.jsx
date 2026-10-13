import React from "react";
import { Image } from "@/components/ui/image";

const HOME_URL = "https://totem-smart-flow.base44.app/";
const HOME_ICON = "https://media.base44.com/images/public/user_6885e537f90714e91be36212/5d2d4d14b_home-btn.png";

export default function HomeButton() {
  const handleClick = () => {
    window.location.href = HOME_URL;
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: "clamp(55px, 8vw, 85px)",
        height: "clamp(55px, 8vw, 85px)",
        backgroundColor: "rgba(247, 179, 124, 0.9)",
      }}
      className="rounded-full overflow-hidden shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      aria-label="חזרה לדף הבית"
    >
      <Image
        src={HOME_ICON}
        alt="בית"
        fittingType="fit"
        className="w-[70%] h-[70%]"
      />
    </button>
  );
}