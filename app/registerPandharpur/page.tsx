"use client";

import PandharpurRegistrationForm from "./components/PandharpurRegistrationForm";
import Image from "next/image";

export default function RegisterPandharpurPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
          <Image
            src="https://res.cloudinary.com/ddrxbg3h9/image/upload/v1741503397/Sneh_melava_brpsgc.png"
            alt="स्नेहबंध मेळावा"
            className="w-full h-auto rounded-lg shadow-lg"
            width={8000}
            height={300}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">पंढरपूर विशेष नोंदणी</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Registration is Closed Now !
        </p>
      </div>
      {/* <PandharpurRegistrationForm /> */}
    </div>
  );
}
