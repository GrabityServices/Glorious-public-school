require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./db");
const Notice = require("./models/Notice");
const Event = require("./models/Event");
const Staff = require("./models/Staff");
const Gallery = require("./models/Gallery");
const Inquiry = require("./models/Inquiry");
const SchoolInfo = require("./models/SchoolInfo");

const INITIAL_NOTICES = [
  {
    title: "Admission is Going On for Nursery to Class 10th (Session 2026-2027)",
    date: "02 Dec, 2025",
    category: "Admission",
    author: "Admission Cell",
    isImportant: true,
    summary:
      "Admissions are officially open for academic session 2026-2027 from Nursery to Class 10th. Limited seats available for daycare, pre-primary, and board batches with hostel and bus facilities.",
    description:
      "Admissions are officially open for academic session 2026-2027 from Nursery to Class 10th. Limited seats available for daycare, pre-primary, and board batches with hostel and bus facilities.",
    fullContent:
      "Parents seeking holistic education, strong moral foundation, and disciplined academic mentoring are cordially invited to register their wards for the upcoming session. Admission forms can be filled online through our portal or collected directly from the school administrative desk at Koltex, Petrol Pump, Jhajha. Transportation routes cover Jhajha town and nearby suburban sectors.",
  },
  {
    title: "Announcement of Periodic & Half-Yearly Evaluation Dates",
    date: "18 Nov, 2025",
    category: "Academic",
    author: "Examination Branch",
    isImportant: false,
    summary:
      "The comprehensive timetable and syllabus blueprint for the upcoming term examinations have been released for Classes 1st to 10th.",
    description:
      "The comprehensive timetable and syllabus blueprint for the upcoming term examinations have been released for Classes 1st to 10th.",
    fullContent:
      "All students are advised to check the subject-wise timetable displayed on the main notice board and school app. Special doubt-clearing sessions will be conducted after regular school hours between 01:30 PM and 02:30 PM.",
  },
  {
    title: "Revision of School Timings for Winter Months",
    date: "10 Nov, 2025",
    category: "Notice",
    author: "Principal Desk",
    isImportant: false,
    summary:
      "In view of cold weather mornings, school timings will operate from 08:30 AM to 02:30 PM starting next Monday.",
    description:
      "In view of cold weather mornings, school timings will operate from 08:30 AM to 02:30 PM starting next Monday.",
    fullContent:
      "School buses will run 30 minutes later than their regular summer schedule. Parents using private transport are requested to drop and pick up their children strictly according to the revised timing.",
  },
  {
    title: "Parent-Teacher Meeting (PTM) for Term Assessment",
    date: "25 Oct, 2025",
    category: "Event",
    author: "Academic Coordinator",
    isImportant: true,
    summary:
      "PTM will be conducted this Saturday from 08:30 AM to 12:30 PM to discuss individual child progress, notebooks, and discipline.",
    description:
      "PTM will be conducted this Saturday from 08:30 AM to 12:30 PM to discuss individual child progress, notebooks, and discipline.",
    fullContent:
      "Parents are warmly invited to interact with class teachers and subject educators. Constructive suggestions regarding student development and character building will be deliberated.",
  },
];

