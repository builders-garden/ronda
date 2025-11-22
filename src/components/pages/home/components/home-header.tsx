import { Bell } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function HomeHeader() {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex h-[64px] w-full items-center justify-between border-border border-b bg-foreground px-6">
      <div className="flex cursor-pointer items-center justify-start gap-2">
        <Image
          alt="RONDA Logo"
          height={36}
          src="/images/ronda_logo.svg"
          width={36}
        />
        <span className="font-extrabold text-muted text-xl">RONDA</span>
      </div>
      <motion.button
        className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
        type="button"
        whileTap={{ scale: 0.98 }}
      >
        <Bell className="size-6 text-muted" strokeWidth={2} />
      </motion.button>
    </div>
  );
}
