import { loadSearchIndexWithIndices } from "@/lib/data"
import HomeClient from "@/components/HomeClient"

export default function HomePage() {
  const schools = loadSearchIndexWithIndices()
  return <HomeClient schools={schools} />
}
