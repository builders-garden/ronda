import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { MainPageContent } from "@/lib/enum";

const PageContentContext = createContext<
  | {
      content: MainPageContent;
      setContent: (content: MainPageContent) => void;
      hasOpenedInitialDrawer: boolean;
      setHasOpenedInitialDrawer: (hasOpened: boolean) => void;
    }
  | undefined
>(undefined);

export const usePageContent = () => {
  const context = useContext(PageContentContext);
  if (!context) {
    throw new Error("usePageContent must be used within a PageContentProvider");
  }
  return context;
};

export const PageContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<MainPageContent>(MainPageContent.HOME);
  const [hasOpenedInitialDrawer, setHasOpenedInitialDrawer] = useState(false);

  const value = useMemo(
    () => ({
      content,
      setContent,
      hasOpenedInitialDrawer,
      setHasOpenedInitialDrawer,
    }),
    [content, hasOpenedInitialDrawer]
  );

  return (
    <PageContentContext.Provider value={value}>
      {children}
    </PageContentContext.Provider>
  );
};
