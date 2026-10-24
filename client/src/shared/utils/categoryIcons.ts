import {
  Briefcase,
  Bus,
  Car,
  CircleDollarSign,
  Coffee,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  Smartphone,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Utensils,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_OPTIONS: {
  name: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  selectedColor: string;
  barColor: string;
}[] = [
  { name: "Tag", label: "General", Icon: Tag, color: "text-violet-600", selectedColor: "border-violet-300 bg-violet-50 ring-violet-200", barColor: "bg-violet-600" },
  { name: "ShoppingCart", label: "Shopping", Icon: ShoppingCart, color: "text-blue-600", selectedColor: "border-blue-300 bg-blue-50 ring-blue-200", barColor: "bg-blue-600" },
  { name: "Home", label: "Home", Icon: Home, color: "text-amber-600", selectedColor: "border-amber-300 bg-amber-50 ring-amber-200", barColor: "bg-amber-600" },
  { name: "Car", label: "Car", Icon: Car, color: "text-slate-600", selectedColor: "border-slate-300 bg-slate-50 ring-slate-200", barColor: "bg-slate-600" },
  { name: "Utensils", label: "Food", Icon: Utensils, color: "text-orange-600", selectedColor: "border-orange-300 bg-orange-50 ring-orange-200", barColor: "bg-orange-600" },
  { name: "Heart", label: "Health", Icon: Heart, color: "text-rose-600", selectedColor: "border-rose-300 bg-rose-50 ring-rose-200", barColor: "bg-rose-600" },
  { name: "GraduationCap", label: "Education", Icon: GraduationCap, color: "text-indigo-600", selectedColor: "border-indigo-300 bg-indigo-50 ring-indigo-200", barColor: "bg-indigo-600" },
  { name: "Briefcase", label: "Work", Icon: Briefcase, color: "text-cyan-700", selectedColor: "border-cyan-300 bg-cyan-50 ring-cyan-200", barColor: "bg-cyan-700" },
  { name: "Gift", label: "Gift", Icon: Gift, color: "text-pink-600", selectedColor: "border-pink-300 bg-pink-50 ring-pink-200", barColor: "bg-pink-600" },
  { name: "Plane", label: "Travel", Icon: Plane, color: "text-sky-600", selectedColor: "border-sky-300 bg-sky-50 ring-sky-200", barColor: "bg-sky-600" },
  { name: "ShoppingBag", label: "Personal", Icon: ShoppingBag, color: "text-fuchsia-600", selectedColor: "border-fuchsia-300 bg-fuchsia-50 ring-fuchsia-200", barColor: "bg-fuchsia-600" },
  { name: "Coffee", label: "Coffee", Icon: Coffee, color: "text-yellow-700", selectedColor: "border-yellow-300 bg-yellow-50 ring-yellow-200", barColor: "bg-yellow-700" },
  { name: "FileText", label: "Bill", Icon: FileText, color: "text-sky-700", selectedColor: "border-sky-300 bg-sky-50 ring-sky-200", barColor: "bg-sky-700" },
  { name: "Bus", label: "Transit", Icon: Bus, color: "text-teal-600", selectedColor: "border-teal-300 bg-teal-50 ring-teal-200", barColor: "bg-teal-600" },
  { name: "Wrench", label: "Repairs", Icon: Wrench, color: "text-stone-600", selectedColor: "border-stone-300 bg-stone-50 ring-stone-200", barColor: "bg-stone-600" },
  { name: "Smartphone", label: "Phone", Icon: Smartphone, color: "text-lime-700", selectedColor: "border-lime-300 bg-lime-50 ring-lime-200", barColor: "bg-lime-700" },
  { name: "Music", label: "Music", Icon: Music, color: "text-purple-600", selectedColor: "border-purple-300 bg-purple-50 ring-purple-200", barColor: "bg-purple-600" },
  { name: "PawPrint", label: "Pets", Icon: PawPrint, color: "text-emerald-600", selectedColor: "border-emerald-300 bg-emerald-50 ring-emerald-200", barColor: "bg-emerald-600" },
  { name: "Wallet", label: "Finance", Icon: Wallet, color: "text-red-600", selectedColor: "border-red-300 bg-red-50 ring-red-200", barColor: "bg-red-600" },
  { name: "CircleDollarSign", label: "Money", Icon: CircleDollarSign, color: "text-green-700", selectedColor: "border-green-300 bg-green-50 ring-green-200", barColor: "bg-green-700" },
  { name: "PiggyBank", label: "Savings", Icon: PiggyBank, color: "text-blue-800", selectedColor: "border-blue-400 bg-blue-100 ring-blue-300", barColor: "bg-blue-800" },
];

export const getCategoryIconOption = (name: string | null) =>
  name === null
    ? null
    : CATEGORY_ICON_OPTIONS.find((option) => option.name === name) ?? {
        name,
        label: "Category",
        Icon: Tag,
        color: "text-neutral-600",
        selectedColor: "border-neutral-300 bg-neutral-50 ring-neutral-200",
        barColor: "bg-neutral-600",
      };
