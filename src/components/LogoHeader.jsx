import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_1 = "https://media.base44.com/images/public/6a7499a48fdfc7faab5c43f6/ca1df450f_logo1.png";
const LOGO_2 = "https://media.base44.com/images/public/6a7499a48fdfc7faab5c43f6/7f2661709_ChatGPTImageJun28202611_47_45AM.png";

export default function LogoHeader() {
  return (
    <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-white/5 p-1">
        <Image
          src={LOGO_1}
          alt="לוגו 1"
          fittingType="fit"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-white/5 p-1">
        <Image
          src={LOGO_2}
          alt="לוגו 2"
          fittingType="fit"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}