const INITIAL_EVENTS = [
  {
    title: "Inter-School Dance & Cultural Fest at Jhajha Town Hall",
    category: "Cultural",
    date: "01 Oct - 02 Oct",
    year: "Annual Event",
    time: "10:00 AM - 04:30 PM",
    venue: "Jhajha Town Hall, Main Market, Jhajha",
    image: "/images/dance-&-cultural-fest.webp",
    shortDesc: "Our talented students showcase classical and folk dance performances at Jhajha Town Hall.",
    fullDesc:
      "Glorious Public School students proudly perform in the grand Inter-School Dance & Cultural Celebration held at Jhajha Town Hall. Students from Nursery to Class 10th compete across folk, classical, semi-classical, and patriotic themes, winning accolades for their graceful coordination, vibrant costumes, and expressive choreography.",
    highlights: [
      "Over 120 participating students across four age divisions",
      "Special tribute to Indian cultural heritage and regional folk dances",
      "Dignitaries, local educationists, and parents in attendance",
      "First prize awarded to the GPS Senior Folk Dance Troupe",
    ],
  },
  {
    title: "Independence Day Painting & Art Competition",
    category: "Competition",
    date: "15 August",
    year: "National Festival",
    time: "08:30 AM - 12:30 PM",
    venue: "School Main Courtyard & Assembly Ground",
    image: "/images/art-competition.jpg",
    shortDesc: "Students participate in patriotic painting and drawing competitions celebrating national pride.",
    fullDesc:
      "Students celebrate Independence Day on 15th August with flag hoisting, patriotic songs, and a spirited painting competition. The art event provides a creative platform for young minds to express their love for the country through tricolor motifs, freedom fighter portraits, and environmental sustainability themes.",
    highlights: [
      "Tricolor flag hoisting ceremony by the Director & Principal",
      "Painting competition theme: 'My Dream India & Cultural Heritage'",
      "Exhibition of student artwork for visiting parents",
      "Medals and merit certificates distributed to top three winners in each category",
    ],
  },
  {
    title: "Annual Sports Day & Athletics Meet",
    category: "Sports",
    date: "20 December",
    year: "Annual Meet",
    time: "08:00 AM - 02:00 PM",
    venue: "Glorious Public School Athletic Grounds",
    image: "/images/annual-sports-meet.jpg",
    shortDesc: "Sprint races, relay challenges, shotput, and exciting obstacle courses for all wings.",
    fullDesc:
      "A high-energy day of sportsmanship and athletic fervor. House teams compete fiercely in track events, 100m/200m sprints, 4x100m relays, long jump, tug of war, and gymnastics drills. Pre-primary toddlers participate in lemon-and-spoon races and sack races.",
    highlights: [
      "March-past salute by student council and four school houses",
      "Over 25 track and field events for boys and girls",
      "Yoga drill and pyramid formations display",
      "Presentation of the coveted Overall Championship Rolling Trophy",
    ],
  },
  {
    title: "Annual Science & Environmental Exhibition",
    category: "Academic",
    date: "28 January",
    year: "Academic Showcase",
    time: "09:30 AM - 03:00 PM",
    venue: "Junior & Senior Science Labs, Main Hall",
    image: "/images/science-exhibition.jpg",
    shortDesc: "Working models of solar energy, robotics, water conservation, and interactive math puzzles.",
    fullDesc:
      "Young scientists present innovative working prototypes addressing real-world environmental and technological challenges. Parents and visitors interact with students explaining hydraulic cranes, automatic street lighting, organic farming models, and Vedic mathematics shortcuts.",
    highlights: [
      "60+ working science and robotics models presented",
      "Special eco-friendly sustainable agriculture display",
      "Live chemistry reactions and physics demonstrations",
      "Judged by visiting professors from Jamui and Jhajha degree colleges",
    ],
  },
];

const INITIAL_STAFF = [
  {
    name: "Mrs. Binod Kumar",
    role: "Principal & Academic Director",
    qualification: "M.Sc., M.Ed., Ph.D. in Educational Leadership",
    experience: "18+ Years Experience",
    image: "/images/binod-kumar.jpg",
    bio: "Passionate educationist dedicated to instilling character, integrity, and scientific temperament in young minds from Nursery through Class 10th.",
    wing: "Administration",
    category: "Administration",
  }
];

const INITIAL_GALLERY = [
  {
    title: "School Campus & Morning Assembly",
    category: "Campus",
    image: "/images/glorious-public-school-logo.png",
    caption: "Students gathering in the central courtyard for morning prayer, pledge, and daily news broadcast.",
    date: "10 Oct, 2025",
  }
];

