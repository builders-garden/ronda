import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function LoadingPage() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex h-screen items-center justify-center"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Loader2 className="h-10 w-10 animate-spin text-muted" />
    </motion.div>
  );
}
