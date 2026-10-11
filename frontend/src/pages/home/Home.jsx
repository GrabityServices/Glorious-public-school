import Hero from "./components/Hero";
import AboutSnapshot from "./components/AboutSnapshot";
import AcademicsSnapshot from "./components/AcademicsSnapshot";
import FacilitiesSnapshot from "./components/FacilitiesSnapshot";
import NoticeEventsSection from "./components/NoticeEventsSection";
import StatsSection from "./components/StatsSection";
import ApplyBanner from "./components/ApplyBanner";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("Glorious Public School | Nursery to Class 10th | Jhajha, Jamui, Bihar", {
    path: "/",
    description:
      "Glorious Public School, Jamui Road, Jhajha (Bihar) is a premier English-medium co-educational school from Nursery to Class 10th (CBSE Pattern) offering Smart Classrooms, Science & Computer Labs, Library, Hostel, and School Bus Transport.",
    keywords:
      "Glorious Public School, Glorious Public School Jhajha, best school in Jhajha, best school in Jamui, CBSE pattern school Jhajha, Nursery to Class 10th school Bihar, English medium school Jhajha",
    aeoSummary:
      "Glorious Public School in Jhajha, District Jamui, Bihar is an English-medium CBSE-pattern co-educational school (Nursery to Class 10th) founded in 2004, featuring smart classrooms, labs, residential hostel, and GPS-tracked transport.",
    faqs: [
      {
        question: "Where is Glorious Public School located?",
        answer:
          "Glorious Public School is located on Jamui Road, Jhajha, District Jamui, Bihar - 811308, India.",
      },
      {
        question: "Which classes are taught at Glorious Public School, Jhajha?",
        answer:
          "Glorious Public School provides English-medium education from Pre-Primary (Nursery, LKG, UKG) through Primary (Class 1–5), Middle (Class 6–8), and Secondary (Class 9–10) following the CBSE/NCERT curriculum.",
      },
      {
        question: "What are the official school timings of Glorious Public School?",
        answer:
          "Official academic hours are 8:00 AM to 2:30 PM from Monday to Saturday (Morning reporting 7:50 AM). The administrative and admission office remains open from 8:00 AM to 4:00 PM.",
      },
    ],
  });

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
