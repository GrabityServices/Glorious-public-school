
import Hero from "./components/Hero";
import AboutSnapshot from "./components/AboutSnapshot";
import AcademicsSnapshot from "./components/AcademicsSnapshot";
import FacilitiesSnapshot from "./components/FacilitiesSnapshot";
import NoticeEventsSection from "./components/NoticeEventsSection";
import StatsSection from "./components/StatsSection";
import ApplyBanner from "./components/ApplyBanner";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle(
    "The Glorious School | Koltex, Jhajha, Jamui",
    {
      path: "/",

      description:
        "The Glorious School, Koltex, Jhajha, Jamui, Bihar is an English-medium co-educational school offering quality education from Nursery to Class 10th following the CBSE pattern. Explore modern classrooms, Science and Computer Labs, Library, Hostel and Transport facilities.",

      keywords: [
        "The Glorious School",
        "Glorious School",
        "Glorious Public School",
        "gpsjhajha",
        "gps jhajha",
        "gpskoltex",
        "gps koltex",
        "gloriousschool",
        "glorious school jhajha",
        "glorious public school jhajha",
        "Glorious School Koltex",
        "Glorious School Jamui",
        "GPS Jhajha Bihar",
        "GPS Koltex Jhajha",
        "best school in Jhajha",
        "best school in Jamui",
        "school in Koltex",
        "CBSE pattern school Jhajha",
        "English medium school Jhajha",
        "Nursery to Class 10 school Jhajha",
        "school in Jamui Bihar",
        "co-educational school Jhajha",
      ].join(", "),

      aeoSummary:
        "The Glorious School (Glorious Public School), located in Koltex, Jhajha, District Jamui, Bihar, is an English-medium co-educational school offering education from Nursery to Class 10th following the CBSE/NCERT pattern. Established in 2004, the school provides smart classrooms, Science and Computer Labs, Library, Hostel and GPS-tracked transport facilities.",

      faqs: [
        {
          question: "Where is The Glorious Public School located?",
          answer:
            "The Glorious Public School is located at Koltex, Jamui Road, Jhajha, District Jamui, Bihar - 811308, India.",
        },
        {
          question: "Which classes are available at The Glorious Public School?",
          answer:
            "The Glorious Public School offers English-medium education from Nursery, LKG and UKG through Primary Classes 1 to 5, Middle Classes 6 to 8 and Secondary Classes 9 to 10.",
        },
        {
          question: "Does The Glorious Public School follow the CBSE curriculum?",
          answer:
            "The Glorious Public School follows the CBSE/NCERT pattern of education for students from Nursery to Class 10th.",
        },
        {
          question: "What are the school timings?",
          answer:
            "Academic hours are 8:00 AM to 2:30 PM, Monday to Saturday. Morning reporting time is 7:50 AM. The administrative and admission office remains open from 8:00 AM to 4:00 PM.",
        },
      ],
    }
  );

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
