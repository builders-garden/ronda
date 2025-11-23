"use client";

import Image from "next/image";
export function HomeHeader() {
  return (
    <div className="flex h-[77px] w-full items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-6">
      <div className="flex items-center justify-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-zinc-900">
          <Image
            alt="Ronda Logo"
            height={28}
            src="/images/ronda_logo.svg"
            width={28}
          />
        </div>
        <span className="font-bold text-[22px] text-zinc-950 tracking-[-0.5px]">
          Ronda
        </span>
      </div>
    </div>
  );
}
