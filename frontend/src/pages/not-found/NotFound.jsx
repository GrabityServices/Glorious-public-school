import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Home, Phone } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function NotFoundPage() {
  useDocumentTitle("Page Not Found | Glorious Public School");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        padding: "60px 24px",
      }}
    >
      <FadeUp>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px auto",
            color: "var(--primary-dark)",
          }}
        >
          <GraduationCap size={40} />
        </div>
        <span className="section-subtitle">404 Error</span>
        <h1 style={{ fontSize: "40px", margin: "12px 0 16px 0", color: "var(--primary-dark)" }}>
          Page Not Found
        </h1>
        <p
          style={{
            maxWidth: "500px",
            margin: "0 auto 32px auto",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "var(--text-muted)",
          }}
        >
          The page you requested may have moved or does not exist. Explore our academic curriculum or return to the school homepage.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return to School Home</span>
          </Link>
          <Link to="/admissions" className="btn btn-gold">
            <span>Online Admission (Nursery - 10th)</span>
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}