const INITIAL_INQUIRIES = [
  {
    appId: "GPS-842910",
    type: "Online Admission",
    studentName: "Aarav Kumar",
    dob: "2016-04-12",
    gender: "Male",
    applyingClass: "Class 6th",
    gradeApplying: "Class 6th",
    grade: "Class 6th",
    fatherName: "Sanjay Kumar",
    motherName: "Sunita Devi",
    parentName: "Sanjay Kumar",
    email: "sanjay.k@gmail.com",
    phone: "9876543210",
    address: "Near Purani Bazar, Post Jhajha, Dist Jamui, Bihar 811308",
    needTransport: "Yes",
    needHostel: "Yes",
    previousSchool: "St. Joseph Academy, Jamui (Class 5th)",
    date: "19 Sep, 2026",
    status: "Pending",
    message: "Seeking admission in Class 6th with hostel accommodation and transport.",
  },
  {
    appId: "GPS-592184",
    type: "Online Admission",
    studentName: "Ananya Sharma",
    dob: "2021-08-25",
    gender: "Female",
    applyingClass: "Nursery",
    gradeApplying: "Nursery",
    grade: "Nursery",
    fatherName: "Vikram Sharma",
    motherName: "Pooja Sharma",
    parentName: "Vikram Sharma",
    email: "vikram.sharma.jhajha@gmail.com",
    phone: "9431208945",
    address: "Railway Colony, Quarter No 42, Jhajha, Jamui 811308",
    needTransport: "Yes",
    needHostel: "No",
    previousSchool: "First admission / Playgroup",
    date: "28 Sep, 2026",
    status: "Reviewed",
    message: "Applying for Nursery session 2026-2027. Need school bus route for Railway Colony.",
  },
  {
    appId: "GPS-710492",
    type: "Online Admission",
    studentName: "Rohan Verma",
    dob: "2017-11-05",
    gender: "Male",
    applyingClass: "Class 4th",
    gradeApplying: "Class 4th",
    grade: "Class 4th",
    fatherName: "Manoj Verma",
    motherName: "Anita Verma",
    parentName: "Manoj Verma",
    email: "manoj.verma82@gmail.com",
    phone: "9934567812",
    address: "Bazar Samiti Road, Jhajha, Jamui, Bihar",
    needTransport: "No",
    needHostel: "No",
    previousSchool: "DAV Public School, Jamui",
    date: "02 Oct, 2026",
    status: "Admitted",
    message: "Transfer from Jamui due to parental relocation to Jhajha.",
  },
  {
    appId: "",
    type: "Contact Inquiry",
    name: "Rajesh Mishra",
    email: "rajesh.mishra.jhajha@gmail.com",
    phone: "9835123456",
    gradeApplying: "General Inquiry",
    date: "03 Oct, 2026",
    status: "Pending",
    message: "Kindly provide information regarding school bus routes covering Jhajha Railway Station Road and timing.",
  },
  {
    appId: "",
    type: "Contact Inquiry",
    name: "Sunita Devi",
    email: "sunita.k@gmail.com",
    phone: "9470123456",
    gradeApplying: "Fee Structure",
    date: "04 Oct, 2026",
    status: "Reviewed",
    message: "Please share the detailed fee structure and book list for Class 2nd for the upcoming academic session 2026-27.",
  },
];

