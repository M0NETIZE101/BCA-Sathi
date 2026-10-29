// BCA Sathi — content data
// Edit this file to add/update resources. This is the ONLY file you edit for content.

const BCA_DATA = {
  semesters: [
    {
      id: 1,
      name: "Semester 1",
      tagline: "Foundation",
      subjects: [
        {
          id: "cacs101-cf",
          name: "Computer Fundamentals & Applications",
          code: "CACS101",
          syllabus: { file: "pdfs/sem1/cacs101/syllabus.pdf", sizeMB: 0.4 },
          notes: [
            { title: "Unit 1: Introduction to Computers", file: "pdfs/sem1/cacs101/unit1.pdf", sizeMB: 2.1 }
          ],
          papers: [
            { year: 2081, file: "pdfs/sem1/cacs101/2081.pdf", sizeMB: 1.8 },
            { year: 2080, file: "pdfs/sem1/cacs101/2080.pdf", sizeMB: 1.7 }
          ]
        },
        {
          id: "cacs102-math",
          name: "Mathematics I",
          code: "CACS102",
          syllabus: { file: "pdfs/sem1/cacs102/syllabus.pdf", sizeMB: 0.5 },
          notes: [],
          papers: [
            { year: 2081, file: "pdfs/sem1/cacs102/2081.pdf", sizeMB: 2.0 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Semester 2",
      tagline: "Core Programming",
      subjects: [
        {
          id: "cacs151-oop",
          name: "OOP in Java",
          code: "CACS151",
          syllabus: { file: "pdfs/sem2/cacs151/syllabus.pdf", sizeMB: 0.5 },
          notes: [],
          papers: []
        }
      ]
    },
    { id: 3, name: "Semester 3", tagline: "Data & Systems", subjects: [] },
    { id: 4, name: "Semester 4", tagline: "Networking & DBMS", subjects: [] },
    { id: 5, name: "Semester 5", tagline: "Web & Mobile", subjects: [] },
    { id: 6, name: "Semester 6", tagline: "Advanced Applications", subjects: [] },
    { id: 7, name: "Semester 7", tagline: "Specialisation", subjects: [] },
    { id: 8, name: "Semester 8", tagline: "Project & Capstone", subjects: [] }
  ]
};