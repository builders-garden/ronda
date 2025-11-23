"use client";

import dynamic from "next/dynamic";
import type { PageContent } from "@/lib/enum";

const AppContent = dynamic(() => import("@/components/pages/app/app-content"), {
  ssr: true,
  loading: () => <div />,
});

export default function App({
  initialContent,
}: {
  initialContent?: PageContent;
}) {
  return <AppContent initialContent={initialContent} />;
}
