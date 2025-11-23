import type { Metadata } from "next";
import { App } from "@/components/pages/app";
import { type CirclesPageContent, MainPageContent } from "@/lib/enum";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Launch Ronda",
    action: {
      type: "launch_frame",
      name: "Ronda",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export function generateMetadata(): Metadata {
  return {
    title: "Ronda",
    openGraph: {
      title: "Ronda",
      description:
        "Ronda is an onchain rotating savings and credit association (ROSCA) built into a Farcaster mini app",
      images: [
        {
          url: `${appUrl}/images/feed.png`,
          width: 1500,
          height: 1000,
          alt: "Ronda - Onchain ROSCA Savings App",
        },
      ],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function Circles({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <App
      initialContent={
        {
          content: MainPageContent.CIRCLES,
          circleAddress: address,
        } as CirclesPageContent
      }
    />
  );
}
