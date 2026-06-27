export type Situation = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export const situations: Situation[] = [
  { id: "student", icon: "🎓", title: "Student", description: "Studying or starting school" },
  { id: "newcomer", icon: "🌎", title: "Newcomer", description: "New to Ontario or Canada" },
  { id: "parent", icon: "👶", title: "New Parent", description: "Welcoming a child" },
  { id: "job", icon: "💼", title: "Lost Job", description: "Between jobs or laid off" },
  { id: "housing", icon: "🏠", title: "Housing Challenges", description: "Need help with rent or shelter" },
  { id: "senior", icon: "👴", title: "Senior", description: "Retired or 65+" },
  { id: "other", icon: "🤷", title: "Other", description: "Something else is going on" },
];

export type Question = {
  id: string;
  prompt: string;
  type: "text" | "number" | "choice";
  options?: string[];
  placeholder?: string;
};

export const questions: Question[] = [
  { id: "city", prompt: "Which city do you live in?", type: "text", placeholder: "e.g. Sudbury" },
  { id: "age", prompt: "How old are you?", type: "number", placeholder: "Age" },
  { id: "income", prompt: "What is your approximate household income?", type: "choice", options: ["Under $20k", "$20k–$40k", "$40k–$70k", "$70k–$100k", "Over $100k"] },
  { id: "dependents", prompt: "Do you have dependents?", type: "choice", options: ["No", "1", "2", "3 or more"] },
  { id: "employment", prompt: "Are you currently employed?", type: "choice", options: ["Employed full-time", "Employed part-time", "Self-employed", "Unemployed", "Student", "Retired"] },
];

export type Benefit = {
  name: string;
  match: number;
  value: string;
  description: string;
  category: string;
};

export const benefits: Benefit[] = [
  { name: "Employment Insurance", match: 95, value: "$1,800", description: "Temporary income support for eligible workers who have lost their job.", category: "Income Support" },
  { name: "GST/HST Credit", match: 92, value: "$496", description: "Quarterly tax-free payment to help offset sales tax for low- and modest-income individuals.", category: "Tax Credit" },
  { name: "Ontario Trillium Benefit", match: 88, value: "$900", description: "Helps with energy costs, sales tax, and property taxes.", category: "Tax Credit" },
  { name: "Ontario Energy Support Program", match: 74, value: "$540", description: "Monthly on-bill credit to help lower-income households pay for electricity.", category: "Utility" },
  { name: "Canada Housing Benefit", match: 61, value: "$500", description: "Direct rent support for low-income renters in housing need.", category: "Housing" },
  { name: "Northern Ontario Energy Credit", match: 45, value: "$172", description: "Helps Northern Ontario residents with higher energy costs.", category: "Utility" },
];

export type Resource = {
  name: string;
  category: "Food" | "Housing" | "Employment" | "Healthcare" | "Legal";
  description: string;
  address: string;
  phone: string;
};

export const resources: Resource[] = [
  { name: "Sudbury Food Bank", category: "Food", description: "Provides emergency food assistance to individuals and families in need.", address: "123 Lorne St, Sudbury", phone: "705-671-9663" },
  { name: "YMCA Employment Services", category: "Employment", description: "Job search support, resume help, and career counselling.", address: "140 Durham St, Sudbury", phone: "705-674-8315" },
  { name: "Community Legal Clinic", category: "Legal", description: "Free legal guidance and advocacy for low-income residents.", address: "40 Elm St, Sudbury", phone: "705-674-3200" },
  { name: "Sudbury Housing Services", category: "Housing", description: "Rent-geared-to-income housing applications and tenant support.", address: "200 Brady St, Sudbury", phone: "705-688-3776" },
  { name: "Health Sciences North Walk-in", category: "Healthcare", description: "Walk-in health services and referrals to specialists.", address: "41 Ramsey Lake Rd, Sudbury", phone: "705-523-7100" },
  { name: "Salvation Army Northern Centre", category: "Food", description: "Hot meals, shelter, and emergency assistance.", address: "146 Larch St, Sudbury", phone: "705-673-1175" },
];
