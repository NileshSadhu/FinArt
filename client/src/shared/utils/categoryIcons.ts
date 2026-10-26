import * as LucideIcons from "lucide-react";
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
  icons,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconMeta {
  name: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  selectedColor: string;
  barColor: string;
}

export interface CuratedIconItem {
  name: string;
  label: string;
  category: string;
  keywords: string[];
}

export const CATEGORY_ICON_OPTIONS: CategoryIconMeta[] = [
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

const DYNAMIC_PALETTES = [
  { color: "text-violet-600", selectedColor: "border-violet-300 bg-violet-50 ring-violet-200", barColor: "bg-violet-600" },
  { color: "text-blue-600", selectedColor: "border-blue-300 bg-blue-50 ring-blue-200", barColor: "bg-blue-600" },
  { color: "text-emerald-600", selectedColor: "border-emerald-300 bg-emerald-50 ring-emerald-200", barColor: "bg-emerald-600" },
  { color: "text-amber-600", selectedColor: "border-amber-300 bg-amber-50 ring-amber-200", barColor: "bg-amber-600" },
  { color: "text-rose-600", selectedColor: "border-rose-300 bg-rose-50 ring-rose-200", barColor: "bg-rose-600" },
  { color: "text-indigo-600", selectedColor: "border-indigo-300 bg-indigo-50 ring-indigo-200", barColor: "bg-indigo-600" },
  { color: "text-teal-600", selectedColor: "border-teal-300 bg-teal-50 ring-teal-200", barColor: "bg-teal-600" },
  { color: "text-cyan-700", selectedColor: "border-cyan-300 bg-cyan-50 ring-cyan-200", barColor: "bg-cyan-700" },
  { color: "text-pink-600", selectedColor: "border-pink-300 bg-pink-50 ring-pink-200", barColor: "bg-pink-600" },
  { color: "text-purple-600", selectedColor: "border-purple-300 bg-purple-50 ring-purple-200", barColor: "bg-purple-600" },
  { color: "text-orange-600", selectedColor: "border-orange-300 bg-orange-50 ring-orange-200", barColor: "bg-orange-600" },
  { color: "text-sky-600", selectedColor: "border-sky-300 bg-sky-50 ring-sky-200", barColor: "bg-sky-600" },
  { color: "text-lime-700", selectedColor: "border-lime-300 bg-lime-50 ring-lime-200", barColor: "bg-lime-700" },
  { color: "text-fuchsia-600", selectedColor: "border-fuchsia-300 bg-fuchsia-50 ring-fuchsia-200", barColor: "bg-fuchsia-600" },
];

export const getDeterministicColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DYNAMIC_PALETTES.length;
  return DYNAMIC_PALETTES[index];
};

export const formatIconLabel = (name: string): string => {
  return name.replace(/([A-Z])/g, " $&").trim();
};

export const resolveLucideIcon = (name: string): LucideIcon | null => {
  const iconFromNamed = (LucideIcons as Record<string, any>)[name];
  if (iconFromNamed && (typeof iconFromNamed === "function" || typeof iconFromNamed === "object")) {
    return iconFromNamed as LucideIcon;
  }
  const iconFromMap = (icons as Record<string, any>)[name];
  if (iconFromMap && (typeof iconFromMap === "function" || typeof iconFromMap === "object")) {
    return iconFromMap as LucideIcon;
  }
  return null;
};

export const getCategoryIconOption = (name: string | null): CategoryIconMeta | null => {
  if (name === null) return null;
  const predefined = CATEGORY_ICON_OPTIONS.find((option) => option.name === name);
  if (predefined) return predefined;

  const resolved = resolveLucideIcon(name);
  const palette = getDeterministicColor(name);

  return {
    name,
    label: formatIconLabel(name),
    Icon: resolved ?? Tag,
    color: palette.color,
    selectedColor: palette.selectedColor,
    barColor: palette.barColor,
  };
};

