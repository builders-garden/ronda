import App from "@/components/pages/app/app";
import { MainPageContent } from "@/lib/enum";

export default function Home() {
  return <App initialContent={{ content: MainPageContent.HOME }} />;
}
