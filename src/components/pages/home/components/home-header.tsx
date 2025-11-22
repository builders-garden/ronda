import { Bell } from "lucide-react";
import Image from "next/image";

export function HomeHeader() {
  return (
    <div className="flex w-full items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Image
          alt="RONDA Logo"
          height={32}
          src="/images/ronda_logo.svg"
          width={32}
        />
        <span className="font-bold text-black text-xl">RONDA</span>
      </div>
      <button className="rounded-full p-2 hover:bg-gray-100" type="button">
        <Bell className="size-6 text-black" />
      </button>
    </div>
  );
}
