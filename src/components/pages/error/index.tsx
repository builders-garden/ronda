import { motion } from "motion/react";

export default function ErrorPage() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex h-full min-h-screen flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-5 text-center">
        <h1 className="font-bold text-red-500 text-xl">
          An error occurred
          <br />
          Please try again later
        </h1>
      </div>
    </motion.div>
  );
}
