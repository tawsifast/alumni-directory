import {
  ApiError,
  type Alumni,
  type AlumniFormData,
  type AlumniListResponse,
  type AlumniQuery,
  type SortOption,
} from "@/lib/types";

export const PAGE_SIZE = 9;

const seed: AlumniFormData[] = [
  { fullName: "Ayesha Rahman", email: "ayesha@example.com", graduationYear: 2018, department: "Computer Science", currentCompany: "Google", currentPosition: "Software Engineer", location: "Dublin, Ireland" },
  { fullName: "Daniel Okafor", email: "daniel@example.com", graduationYear: 2015, department: "Business Administration", currentCompany: "McKinsey", currentPosition: "Engagement Manager", location: "London, UK" },
  { fullName: "Mei Lin", email: "mei@example.com", graduationYear: 2020, department: "Architecture", currentCompany: "Foster + Partners", currentPosition: "Architect", location: "Singapore" },
  { fullName: "Tanvir Hasan", email: "tanvir@example.com", graduationYear: 2019, department: "Electrical Engineering", currentCompany: "Tesla", currentPosition: "Hardware Engineer", location: "Austin, USA" },
  { fullName: "Sofia Marquez", email: "sofia@example.com", graduationYear: 2012, department: "Economics", currentCompany: "World Bank", currentPosition: "Senior Economist", location: "Washington, USA" },
  { fullName: "Arjun Mehta", email: "arjun@example.com", graduationYear: 2021, department: "Computer Science", currentCompany: "Stripe", currentPosition: "Frontend Engineer", location: "Toronto, Canada" },
  { fullName: "Nadia Chowdhury", email: "nadia@example.com", graduationYear: 2016, department: "Mathematics", currentCompany: "Jane Street", currentPosition: "Quant Researcher", location: "New York, USA" },
  { fullName: "Lukas Weber", email: "lukas@example.com", graduationYear: 2014, department: "Mechanical Engineering", currentCompany: "BMW", currentPosition: "Design Lead", location: "Munich, Germany" },
  { fullName: "Fatima Noor", email: "fatima@example.com", graduationYear: 2022, department: "Physics", currentCompany: "CERN", currentPosition: "Research Fellow", location: "Geneva, Switzerland" },
  { fullName: "James Carter", email: "james@example.com", graduationYear: 2017, department: "Business Administration", currentCompany: null, currentPosition: "Founder", location: "Sydney, Australia" },
  { fullName: "Rafiq Ahmed", email: "rafiq@example.com", graduationYear: 2013, department: "Computer Science", currentCompany: "Microsoft", currentPosition: "Principal Engineer", location: "Seattle, USA" },
];

function createSeed(): Alumni[] {
  const now = new Date().toISOString();
  return seed.map((s, i) => ({ ...s, id: String(i + 1), createdAt: now, updatedAt: now }));
}

const globalForStore = globalThis as unknown as { alumniStore?: Alumni[] };

const store: Alumni[] = (globalForStore.alumniStore ??= createSeed());

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

function sortAlumni(rows: Alumni[], sort: SortOption): Alumni[] {
  return [...rows].sort((a, b) => {
    if (sort === "name-asc") return a.fullName.localeCompare(b.fullName);
    if (sort === "name-desc") return b.fullName.localeCompare(a.fullName);
    if (sort === "year-asc") return a.graduationYear - b.graduationYear;
    return b.graduationYear - a.graduationYear;
  });
}

export async function listAlumni(query: AlumniQuery, pageSize = PAGE_SIZE): Promise<AlumniListResponse> {
  await delay();
  let rows = store;
  if (query.search) {
    const needle = query.search.toLowerCase();
    rows = rows.filter((a) => a.fullName.toLowerCase().includes(needle));
  }
  if (query.year) rows = rows.filter((a) => a.graduationYear === query.year);
  if (query.department) rows = rows.filter((a) => a.department === query.department);

  const sorted = sortAlumni(rows, query.sort ?? "name-asc");
  const page = query.page ?? 1;
  return {
    data: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
  };
}

export async function getAlumniById(id: string): Promise<Alumni> {
  await delay();
  const found = store.find((a) => a.id === id);
  if (!found) throw new ApiError("Alumni not found", 404);
  return found;
}

export async function createAlumni(data: AlumniFormData): Promise<Alumni> {
  await delay();
  const now = new Date().toISOString();
  const item: Alumni = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  store.push(item);
  return item;
}

export async function updateAlumni(id: string, data: AlumniFormData): Promise<Alumni> {
  await delay();
  const index = store.findIndex((a) => a.id === id);
  if (index === -1) throw new ApiError("Alumni not found", 404);
  const updated: Alumni = { ...store[index]!, ...data, updatedAt: new Date().toISOString() };
  store[index] = updated;
  return updated;
}

export async function deleteAlumni(id: string): Promise<void> {
  await delay();
  const index = store.findIndex((a) => a.id === id);
  if (index === -1) throw new ApiError("Alumni not found", 404);
  store.splice(index, 1);
}
