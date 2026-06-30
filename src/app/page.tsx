import { loadSearchIndex } from "@/lib/data"
import HomeClient from "@/components/HomeClient"

export default function HomePage() {
  const schools = loadSearchIndex()
  return <HomeClient schools={schools} />
}
