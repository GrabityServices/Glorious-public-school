import Hero from "./components/Hero";
import AboutSnapshot from "./components/AboutSnapshot";
import AcademicsSnapshot from "./components/AcademicsSnapshot";
import FacilitiesSnapshot from "./components/FacilitiesSnapshot";
import NoticeEventsSection from "./components/NoticeEventsSection";
import StatsSection from "./components/StatsSection";
import ApplyBanner from "./components/ApplyBanner";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("Glorious Public School | Excellence in Education | Jhajha, Bihar");

  return (
    <div>
      <Hero />
      <AboutSnapshot />
      <AcademicsSnapshot />
      <FacilitiesSnapshot />
      <NoticeEventsSection />
      <StatsSection />
      <ApplyBanner />
    </div>
  );
}
