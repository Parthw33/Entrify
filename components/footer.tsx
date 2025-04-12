import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center justify-center text-center">
          <div className="flex items-center justify-center mb-3">
            <Image
              src="/data-elegance-logo.png"
              alt="Data Elegance Logo"
              width={120}
              height={40}
              className="h-20 w-auto "
              priority
            />
          </div>
          <div className=" items-center justify-center text-center ml-5 mb-3">
            <p className="text-sm font-medium text-slate-700">
              © {new Date().getFullYear()} DataElegance Solution LLP
            </p>
            <p className="flex flex-col text-xs text-slate-500 mt-1">
              Rajendra Wattamwar & Sulbha Wattamwar
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Contact Details: 8087067067/8788363612
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
