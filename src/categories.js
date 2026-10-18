export const CATEGORIES = [
  // existing
  { name: "Wellness", symbol: "☯", emoji: "🧖" },
  { name: "Hair & Beauty", symbol: "✦", emoji: "💅" },
  { name: "Adventure", symbol: "✈", emoji: "🪂" },
  { name: "Dining & Wine", symbol: "◈", emoji: "🍷" },
  { name: "Traditional Restaurants", symbol: "⊕", emoji: "🍲" },
  { name: "Stays", symbol: "⌂", emoji: "🏡" },
  { name: "Skills", symbol: "◎", emoji: "📚" },
  { name: "Music", symbol: "♪", emoji: "🎵" },
  { name: "Events", symbol: "✺", emoji: "🎪" },
  { name: "Florists", symbol: "✿", emoji: "🌸" },

  // everyday needs
  { name: "Groceries & Hampers", symbol: "▣", emoji: "🛒" },
  { name: "Medical & Pharmacy", symbol: "✚", emoji: "💊" },
  { name: "School & Education", symbol: "✎", emoji: "🎒" },
  { name: "Airtime & Data", symbol: "☏", emoji: "📱" },
  { name: "Utilities", symbol: "⌁", emoji: "💡" },
  { name: "Fuel", symbol: "⬢", emoji: "⛽" },

  // home & family
  { name: "Building & Hardware", symbol: "⚒", emoji: "🧱" },
  { name: "Furniture & Appliances", symbol: "▤", emoji: "🛋️" },
  { name: "Farming Inputs", symbol: "❦", emoji: "🌽" },
  { name: "Funeral & Burial", symbol: "✝", emoji: "🕊️" },
  { name: "Household Services", symbol: "✧", emoji: "🧹" },

  // gifts & occasions
  { name: "Clothing & Shoes", symbol: "◭", emoji: "👗" },
  { name: "Cakes & Bakery", symbol: "❂", emoji: "🎂" },
  { name: "Gift Boxes", symbol: "❖", emoji: "🎁" },
  { name: "Photography", symbol: "◉", emoji: "📸" },
  { name: "Weddings", symbol: "♡", emoji: "💍" },

  // transport
  { name: "Car Services", symbol: "⚙", emoji: "🚗" },
  { name: "Transport", symbol: "➜", emoji: "🚌" },

  // experiences
  { name: "Fitness & Sports", symbol: "✪", emoji: "🏋️" },
  { name: "Kids Activities", symbol: "☺", emoji: "🎈" },

  { name: "Other", symbol: "◆", emoji: "🎁" },
];

export const SYMBOLS = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.symbol]),
);
export const EMOJIS = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.emoji]),
);
