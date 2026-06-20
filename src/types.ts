export type User = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Business";
  credits: number;
  isAdmin: boolean;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
};
