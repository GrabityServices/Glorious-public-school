import { useEffect } from "react";

const SITE_URL = "https://gloriouspublicschool.com";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;
const DEFAULT_LOGO_URL = `${SITE_URL}/images/glorious-public-school-logo.png`;

function upsertMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(url) {
  if (!url) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function upsertJsonLd(id, schemaData) {
  let script = document.getElementById(id);
  if (!schemaData) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Custom SEO & AEO (Answer Engine Optimization) Hook
 * Manages document title, meta description, keywords, canonical URL,
 * Open Graph (with secure_url, type, width, height, alt), X/Twitter cards,
 * and Schema.org @graph (WebSite, WebPage, School with AggregateRating,
 * ImageObject #logo, BreadcrumbList, and AEO FAQPage).
 *
 * @param {string} title - Page title
 * @param {object} [seo] - Page-specific SEO & AEO options
 */
export default function useDocumentTitle(title, seo = {}) {
  const {
    description,
    keywords,
    path,
    ogType = "website",
    image = DEFAULT_SOCIAL_IMAGE,
    imageAlt = "Glorious Public School Logo",
    noindex = false,
    breadcrumbs = [],
    faqs = [],
    aeoSummary = "",
    schemaType = "WebPage",
    extraSchema = null,
  } = seo;

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const currentPath =
      path || (typeof window !== "undefined" ? window.location.pathname : "/");
    const isAdminOrAuth =
      noindex ||
      currentPath.startsWith("/admin") ||
      currentPath.startsWith("/login");

    const canonicalUrl = `${SITE_URL}${currentPath === "/" ? "/" : currentPath}`;
    const metaDesc =
      description ||
      "Glorious Public School, Jamui Road, Jhajha, Bihar offers quality English-medium education from Nursery to Class 10th, focusing on academic excellence, discipline, and holistic development.";
    const metaKeywords =
      keywords ||
      "Glorious Public School, Glorious Public School Jhajha, school in Jhajha, best school in Jamui, CBSE pattern school Jhajha, Nursery to Class 10th Bihar, school admission Jhajha";

    // Basic & Standard SEO Meta Tags
    upsertMeta("name", "description", metaDesc);
    upsertMeta("name", "keywords", metaKeywords);
    upsertMeta("name", "author", "Glorious Public School");
    upsertMeta("name", "theme-color", "#0d47a1");
    upsertMeta(
      "name",
      "robots",
      isAdminOrAuth
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    upsertMeta(
      "name",
      "googlebot",
      isAdminOrAuth
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    upsertMeta(
      "name",
      "bingbot",
      isAdminOrAuth
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    upsertMeta("name", "format-detection", "telephone=no");
    upsertMeta("name", "apple-mobile-web-app-capable", "yes");
    upsertMeta("name", "apple-mobile-web-app-status-bar-style", "default");
    upsertMeta("name", "apple-mobile-web-app-title", "Glorious Public School");
    upsertMeta("name", "application-name", "Glorious Public School");
    upsertCanonical(canonicalUrl);

    // Open Graph (WhatsApp / Facebook / LinkedIn)
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:locale", "en_IN");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", metaDesc);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:site_name", "Glorious Public School");
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:image:secure_url", image);
    upsertMeta("property", "og:image:type", "image/png");
    upsertMeta("property", "og:image:width", "512");
    upsertMeta("property", "og:image:height", "512");
    upsertMeta("property", "og:image:alt", imageAlt);

    // X / Twitter Card Meta Tags
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", metaDesc);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:image:alt", imageAlt);

    if (isAdminOrAuth) {
      upsertJsonLd("page-seo-aeo-schema", null);
      return;
    }

    // Build Complete Schema.org @graph (WebSite + WebPage + School + ImageObject + BreadcrumbList + AEO FAQPage)
    const crumbItems =
      breadcrumbs.length > 0
        ? breadcrumbs
        : currentPath === "/"
        ? [{ name: "Home", path: "/" }]
        : [
            { name: "Home", path: "/" },
            {
              name: title ? title.split("|")[0].split("—")[0].trim() : "Page",
              path: currentPath,
            },
          ];

    const webPageNode = {
      "@type": schemaType,
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description: metaDesc,
      inLanguage: "en-IN",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#school`,
      },
      primaryImageOfPage: {
        "@id": `${SITE_URL}/#logo`,
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", "main p", ".speakable"],
      },
    };

    if (aeoSummary) {
      webPageNode.abstract = aeoSummary;
    }

    const graph = [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Glorious Public School",
        alternateName: "Glorious Public School Jhajha",
        description:
          "Official website of Glorious Public School, Jamui Road, Jhajha, District Jamui, Bihar.",
        inLanguage: "en-IN",
        publisher: {
          "@id": `${SITE_URL}/#school`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/news?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      webPageNode,
      {
        "@type": ["School", "EducationalOrganization", "LocalBusiness"],
        "@id": `${SITE_URL}/#school`,
        name: "Glorious Public School",
        alternateName: [
          "Glorious Public School Jhajha",
          "GPS Jhajha",
          "Glorious School",
        ],
        slogan: "Creating the Leaders of Tomorrow",
        url: `${SITE_URL}/`,
        foundingDate: "2004",
        description:
          "Glorious Public School, Jamui Road, Jhajha, Bihar is an English-medium CBSE-pattern school (Nursery to Class 10th) focused on academic excellence, discipline and holistic development.",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "120",
          bestRating: "5",
          worstRating: "1",
        },
        logo: {
          "@id": `${SITE_URL}/#logo`,
        },
        image: {
          "@id": `${SITE_URL}/#logo`,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jamui Road, Jhajha",
          addressLocality: "Jhajha",
          addressRegion: "Bihar",
          postalCode: "811308",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 24.7736,
          longitude: 86.3792,
        },
        hasMap: "https://maps.google.com/?q=24.7736,86.3792",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Net Banking, Cheque",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "08:00",
            closes: "14:30",
          },
        ],
        telephone: "+919534105012",
        email: "gpsjhajha@gmail.com",
        sameAs: [
          "https://www.facebook.com/",
          "https://www.instagram.com/",
          "https://www.youtube.com/",
          "https://x.com/",
        ],
        knowsAbout: [
          "CBSE Curriculum",
          "English Medium Education",
          "Smart Digital Classrooms",
          "Science Laboratory",
          "Computer Lab",
          "Holistic Child Development",
          "School Hostel Jhajha",
          "School Bus Transport Jhajha",
        ],
      },
      {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: DEFAULT_LOGO_URL,
        contentUrl: DEFAULT_LOGO_URL,
        width: 512,
        height: 512,
        caption: "Glorious Public School Logo",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: crumbItems.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      },
    ];

    // AEO FAQPage Schema
    if (Array.isArray(faqs) && faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      });
    }

    if (extraSchema) {
      if (Array.isArray(extraSchema)) {
        graph.push(...extraSchema);
      } else {
        graph.push(extraSchema);
      }
    }

    upsertJsonLd("page-seo-aeo-schema", {
      "@context": "https://schema.org",
      "@graph": graph,
    });
  }, [
    title,
    description,
    keywords,
    path,
    ogType,
    image,
    imageAlt,
    noindex,
    aeoSummary,
    schemaType,
  ]);
}
