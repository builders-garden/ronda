"use client";

import { FlaskConical } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
export function HomeHeader() {
  const router = useRouter();
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
      <motion.button
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-medium text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
        onClick={async () => {
          await router.push("/test");
        }}
        whileTap={{ scale: 0.95 }}
      >
        <FlaskConical className="size-4" strokeWidth={2} />
        <span>Test</span>
      </motion.button>
    </div>
  );
}
