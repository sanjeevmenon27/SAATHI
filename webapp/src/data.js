import {
  Ambulance,
  Heart,
  Laptop2,
  PhoneCall,
  ShoppingBag,
  ShieldCheck,
  Clock3,
  UserCheck
} from "lucide-react";

export const serviceOptions = [
  { name: "Hospital Escort", icon: Ambulance, description: "Support for checkups, admissions, and hospital visits." },
  { name: "Companionship", icon: Heart, description: "Warm company for conversation, walks, and daily support." },
  { name: "Tech Help", icon: Laptop2, description: "Patient guidance for phones, apps, video calls, and telehealth." },
  { name: "Errands", icon: ShoppingBag, description: "Pharmacy pickups, groceries, and nearby essential tasks." },
  { name: "Daily Check-in Call", icon: PhoneCall, description: "Scheduled comfort calls for daily reassurance." }
];

export const howItWorks = [
  { title: "Book", icon: Clock3, text: "Choose a service, date, and support notes in under two minutes." },
  { title: "Match", icon: UserCheck, text: "We show verified Saathis with language fit, ratings, and skills." },
  { title: "Care", icon: ShieldCheck, text: "Families receive live status updates and a post-visit report." }
];

export const testimonials = [
  {
    name: "Lakshmi, daughter in Chennai",
    quote: "My mother felt safe at the hospital, and I got updates without having to miss work."
  },
  {
    name: "Mr. Venkataraman, Coimbatore",
    quote: "The daily calls and patient conversation have genuinely improved my week."
  },
  {
    name: "Deepa, caregiver abroad",
    quote: "The summary card and visit report make remote care much less stressful."
  }
];

export const durations = ["1hr", "2hr", "half day"];
