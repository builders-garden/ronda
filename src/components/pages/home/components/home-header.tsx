"use client";

import Image from "next/image";

export function HomeHeader() {
  return (
    <div className="flex h-[77px] w-full items-center justify-start border-[rgba(232,235,237,0.5)] border-b bg-white px-6">
      <div className="flex items-center justify-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-zinc-900">
          <Image
            alt="Ronda Logo"
            height={20}
            src="/images/ronda_logo.svg"
            width={20}
          />
        </div>
        <span className="font-bold text-[20px] text-zinc-950 tracking-[-0.5px]">
          Ronda
        </span>
      </div>
    </div>
  );
}