const INITIAL_SCHOOL_INFO = {
  name: "Glorious Public School",
  tagline: "Dedicated to create erudite, upright leaders of tomorrow's world",
  affiliation: "Recognized Co-Educational English Medium School (Nursery to Class 10th)",
  code: "GPS-JHAJHA-811308",
  established: "2015",
  phone: "9534105012",
  phoneAlt: "+91 95341 05012",
  email: "gpsjhajha@gmail.com",
  address: "Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308",
  city: "Jhajha",
  district: "Jamui",
  state: "Bihar",
  pincode: "811308",
  landmark: "Near Koltex, Petrol Pump",
  admissionNotice: "ADMISSION OPEN FOR NURSERY TO CLASS 10TH (ACADEMIC SESSION 2026-2027) — APPLY TODAY!",
  showAdmissionNotice: true,
  isAdmissionsOpen: true,
  aboutText:
    "Glorious Public School is dedicated to create erudite, upright leaders of tomorrow's world. Glorious strives to develop an all-rounded personality in its students. The school nurtures the creative and independent thinking of every student, and brings out the leadership skills inherent in every child. There is special emphasis on ethics and stress on individual character and integrity of the child.",
  vision:
    "To be a beacon of educational excellence in Bihar, instilling high moral character, creative curiosity, modern scientific temper, and leadership qualities in every young learner.",
  mission:
    "Empowering students from Nursery to Class 10th through holistic, modern, child-centric pedagogy, world-class infrastructural support, experienced teachers, and values grounded in integrity, discipline, and compassion.",
  stats: [
    { label: "Dedicated Teachers", value: "25+", suffix: "" },
    { label: "Enrolled Students", value: "800+", suffix: "" },
    { label: "Support Staff", value: "12+", suffix: "" },
    { label: "Board Pass Rate", value: "100%", suffix: "" },
    { label: "Academic Wings", value: "4", suffix: "" },
    { label: "School Buses/Vans", value: "8+", suffix: "" },
  ],
  openingHours: [
    { day: "Monday", time: "8:00 AM - 2:30 PM", status: "Open" },
    { day: "Tuesday", time: "8:00 AM - 2:30 PM", status: "Open" },
    { day: "Wednesday", time: "8:00 AM - 2:30 PM", status: "Open" },
    { day: "Thursday", time: "8:00 AM - 2:30 PM", status: "Open" },
    { day: "Friday", time: "8:00 AM - 2:30 PM", status: "Open" },
    { day: "Saturday", time: "8:00 AM - 1:00 PM", status: "Half Day" },
    { day: "Sunday", time: "Closed", status: "Holiday" },
  ],
  heroSlides: [
    {
      id: "slide-campus",
      image: "/images/glorious-public-school.png",
      tag: "Campus & Assembly",
      title: "Vibrant Campus Grounds & Morning Assemblies",
      caption: "Instilling discipline, community spirit, and moral focus every morning.",
    },
    {
      id: "slide-culture",
      image: "/images/dance-&-cultural-fest.webp",
      tag: "Arts & Culture",
      title: "Annual Celebrations & Stage Confidence",
      caption: "Fostering cultural heritage, music, drama, and expressive leadership.",
    },
    {
      id: "slide-sports",
      image: "/images/annual-sports-meet.jpg",
      tag: "Athletics & Fitness",
      title: "Sports Tournaments & Physical Excellence",
      caption: "Encouraging sportsmanship, athletic agility, and healthy teamwork.",
    },
    {
      id: "slide-labs",
      image: "/images/science-exhibition.jpg",
      tag: "Science & Innovation",
      title: "Modern Practical Labs & Digital Education",
      caption: "Hands-on science experiments and foundational computer literacy.",
    },
    {
      id: "slide-yoga",
      image: "/images/yoga-and-fitness.jpg",
      tag: "Holistic Health",
      title: "Yoga & Mindfulness Development",
      caption: "Nurturing mental resilience, physical wellness, and ethical balance.",
    },
  ],
};

const seedDatabase = async () => {
  try {
    let seeded = false;

    // 1. Notices
    if ((await Notice.countDocuments()) === 0) {
      await Notice.insertMany(INITIAL_NOTICES);
      seeded = true;
    }

    // 2. Events
    if ((await Event.countDocuments()) === 0) {
      await Event.insertMany(INITIAL_EVENTS);
      seeded = true;
    }

    // 3. Staff
    if ((await Staff.countDocuments()) === 0) {
      await Staff.insertMany(INITIAL_STAFF);
      seeded = true;
    }

    // 4. Gallery
    if ((await Gallery.countDocuments()) === 0) {
      await Gallery.insertMany(INITIAL_GALLERY);
      seeded = true;
    }

    // 5. Inquiries
    if ((await Inquiry.countDocuments()) === 0) {
      await Inquiry.insertMany(INITIAL_INQUIRIES);
      seeded = true;
    }

    // 6. School Info
    if ((await SchoolInfo.countDocuments()) === 0) {
      await SchoolInfo.create(INITIAL_SCHOOL_INFO);
      seeded = true;
    }

    if (seeded) {
      console.log("🍃 MongoDB initial data seeded successfully.");
    }
    return true;
  } catch (error) {
    console.error("❌ MongoDB Seeding Error:", error.message);
    return false;
  }
};

// Allow standalone execution: node seed.js
if (require.main === module) {
  (async () => {
    const connected = await connectDB();
    if (connected) {
      await seedDatabase();
      await mongoose.connection.close();
      process.exit(0);
    } else {
      console.error("❌ Failed to connect to MongoDB for seeding.");
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;
