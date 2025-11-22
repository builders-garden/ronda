import { House, UsersRound } from "lucide-react";
import { motion } from "motion/react";
import { usePageContent } from "@/contexts/page-content-context";
import { PageContent } from "@/lib/enum";
import { cn } from "@/utils";
import { UserProfile } from "./user-profile";

export const Navbar = () => {
  const { pageContent, setPageContent } = usePageContent();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed right-0 bottom-0 left-0 z-50 flex h-[64px] w-full items-center justify-between border-border border-t bg-foreground px-12 text-muted"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <motion.button
        className="cursor-pointer"
        onClick={() => setPageContent(PageContent.HOME)}
        whileTap={{ scale: 0.9 }}
      >
        <House
          className={cn(
            "size-[22px] transition-all duration-300",
            pageContent === PageContent.HOME
              ? "text-primary"
              : "text-muted-foreground"
          )}
          strokeWidth={2}
        />
      </motion.button>
      <motion.button
        className="cursor-pointer"
        onClick={() => setPageContent(PageContent.CIRCLES)}
        whileTap={{ scale: 0.9 }}
      >
        <UsersRound
          className={cn(
            "size-[22px] transition-all duration-300",
            pageContent === PageContent.CIRCLES
              ? "text-primary"
              : "text-muted-foreground"
          )}
          strokeWidth={2}
        />
      </motion.button>
      <UserProfile
        onClick={() => setPageContent(PageContent.PROFILE)}
        pageContent={pageContent}
      />
    </motion.div>
  );
};
