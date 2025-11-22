import { IdCard, Radio, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { usePageContent } from "@/contexts/page-content-context";
import { PageContent } from "@/lib/enum";
import { cn } from "@/utils";

export const Navbar = () => {
  const { pageContent, setPageContent } = usePageContent();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-between bg-white px-12 py-3.5 text-black"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <motion.button
        onClick={() => setPageContent(PageContent.HOME)}
        whileTap={{ scale: 0.9 }}
      >
        <Radio
          className={cn(
            "size-[26px] transition-all duration-300",
            pageContent === PageContent.HOME ? "text-black" : "text-[#CACACA]"
          )}
          strokeWidth={1.5}
        />
      </motion.button>
      <motion.button
        onClick={() => setPageContent(PageContent.CIRCLES)}
        whileTap={{ scale: 0.9 }}
      >
        <Ticket
          className={cn(
            "size-[26px] transition-all duration-300",
            pageContent === PageContent.CIRCLES
              ? "text-black"
              : "text-[#CACACA]"
          )}
          strokeWidth={1.5}
        />
      </motion.button>
      <motion.button
        onClick={() => setPageContent(PageContent.PROFILE)}
        whileTap={{ scale: 0.9 }}
      >
        <IdCard
          className={cn(
            "size-[26px] transition-all duration-300",
            pageContent === PageContent.PROFILE
              ? "text-black"
              : "text-[#CACACA]"
          )}
          strokeWidth={1.5}
        />
      </motion.button>
    </motion.div>
  );
};