export const ICON_CATEGORIES = [
  { id: "all", label: "All Icons" },
  { id: "finance", label: "Finance & Money" },
  { id: "shopping", label: "Shopping" },
  { id: "food", label: "Food & Drinks" },
  { id: "transport", label: "Travel & Transit" },
  { id: "housing", label: "Home & Utilities" },
  { id: "bills", label: "Bills & Tech" },
  { id: "health", label: "Health & Fitness" },
  { id: "entertainment", label: "Entertainment" },
  { id: "work", label: "Work & Education" },
  { id: "personal", label: "Family & Lifestyle" },
] as const;

export const CURATED_CATEGORY_ICONS: CuratedIconItem[] = [
  // Finance & Money
  { name: "Wallet", label: "Wallet", category: "finance", keywords: ["money", "cash", "salary", "pay"] },
  { name: "CircleDollarSign", label: "Dollar", category: "finance", keywords: ["currency", "money", "usd", "cash"] },
  { name: "PiggyBank", label: "Savings", category: "finance", keywords: ["save", "invest", "deposit", "piggy"] },
  { name: "CreditCard", label: "Credit Card", category: "finance", keywords: ["debit", "payment", "card", "bank"] },
  { name: "Banknote", label: "Cash", category: "finance", keywords: ["bill", "cash", "money", "paper"] },
  { name: "Coins", label: "Coins", category: "finance", keywords: ["change", "gold", "crypto", "cents"] },
  { name: "Landmark", label: "Bank & Taxes", category: "finance", keywords: ["government", "loan", "mortgage", "tax", "audit"] },
  { name: "Receipt", label: "Receipt", category: "finance", keywords: ["invoice", "bill", "expense", "tax"] },
  { name: "BadgePercent", label: "Discount & Tax", category: "finance", keywords: ["offer", "sale", "interest", "discount", "percent"] },
  { name: "TrendingUp", label: "Investment", category: "finance", keywords: ["growth", "stocks", "profit", "gain"] },
  { name: "TrendingDown", label: "Loss & Debt", category: "finance", keywords: ["loss", "debt", "drop", "penalty"] },
  { name: "Vault", label: "Vault", category: "finance", keywords: ["safe", "security", "reserve", "lock"] },
  { name: "HandCoins", label: "Donation & Tip", category: "finance", keywords: ["aid", "charity", "give", "lend", "borrow"] },
  { name: "Scale", label: "Legal & Fines", category: "finance", keywords: ["law", "penalty", "fine", "court", "legal"] },
  { name: "Calculator", label: "Accounting", category: "finance", keywords: ["math", "tax", "budget", "calculation"] },

  // Shopping
  { name: "ShoppingCart", label: "Supermarket", category: "shopping", keywords: ["groceries", "mart", "buy", "cart"] },
  { name: "ShoppingBag", label: "Retail", category: "shopping", keywords: ["mall", "clothing", "fashion", "shopping"] },
  { name: "ShoppingBasket", label: "Market", category: "shopping", keywords: ["bazaar", "produce", "groceries", "basket"] },
  { name: "Store", label: "Store", category: "shopping", keywords: ["shop", "outlet", "vendor", "retail"] },
  { name: "Tag", label: "General", category: "shopping", keywords: ["misc", "items", "label", "price"] },
  { name: "Gift", label: "Gifts", category: "shopping", keywords: ["present", "holiday", "birthday", "surprise"] },
  { name: "Package", label: "Deliveries", category: "shopping", keywords: ["shipping", "parcel", "amazon", "courier"] },
  { name: "Shirt", label: "Clothing", category: "shopping", keywords: ["wardrobe", "wear", "apparel", "shoes", "fashion"] },
  { name: "Watch", label: "Accessories", category: "shopping", keywords: ["jewelry", "time", "luxury", "ring"] },
  { name: "Sparkles", label: "Beauty & Salon", category: "shopping", keywords: ["spa", "skincare", "cosmetics", "haircut"] },
  { name: "Gem", label: "Jewelry", category: "shopping", keywords: ["diamond", "luxury", "gold", "jewel"] },
  { name: "Scissors", label: "Barber & Grooming", category: "shopping", keywords: ["haircut", "salon", "barber", "grooming"] },

  // Food & Drinks
  { name: "Utensils", label: "Dining Out", category: "food", keywords: ["food", "restaurant", "eat", "dinner", "lunch"] },
  { name: "UtensilsCrossed", label: "Restaurant", category: "food", keywords: ["meal", "cuisine", "lunch", "chef"] },
  { name: "Coffee", label: "Café & Coffee", category: "food", keywords: ["tea", "breakfast", "latte", "starbucks", "espresso"] },
  { name: "Pizza", label: "Fast Food", category: "food", keywords: ["takeout", "junk", "delivery", "slice", "burger"] },
  { name: "Beer", label: "Bars & Pubs", category: "food", keywords: ["drink", "alcohol", "brewery", "beer", "nightlife"] },
  { name: "Wine", label: "Wine & Spirits", category: "food", keywords: ["cocktail", "liquor", "bar", "wine", "alcohol"] },
  { name: "Apple", label: "Fruits & Groceries", category: "food", keywords: ["healthy", "diet", "produce", "fruit", "food"] },
  { name: "Cake", label: "Bakery", category: "food", keywords: ["dessert", "birthday", "pastry", "cake", "sweet"] },
  { name: "IceCreamBowl", label: "Desserts", category: "food", keywords: ["ice cream", "sweet", "gelato", "dessert"] },
  { name: "Sandwich", label: "Snacks & Lunch", category: "food", keywords: ["snack", "bread", "subway", "sandwich"] },
  { name: "Cookie", label: "Sweets", category: "food", keywords: ["biscuit", "treat", "sugar", "cookie", "snack"] },
  { name: "Soup", label: "Soup & Ramen", category: "food", keywords: ["broth", "noodle", "hot", "soup", "ramen"] },
  { name: "CupSoda", label: "Beverages", category: "food", keywords: ["soda", "juice", "drink", "soft drink"] },
  { name: "GlassWater", label: "Water", category: "food", keywords: ["hydration", "drink", "bottle", "water"] },
  { name: "Fish", label: "Seafood", category: "food", keywords: ["meat", "fish", "market", "seafood"] },

  // Travel & Transit
  { name: "Car", label: "Car & Auto", category: "transport", keywords: ["vehicle", "driving", "cab", "uber", "taxi"] },
  { name: "Fuel", label: "Fuel & Gas", category: "transport", keywords: ["petrol", "diesel", "gas station", "fuel"] },
  { name: "Bus", label: "Bus & Transit", category: "transport", keywords: ["commute", "metro", "public", "bus"] },
  { name: "TrainFront", label: "Train & Subway", category: "transport", keywords: ["rail", "metro", "subway", "train"] },
  { name: "Plane", label: "Flights", category: "transport", keywords: ["travel", "vacation", "airline", "flight", "airfare"] },
  { name: "Bike", label: "Bicycle", category: "transport", keywords: ["cycling", "fitness", "eco", "bike"] },
  { name: "Ship", label: "Ship & Cruise", category: "transport", keywords: ["ferry", "cruise", "port", "boat"] },
  { name: "Compass", label: "Travel", category: "transport", keywords: ["journey", "trip", "explore", "compass"] },
  { name: "MapPin", label: "Location & Parking", category: "transport", keywords: ["places", "destination", "pin", "trip"] },
  { name: "Luggage", label: "Vacation & Luggage", category: "transport", keywords: ["trip", "tourism", "holiday", "luggage", "travel"] },
  { name: "Hotel", label: "Hotels & Lodging", category: "transport", keywords: ["stay", "airbnb", "motel", "hotel", "resort"] },
  { name: "ParkingCircle", label: "Parking", category: "transport", keywords: ["toll", "garage", "parking lot", "parking"] },
  { name: "Navigation", label: "GPS & Tolls", category: "transport", keywords: ["tolls", "highway", "routes", "tollway"] },
  { name: "Truck", label: "Moving & Cargo", category: "transport", keywords: ["freight", "cargo", "shipping", "movers", "truck"] },
  { name: "Ticket", label: "Tickets & Fares", category: "transport", keywords: ["boarding pass", "fare", "entry", "ticket"] },

  // Home & Utilities
  { name: "Home", label: "Housing & Rent", category: "housing", keywords: ["house", "apartment", "mortgage", "rent", "living"] },
  { name: "Building", label: "Flat / Office", category: "housing", keywords: ["flat", "condo", "property", "building", "real estate"] },
  { name: "Bed", label: "Furniture & Bedroom", category: "housing", keywords: ["sleep", "room", "furnishing", "bed", "mattress"] },
  { name: "Sofa", label: "Living Room", category: "housing", keywords: ["interior", "couch", "furniture", "living"] },
  { name: "Bath", label: "Bathroom & Water", category: "housing", keywords: ["plumbing", "shower", "hygiene", "bath"] },
  { name: "Lamp", label: "Lighting & Decor", category: "housing", keywords: ["decor", "lamp", "furnishing", "light"] },
  { name: "Refrigerator", label: "Appliances", category: "housing", keywords: ["fridge", "kitchen", "electronics", "appliance"] },
  { name: "Wrench", label: "Repairs & Plumbing", category: "housing", keywords: ["fix", "hardware", "plumber", "tools"] },
  { name: "Hammer", label: "Construction", category: "housing", keywords: ["diy", "renovation", "tools", "hardware"] },
  { name: "Paintbrush", label: "Painting & Decor", category: "housing", keywords: ["renovation", "paint", "art", "decor"] },
  { name: "Flame", label: "Gas & Heating", category: "housing", keywords: ["fire", "heat", "energy", "gas bill"] },
  { name: "Zap", label: "Electricity", category: "housing", keywords: ["power", "energy", "electric bill", "power bill"] },
  { name: "Droplets", label: "Water Bill", category: "housing", keywords: ["utility", "water supply", "aqua", "water bill"] },
  { name: "Trash2", label: "Disposal & Cleaning", category: "housing", keywords: ["garbage", "sanitation", "waste", "cleaning"] },
  { name: "Key", label: "Rent & Security", category: "housing", keywords: ["keys", "lease", "tenant", "lock"] },
  { name: "ShieldCheck", label: "Home Insurance", category: "housing", keywords: ["security", "alarm", "protection", "insurance"] },

  // Bills & Tech
  { name: "FileText", label: "Invoices & Bills", category: "bills", keywords: ["statement", "bill", "receipt", "dues"] },
  { name: "ReceiptText", label: "Subscriptions", category: "bills", keywords: ["monthly", "recurring", "saas", "membership"] },
  { name: "Lightbulb", label: "Utilities", category: "bills", keywords: ["electric", "power", "bulb", "utility"] },
  { name: "Wifi", label: "Internet & Broadband", category: "bills", keywords: ["wifi", "fiber", "network", "broadband", "internet"] },
  { name: "Smartphone", label: "Mobile Bill", category: "bills", keywords: ["cell", "recharge", "phone", "mobile", "sim"] },
  { name: "Phone", label: "Telephone", category: "bills", keywords: ["landline", "call", "communication"] },
  { name: "Tv", label: "Streaming & Cable", category: "bills", keywords: ["television", "netflix", "ott", "disney", "cable"] },
  { name: "Mail", label: "Post & Mail", category: "bills", keywords: ["postal", "letters", "courier", "postage"] },
  { name: "Shield", label: "Insurance", category: "bills", keywords: ["coverage", "policy", "safety", "insurance"] },
  { name: "Laptop", label: "Software & Tech", category: "bills", keywords: ["computer", "hardware", "gadgets", "laptop", "pc"] },
  { name: "Server", label: "Cloud & Hosting", category: "bills", keywords: ["domains", "aws", "api", "cloud", "hosting"] },
  { name: "Cpu", label: "Electronics", category: "bills", keywords: ["gadgets", "hardware", "chips", "processor"] },

  // Health & Fitness
  { name: "Heart", label: "Healthcare", category: "health", keywords: ["wellness", "checkup", "medical", "health"] },
  { name: "Dumbbell", label: "Gym & Fitness", category: "health", keywords: ["workout", "exercise", "training", "gym", "fitness"] },
  { name: "Activity", label: "Cardio & Tracking", category: "health", keywords: ["pulse", "fitness", "vitals", "steps", "cardio"] },
  { name: "Pill", label: "Pharmacy & Meds", category: "health", keywords: ["medicine", "drugs", "vitamins", "prescription", "pharmacy"] },
  { name: "Stethoscope", label: "Doctor & Clinic", category: "health", keywords: ["physician", "hospital", "consult", "doctor", "clinic"] },
  { name: "Hospital", label: "Hospital", category: "health", keywords: ["emergency", "care", "clinic", "hospital"] },
  { name: "Thermometer", label: "Diagnostics", category: "health", keywords: ["fever", "testing", "labs", "checkup"] },
  { name: "Footprints", label: "Walking & Outdoors", category: "health", keywords: ["hiking", "steps", "running", "walking"] },
  { name: "Smile", label: "Mental Wellness", category: "health", keywords: ["therapy", "happiness", "care", "wellbeing"] },
  { name: "Bandage", label: "First Aid", category: "health", keywords: ["injury", "cure", "wound", "treatment"] },

  // Entertainment
  { name: "Music", label: "Music & Audio", category: "entertainment", keywords: ["spotify", "concerts", "tunes", "music", "audio"] },
  { name: "Film", label: "Movies & Cinema", category: "entertainment", keywords: ["theatre", "films", "shows", "cinema", "movies"] },
  { name: "Gamepad2", label: "Gaming", category: "entertainment", keywords: ["playstation", "xbox", "games", "nintendo", "steam"] },
  { name: "Headphones", label: "Podcasts & Sound", category: "entertainment", keywords: ["audio", "listen", "headset", "podcasts"] },
  { name: "Camera", label: "Photography", category: "entertainment", keywords: ["photos", "video", "camera", "gear"] },
  { name: "Clapperboard", label: "Entertainment", category: "entertainment", keywords: ["hollywood", "acting", "video", "cinema"] },
  { name: "PartyPopper", label: "Parties & Events", category: "entertainment", keywords: ["celebration", "birthday", "events", "party"] },
  { name: "Palette", label: "Arts & Crafts", category: "entertainment", keywords: ["design", "painting", "drawing", "hobby", "art"] },
  { name: "Trophy", label: "Sports & Awards", category: "entertainment", keywords: ["competition", "match", "win", "sports", "trophy"] },
  { name: "Guitar", label: "Instruments", category: "entertainment", keywords: ["music lesson", "band", "jam", "guitar"] },
  { name: "Dice5", label: "Games & Fun", category: "entertainment", keywords: ["board games", "casino", "play", "dice"] },
  { name: "Popcorn", label: "Movies & Snacks", category: "entertainment", keywords: ["cinema", "theatre", "munchies", "popcorn"] },

  // Work & Education
  { name: "Briefcase", label: "Work & Salary", category: "work", keywords: ["career", "office", "job", "pay", "income", "freelance"] },
  { name: "GraduationCap", label: "Education", category: "work", keywords: ["college", "tuition", "school", "university", "course"] },
  { name: "BookOpen", label: "Books & Learning", category: "work", keywords: ["reading", "study", "course", "learning", "study"] },
  { name: "Book", label: "Literature", category: "work", keywords: ["library", "novel", "ebook", "kindle"] },
  { name: "PenTool", label: "Design & Creative", category: "work", keywords: ["freelance", "graphics", "art", "creative"] },
  { name: "Folder", label: "Office Supplies", category: "work", keywords: ["stationery", "documents", "files", "supplies"] },
  { name: "Presentation", label: "Conferences", category: "work", keywords: ["talks", "workshop", "seminar", "presentation", "meeting"] },
  { name: "Award", label: "Certifications", category: "work", keywords: ["diploma", "achievement", "badge", "certificate"] },
  { name: "Library", label: "Tuition & Campus", category: "work", keywords: ["academics", "university", "research", "library"] },
  { name: "Bookmark", label: "Newsletters", category: "work", keywords: ["subscriptions", "reads", "patreon", "bookmark"] },
  { name: "FileSpreadsheet", label: "Taxes & Accounting", category: "work", keywords: ["excel", "finance", "records", "tax"] },
  { name: "Printer", label: "Printing & Copies", category: "work", keywords: ["paper", "ink", "print", "printing"] },

  // Family & Lifestyle
  { name: "PawPrint", label: "Pets", category: "personal", keywords: ["dog", "cat", "animals", "vet", "pets"] },
  { name: "Dog", label: "Dogs", category: "personal", keywords: ["puppy", "pet", "canine", "dog"] },
  { name: "Cat", label: "Cats", category: "personal", keywords: ["kitten", "pet", "feline", "cat"] },
  { name: "Baby", label: "Baby & Kids", category: "personal", keywords: ["children", "toys", "diapers", "baby", "kids"] },
  { name: "Users", label: "Family Expenses", category: "personal", keywords: ["household", "relatives", "support", "family"] },
  { name: "User", label: "Personal Care", category: "personal", keywords: ["individual", "self care", "myself", "personal"] },
  { name: "HeartHandshake", label: "Charity & Aid", category: "personal", keywords: ["giving", "donation", "help", "charity"] },
  { name: "Umbrella", label: "Contingency", category: "personal", keywords: ["emergency", "safety net", "insurance", "rainy day"] },
  { name: "Flower2", label: "Garden & Plants", category: "personal", keywords: ["nursery", "yard", "bloom", "flowers", "plants"] },
  { name: "TreePine", label: "Nature & Parks", category: "personal", keywords: ["camping", "forest", "outdoor", "parks"] },
  { name: "Sun", label: "Day Activities", category: "personal", keywords: ["beach", "summer", "daytime", "sun"] },
  { name: "Moon", label: "Nightlife", category: "personal", keywords: ["evening", "clubbing", "night", "moon"] },
  { name: "Glasses", label: "Eyewear & Optical", category: "personal", keywords: ["optician", "contacts", "glasses", "vision"] },
];

export function searchCategoryIcons(query: string, categoryId = "all"): CuratedIconItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  const baseItems =
    categoryId === "all"
      ? CURATED_CATEGORY_ICONS
      : CURATED_CATEGORY_ICONS.filter((item) => item.category === categoryId);

  if (!normalizedQuery) {
    return baseItems;
  }

  const curatedMatches = baseItems.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery)),
  );

  if (normalizedQuery.length >= 2) {
    const matchedNames = new Set(curatedMatches.map((m) => m.name.toLowerCase()));
    const extraIcons: CuratedIconItem[] = [];

    for (const name of Object.keys(icons)) {
      if (extraIcons.length >= 60) break;
      const lower = name.toLowerCase();
      if (matchedNames.has(lower)) continue;

      if (lower.includes(normalizedQuery)) {
        extraIcons.push({
          name,
          label: formatIconLabel(name),
          category: "other",
          keywords: [lower],
        });
        matchedNames.add(lower);
      }
    }

    return [...curatedMatches, ...extraIcons];
  }

  return curatedMatches;
}
