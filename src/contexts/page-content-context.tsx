import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { PageContent } from "@/lib/enum";

const PageContentContext = createContext<
  | {
      pageContent: PageContent;
      setPageContent: (content: PageContent) => void;
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
  const [pageContent, setPageContent] = useState<PageContent>(PageContent.HOME);

  const value = useMemo(
    () => ({
      pageContent,
      setPageContent,
    }),
    [pageContent]
  );

  return (
    <PageContentContext.Provider value={value}>
      {children}
    </PageContentContext.Provider>
  );
};
