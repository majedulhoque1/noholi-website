// Shared/navigation/home strings (the original design keys). Per-area keys live in the sibling modules.
const en = {
  home: "Home", about: "About Us", library: "Library", books: "Books", noholiBooks: "Noholi Books",
  ebooks: "E-Books", audiobooks: "Audio Books", gallery: "Gallery", rules: "Rules", writeups: "Write Ups", blogs: "Blogs",
  creative: "Creative Writings", reviews: "Book Reviews", contact: "Contact", login: "Log in",
  become: "Become a Member", wishlist: "Wishlist", profile: "View Member Profile", dashboard: "Member Dashboard",
  settings: "Account Settings", logout: "Log Out", activePatron: "Active Patron", memberId: "Member ID",
  heroTitle: "Stories live here.", heroBody: "Noholi is a library and literary home in Dhaka — thousands of books to borrow, e-books to read, recordings to listen to, and a community of readers who write back.",
  explore: "Explore the Library", featured: "On the shelf this week", viewAll: "View all", viewBook: "View book",
  available: "Available", limited: "Limited copies", unavailable: "Currently borrowed", search: "Search titles, authors, ISBN…",
  read: "Read", listen: "Listen", play: "Play", reserve: "Reserve", membershipTitle: "Become part of Noholi.",
  membershipBody: "One card. Every shelf, every recording, every reading evening. Membership is free.",
  learnMore: "Learn more", latestWriteups: "From the reading room", language: "Language", theme: "Theme",
};

const bn: Record<keyof typeof en, string> = {
  home: "প্রথম পাতা", about: "আমাদের কথা", library: "পাঠাগার", books: "বই", noholiBooks: "নহলি প্রকাশনা",
  ebooks: "ই-বুক", audiobooks: "অডিও বই", gallery: "গ্যালারি", rules: "নিয়মাবলি", writeups: "লেখালেখি", blogs: "ব্লগ",
  creative: "সৃজনশীল লেখা", reviews: "বই আলোচনা", contact: "যোগাযোগ", login: "লগ ইন",
  become: "সদস্য হোন", wishlist: "পছন্দের তালিকা", profile: "সদস্য প্রোফাইল", dashboard: "সদস্য ড্যাশবোর্ড",
  settings: "অ্যাকাউন্ট সেটিংস", logout: "লগ আউট", activePatron: "সক্রিয় সদস্য", memberId: "সদস্য নম্বর",
  heroTitle: "গল্পেরা এখানে থাকে।", heroBody: "নহলি ঢাকার একটি পাঠাগার ও সাহিত্যের ঘর — ধার নেওয়ার জন্য হাজারো বই, পড়ার জন্য ই-বুক, শোনার জন্য অডিও, আর পাঠকদের একটি সম্প্রদায়।",
  explore: "পাঠাগার ঘুরে দেখুন", featured: "এই সপ্তাহের তাকে", viewAll: "সব দেখুন", viewBook: "বইটি দেখুন",
  available: "পাওয়া যাচ্ছে", limited: "সীমিত কপি", unavailable: "বর্তমানে ধারে", search: "বই, লেখক বা ISBN খুঁজুন…",
  read: "পড়ুন", listen: "শুনুন", play: "চালান", reserve: "সংরক্ষণ করুন", membershipTitle: "নহলির অংশ হোন।",
  membershipBody: "একটি কার্ড। সব তাক, সব রেকর্ডিং, সব পাঠসন্ধ্যা। সদস্যপদ মাসে ৳৩০০ থেকে শুরু।",
  learnMore: "আরও জানুন", latestWriteups: "পাঠকক্ষ থেকে", language: "ভাষা", theme: "থিম",
};

export const core = { en, bn };
