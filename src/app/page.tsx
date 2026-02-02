import { getLiveAssets } from "@/lib/getAssets";
import { exchangeList } from "@/config/exchanges";
import HomeClient from "@/components/HomeClient";

// Revalidate every 5 minutes — pulls fresh data from exchanges
export const revalidate = 300;

export default async function Home() {
  const assets = await getLiveAssets();

  return (
    <HomeClient
      assets={assets}
      exchangeCount={exchangeList.length}
    />
  );
}
