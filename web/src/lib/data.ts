import hero from "@/assets/hero.jpg";
import gHands from "@/assets/g-hands.jpg";
import gChildren from "@/assets/g-children.jpg";
import gPoetry from "@/assets/g-poetry.jpg";
import gShelves from "@/assets/g-shelves.jpg";
import gStack from "@/assets/g-stack.jpg";
import gReader from "@/assets/g-reader.jpg";

export const images = { hero, gHands, gChildren, gPoetry, gShelves, gStack, gReader };

export type Book = {
  id: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  genre: "Fiction" | "Non-fiction";
  category: "Adults" | "Children" | "General";
  language: "Bangla" | "English";
  publisher: string;
  year: number;
  edition: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  condition: "Excellent" | "Good" | "Fair";
  pages: number;
  price: number;
  description: string;
  noholi?: boolean;
  ebook?: boolean;
  tone: number;
};

const b = (
  id: string, titleBn: string, titleEn: string, authorBn: string, authorEn: string,
  genre: Book["genre"], category: Book["category"], language: Book["language"],
  publisher: string, year: number, pages: number, total: number, avail: number,
  description: string, extra: Partial<Book> = {},
): Book => ({
  id, titleBn, titleEn, authorBn, authorEn, genre, category, language, publisher, year, pages,
  totalCopies: total, availableCopies: avail,
  edition: extra.edition ?? "Reprint",
  isbn: `978-984-${(1000 + id.length * 137 + year).toString().slice(0, 4)}-${(pages * 7).toString().padStart(3, "0").slice(0, 3)}-${year % 9}`,
  condition: extra.condition ?? "Good",
  price: extra.price ?? Math.round(pages * 1.4 / 10) * 10,
  description, tone: extra.tone ?? (id.charCodeAt(0) + id.length) % 8, ...extra,
});

export const books: Book[] = [
  b("pather-panchali", "পথের পাঁচালী", "Pather Panchali", "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "Bibhutibhushan Bandyopadhyay", "Fiction", "Adults", "Bangla", "Mitra & Ghosh", 1929, 312, 4, 2, "A childhood in rural Bengal seen through the wide eyes of Apu and his sister Durga — a novel of small wonders, hunger, monsoon light and loss that remains one of the most tender books in the language.", { ebook: true, tone: 0, condition: "Fair" }),
  b("lalsalu", "লালসালু", "Lalsalu", "সৈয়দ ওয়ালীউল্লাহ", "Syed Waliullah", "Fiction", "Adults", "Bangla", "Naoroze Kitabistan", 1948, 128, 3, 0, "Majid arrives in a drought-struck village and builds a shrine out of an unmarked grave. A sharp, quiet novel about faith, power and the fear that holds a community in place.", { tone: 1 }),
  b("hajar-bochor", "হাজার বছর ধরে", "Hajar Bochor Dhore", "জহির রায়হান", "Zahir Raihan", "Fiction", "Adults", "Bangla", "Anupam Prokashoni", 1964, 120, 5, 3, "Life in a village by the river — its marriages, quarrels and seasons — told as if it had been going on for a thousand years and will go on for a thousand more.", { ebook: true, tone: 2 }),
  b("padma-nadir-majhi", "পদ্মা নদীর মাঝি", "Padma Nadir Majhi", "মানিক বন্দ্যোপাধ্যায়", "Manik Bandopadhyay", "Fiction", "Adults", "Bangla", "Bengal Publishers", 1936, 176, 4, 1, "Kuber, a fisherman on the Padma, and the island of promises that pulls at him. Realist fiction at its most unflinching and humane.", { tone: 3 }),
  b("nondito-noroke", "নন্দিত নরকে", "Nondito Noroke", "হুমায়ূন আহমেদ", "Humayun Ahmed", "Fiction", "General", "Bangla", "Khan Brothers", 1972, 96, 6, 4, "The debut that made a generation of readers: a lower-middle-class Dhaka family, its private joys and a tragedy it cannot speak about.", { ebook: true, tone: 4, condition: "Excellent" }),
  b("shonkhonil", "শঙ্খনীল কারাগার", "Shonkhonil Karagar", "হুমায়ূন আহমেদ", "Humayun Ahmed", "Fiction", "General", "Bangla", "Anyaprokash", 1973, 104, 5, 5, "A family held together by love and by the silences between siblings. Spare, wistful and impossible to put down.", { tone: 5 }),
  b("khoabnama", "খোয়াবনামা", "Khoabnama", "আখতারুজ্জামান ইলিয়াস", "Akhtaruzzaman Elias", "Fiction", "Adults", "Bangla", "Mowla Brothers", 1996, 412, 2, 1, "Dreams, folklore and peasant politics in the years before Partition — a dense, magnificent novel of North Bengal.", { tone: 6 }),
  b("chilekothar-sepai", "চিলেকোঠার সেপাই", "Chilekothar Sepai", "আখতারুজ্জামান ইলিয়াস", "Akhtaruzzaman Elias", "Fiction", "Adults", "Bangla", "Mowla Brothers", 1986, 320, 3, 0, "Old Dhaka during the 1969 uprising, seen from a rooftop room. History pressing in on the narrow lanes.", { tone: 7 }),
  b("gitanjali", "গীতাঞ্জলি", "Gitanjali", "রবীন্দ্রনাথ ঠাকুর", "Rabindranath Tagore", "Fiction", "General", "Bangla", "Visva-Bharati", 1910, 160, 6, 6, "The song offerings — devotional, intimate and luminous. Poems to be read slowly and returned to across a lifetime.", { ebook: true, tone: 2, condition: "Excellent" }),
  b("aranyak", "আরণ্যক", "Aranyak", "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "Bibhutibhushan Bandyopadhyay", "Fiction", "Adults", "Bangla", "Mitra & Ghosh", 1939, 240, 3, 2, "A city man sent to manage forest land in Bihar falls in love with the wilderness he is meant to clear.", { ebook: true, tone: 3 }),
  b("thakurmar-jhuli", "ঠাকুরমার ঝুলি", "Thakurmar Jhuli", "দক্ষিণারঞ্জন মিত্র মজুমদার", "Dakshinaranjan Mitra Majumder", "Fiction", "Children", "Bangla", "Mitra & Ghosh", 1907, 180, 8, 5, "Grandmother's bag of tales — princes, demons, talking birds and clever children. The bedtime book of Bengal.", { tone: 0 }),
  b("tuntunir-boi", "টুনটুনির বই", "Tuntunir Boi", "উপেন্দ্রকিশোর রায়চৌধুরী", "Upendrakishore Ray Chowdhury", "Fiction", "Children", "Bangla", "Signet Press", 1910, 96, 6, 2, "The tiny tailorbird who outwits a king — playful animal stories for young readers and the adults who read aloud.", { ebook: true, tone: 1 }),
  b("ami-topu", "আমি তপু", "Ami Topu", "মুহম্মদ জাফর ইকবাল", "Muhammed Zafar Iqbal", "Fiction", "Children", "Bangla", "Somoy Prokashon", 2005, 144, 5, 0, "A boy, a cruel household and the friendship that saves him. A children's novel that does not look away.", { tone: 4 }),
  b("ekattorer-dinguli", "একাত্তরের দিনগুলি", "Ekattorer Dinguli", "জাহানারা ইমাম", "Jahanara Imam", "Non-fiction", "General", "Bangla", "Sandhani Prokashoni", 1986, 272, 4, 3, "A mother's diary of 1971 — the Liberation War as lived inside one Dhaka home, and the son who did not return.", { ebook: true, tone: 5, condition: "Excellent" }),
  b("asamapta", "অসমাপ্ত আত্মজীবনী", "The Unfinished Memoirs", "শেখ মুজিবুর রহমান", "Sheikh Mujibur Rahman", "Non-fiction", "General", "Bangla", "The University Press", 2012, 332, 4, 2, "Memoirs written in prison notebooks, covering the early political life of a nation's founding figure.", { tone: 6 }),
  b("god-small-things", "দ্য গড অফ স্মল থিংস", "The God of Small Things", "অরুন্ধতী রায়", "Arundhati Roy", "Fiction", "Adults", "English", "IndiaInk", 1997, 340, 3, 1, "Twins in Kerala, a forbidden love and the small things that decide everything. Lush, playful, devastating.", { tone: 7 }),
  b("golden-age", "আ গোল্ডেন এজ", "A Golden Age", "তাহমিমা আনাম", "Tahmima Anam", "Fiction", "Adults", "English", "John Murray", 2007, 288, 3, 3, "A widow in Dhaka in 1971 shelters her children — and a wounded soldier — as a country is born around them.", { ebook: true, tone: 2 }),
  b("midnights-children", "মিডনাইট'স চিলড্রেন", "Midnight's Children", "সালমান রুশদি", "Salman Rushdie", "Fiction", "Adults", "English", "Jonathan Cape", 1981, 536, 2, 0, "Born at the stroke of Indian independence, Saleem Sinai's life is handcuffed to history.", { tone: 0 }),
  b("solitude", "নিঃসঙ্গতার একশ বছর", "One Hundred Years of Solitude", "গাব্রিয়েল গার্সিয়া মার্কেস", "Gabriel García Márquez", "Fiction", "Adults", "English", "Harper Perennial", 1967, 417, 3, 2, "Seven generations of the Buendía family in the town of Macondo, where the miraculous is ordinary.", { tone: 3 }),
  b("things-fall-apart", "থিংস ফল অ্যাপার্ট", "Things Fall Apart", "চিনুয়া আচেবে", "Chinua Achebe", "Fiction", "General", "English", "Penguin Classics", 1958, 209, 4, 4, "Okonkwo's pride and the arrival of colonial missionaries in an Igbo village — a modern classic.", { ebook: true, tone: 6 }),
  b("sapiens", "স্যাপিয়েন্স", "Sapiens", "ইউভাল নোয়া হারারি", "Yuval Noah Harari", "Non-fiction", "General", "English", "Vintage", 2014, 498, 5, 1, "A brief history of humankind, from foragers to the age of algorithms.", { tone: 4 }),
  b("little-prince", "দ্য লিটল প্রিন্স", "The Little Prince", "অঁতোয়ান দ্য সাঁত-এক্সুপেরি", "Antoine de Saint-Exupéry", "Fiction", "Children", "English", "Mariner Books", 1943, 96, 6, 4, "A pilot stranded in the desert meets a small prince from a smaller planet. For children, and for those who were.", { ebook: true, tone: 1, condition: "Excellent" }),
  b("bengal-delta", "দ্য ডেল্টা", "Bengal Delta: Rivers & People", "রিচার্ড ইটন", "Richard M. Eaton", "Non-fiction", "Adults", "English", "University of California Press", 1993, 360, 2, 2, "How Islam and agrarian settlement grew together on the shifting frontier of the Bengal delta.", { tone: 5 }),
  // Noholi publications
  b("nodir-naam", "নদীর নাম মধুমতী", "A River Called Madhumati", "শারমিন আক্তার", "Sharmin Akter", "Fiction", "Adults", "Bangla", "Noholi Prokash", 2024, 212, 6, 4, "Three women, three generations, one river that keeps changing course. Noholi's first novel — a lyrical debut about leaving home and being claimed by it again.", { noholi: true, ebook: true, edition: "1st", tone: 0, condition: "Excellent" }),
  b("shohor-kobita", "শহরের কবিতা", "Poems of the City", "তানভীর হাসান", "Tanvir Hasan", "Fiction", "General", "Bangla", "Noholi Prokash", 2025, 88, 5, 5, "Fifty-two short poems about rickshaw bells, load-shedding nights and the tenderness of strangers in Dhaka.", { noholi: true, edition: "1st", tone: 2, condition: "Excellent" }),
  b("pathagar", "পাঠাগারের দিনলিপি", "Notes from a Reading Room", "নোহলি সম্পাদকমণ্ডলী", "Noholi Editorial", "Non-fiction", "General", "Bangla", "Noholi Prokash", 2025, 164, 4, 2, "Essays from readers, librarians and writers on why a shared shelf still matters. An anthology from the Noholi community.", { noholi: true, ebook: true, edition: "1st", tone: 5, condition: "Excellent" }),
  b("chotto-pakhi", "ছোট্ট পাখির বড় আকাশ", "The Little Bird's Big Sky", "ফারহানা রহমান", "Farhana Rahman", "Fiction", "Children", "Bangla", "Noholi Prokash", 2024, 48, 8, 6, "An illustrated picture book about a doel bird afraid of flying. For readers aged 4 to 8.", { noholi: true, edition: "2nd", tone: 1, condition: "Excellent" }),
  b("monsoon-letters", "বর্ষার চিঠি", "Monsoon Letters", "আরিফ মাহমুদ", "Arif Mahmud", "Fiction", "Adults", "English", "Noholi Prokash", 2025, 196, 4, 0, "An epistolary novel in English — letters between a Sylhet tea-garden doctor and a Lisbon translator over one long rainy season.", { noholi: true, edition: "1st", tone: 3, condition: "Excellent" }),
];

export const getBook = (id: string) => books.find((x) => x.id === id);
export const availability = (bk: Book) =>
  bk.availableCopies === 0 ? "unavailable" : bk.availableCopies <= 1 ? "limited" : "available";

export type Audio = {
  id: string; titleEn: string; titleBn: string; authorEn: string; narrator: string;
  duration: number; language: "Bangla" | "English"; genre: string; description: string; tone: number;
  chapters: string[];
};
export const audiobooks: Audio[] = [
  { id: "a-pather", titleEn: "Pather Panchali", titleBn: "পথের পাঁচালী", authorEn: "Bibhutibhushan Bandyopadhyay", narrator: "Rumana Sultana", duration: 41820, language: "Bangla", genre: "Classic", description: "A full unabridged reading, recorded in the Noholi studio over a monsoon season.", tone: 0, chapters: ["বল্লালী বালাই", "আম-আঁটির ভেঁপু", "অক্রূর সংবাদ"] },
  { id: "a-gitanjali", titleEn: "Gitanjali — Selected", titleBn: "গীতাঞ্জলি — নির্বাচিত", authorEn: "Rabindranath Tagore", narrator: "Kamal Hossain", duration: 5400, language: "Bangla", genre: "Poetry", description: "Thirty song-offerings read slowly, with silence left between them.", tone: 2, chapters: ["আমার মাথা নত করে দাও", "জীবন যখন শুকায়ে যায়", "আজি ঝড়ের রাতে"] },
  { id: "a-nondito", titleEn: "Nondito Noroke", titleBn: "নন্দিত নরকে", authorEn: "Humayun Ahmed", narrator: "Tahsan Ahmed", duration: 14400, language: "Bangla", genre: "Fiction", description: "Humayun Ahmed's debut, performed in a warm, conversational voice.", tone: 4, chapters: ["এক", "দুই", "তিন"] },
  { id: "a-ekattor", titleEn: "Ekattorer Dinguli", titleBn: "একাত্তরের দিনগুলি", authorEn: "Jahanara Imam", narrator: "Shimul Yousuf", duration: 32400, language: "Bangla", genre: "Memoir", description: "The diary of 1971, read with restraint and enormous care.", tone: 5, chapters: ["মার্চ", "এপ্রিল", "মে"] },
  { id: "a-prince", titleEn: "The Little Prince", titleBn: "দ্য লিটল প্রিন্স", authorEn: "Antoine de Saint-Exupéry", narrator: "Nadia Chowdhury", duration: 6300, language: "English", genre: "Children", description: "A gentle reading for bedtime listening, ages 6 and up.", tone: 1, chapters: ["The Drawing", "The Sheep", "The Rose"] },
  { id: "a-golden", titleEn: "A Golden Age", titleBn: "আ গোল্ডেন এজ", authorEn: "Tahmima Anam", narrator: "Sabrina Khan", duration: 36000, language: "English", genre: "Fiction", description: "Tahmima Anam's novel of 1971 Dhaka, unabridged.", tone: 2, chapters: ["March 1971", "Shona", "The Siege"] },
  { id: "a-madhumati", titleEn: "A River Called Madhumati", titleBn: "নদীর নাম মধুমতী", authorEn: "Sharmin Akter", narrator: "Sharmin Akter", duration: 23400, language: "Bangla", genre: "Noholi Original", description: "Read by the author — a Noholi original recording.", tone: 0, chapters: ["প্রথম স্রোত", "চরের দিন", "ফেরা"] },
  { id: "a-tuntuni", titleEn: "Tuntunir Golpo", titleBn: "টুনটুনির গল্প", authorEn: "Upendrakishore Ray Chowdhury", narrator: "Rafi Islam", duration: 3600, language: "Bangla", genre: "Children", description: "Six tailorbird tales with gentle sound design.", tone: 1, chapters: ["টুনটুনি আর রাজা", "টুনটুনি আর বিড়াল", "টুনটুনি আর নাপিত"] },
];

export const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};
export const fmtDuration = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h} hr ${m} min` : `${m} min`;
};

export type Article = {
  slug: string; kind: "blog" | "creative" | "review"; sub?: string;
  title: string; excerpt: string; author: string; date: string; minutes: number;
  image?: string; bookId?: string; rating?: number; body: string[]; bangla?: boolean;
};

export const articles: Article[] = [
  { slug: "why-libraries-still-matter", kind: "blog", sub: "Reading culture", title: "Why a shared shelf still matters in 2026", excerpt: "In an age of infinite scroll, the library's quiet promise — that a book can be borrowed, returned, and passed on — feels radical again.", author: "Nusrat Jahan", date: "2026-09-21", minutes: 7, image: gShelves,
    body: ["There is a particular silence in a reading room that no app has managed to replicate. It is not the absence of sound — fans turn, pages whisper, someone coughs behind the periodicals — but the presence of attention, held collectively by strangers.", "At Noholi we see it every afternoon. A schoolgirl copying a poem into her notebook. A retired engineer working steadily through Elias. Two friends arguing, in whispers, about the ending of Lalsalu.", "> A library is the only place in the city where nobody asks you to buy anything.", "The shared shelf asks for something different from ownership: trust. You will bring it back. Someone else will read the margin note you should not have left. The book will outlive all of you.", "That is why we keep buying second copies of Pather Panchali, even when the first is perfectly fine. Someone, somewhere in the queue, is about to meet Apu for the first time."] },
  { slug: "reading-in-load-shedding", kind: "blog", sub: "Essays", title: "Reading by candlelight: a load-shedding diary", excerpt: "Notes from a summer when the power kept going out and the books kept us company.", author: "Tanvir Hasan", date: "2026-09-02", minutes: 5, image: gHands,
    body: ["The fan stops first. Then the hum of the fridge. Then, for a second, the whole building seems to inhale.", "I keep a candle and a paperback by the bed now. This summer it was Shonkhonil Karagar — short enough to finish before the power returns, sad enough to keep me awake after it does.", "There is something about reading in poor light that slows you down. You hold the page closer. You read a sentence twice. You notice.", "I am not romanticising the heat. But I will admit that some of my best reading this year happened in the dark."] },
  { slug: "children-corner-opens", kind: "blog", sub: "Library news", title: "The new children's corner is open", excerpt: "A reading rug, low shelves and three hundred new picture books — come and see.", author: "Noholi Team", date: "2026-08-14", minutes: 3, image: gChildren,
    body: ["After months of planning, the children's corner on the ground floor is finally open.", "We have added low shelves so younger readers can choose books themselves, a long jute rug for sitting and sprawling, and more than three hundred new Bangla and English picture books.", "Story hour runs every Friday at 4pm. Parents are welcome; snacks are not (sorry)."] },
  { slug: "translating-tagore", kind: "blog", sub: "Literature", title: "What gets lost — and found — translating Tagore", excerpt: "A translator on the impossible pleasure of carrying Gitanjali into English.", author: "Arif Mahmud", date: "2026-07-30", minutes: 9, image: gStack,
    body: ["Every translator of Tagore eventually meets the same wall: the music.", "The meaning crosses easily enough. The sound does not. Bangla vowels are long and open; English closes its doors early.", "So you make choices. You let a rhyme go to keep an image. You trade a rhythm for a breath.", "And sometimes, rarely, the English finds its own music — not Tagore's, but a cousin of it. Those are the lines worth keeping."] },
  { slug: "brishti", kind: "creative", sub: "Poetry", title: "বৃষ্টি, একটি শহরে", excerpt: "জানালার কাচে আঙুল রেখে / গুনেছি শহরের সব ভিজে যাওয়া আলো", author: "শারমিন আক্তার", date: "2026-09-18", minutes: 2, bangla: true,
    body: ["জানালার কাচে আঙুল রেখে\nগুনেছি শহরের সব ভিজে যাওয়া আলো—", "রিকশার ঘণ্টা থেমে গেলে\nবোঝা যায় বৃষ্টিরও একটা ভাষা আছে,", "যে ভাষায় মা ডাকতেন\nসন্ধ্যার আগে ঘরে ফেরার জন্য।", "আজও ফিরি।\nশুধু ঘরটা বদলে গেছে।"] },
  { slug: "the-last-borrower", kind: "creative", sub: "Short story", title: "The Last Borrower", excerpt: "Every Thursday for forty years, Mr. Kabir borrowed the same book. Then one Thursday, he didn't come.", author: "Nadia Chowdhury", date: "2026-09-05", minutes: 11, image: gReader,
    body: ["Every Thursday for forty years, Mr. Kabir borrowed the same book.", "It was a cloth-bound copy of Aranyak, its spine faded to the colour of weak tea. He would arrive at ten, sign the register in a slow, upright hand, and leave without a word.", "The librarians had theories. He was writing a thesis. He was in love with the forest. He had promised someone, long ago, that he would finish it.", "Then one Thursday, he didn't come.", "Inside the book, when they finally opened it, was a pressed sal leaf and a note: For whoever reads this next. It's better the second time. It's best the fortieth."] },
  { slug: "on-silence", kind: "creative", sub: "Essay", title: "On Silence, and the Rooms That Hold It", excerpt: "A short lyric essay about reading rooms, prayer halls and the grandmother who taught me to be quiet.", author: "Rafi Islam", date: "2026-08-22", minutes: 6, image: hero,
    body: ["My grandmother was the quietest person I have ever known, and the most present.", "She read the newspaper the way other people pray: slowly, completely, without skipping the small print.", "When I walk into a reading room now I think of her. The silence is not empty. It is full of people paying attention.", "That, I think, is what she was teaching me."] },
  { slug: "ghum", kind: "creative", sub: "Poetry", title: "ঘুমপাড়ানি", excerpt: "আয় ঘুম, আয় নদী / চরের বালিতে রাখি চাঁদের পা", author: "তানভীর হাসান", date: "2026-07-11", minutes: 1, bangla: true,
    body: ["আয় ঘুম, আয় নদী\nচরের বালিতে রাখি চাঁদের পা,", "মায়ের আঁচলে বাঁধা\nএকটুকরো পুরনো গান।", "ঘুমা রে খোকা—\nকাল সকালে আবার শহর।"] },
  { slug: "review-lalsalu", kind: "review", title: "Lalsalu: the shrine that ate a village", excerpt: "Seventy-eight years on, Syed Waliullah's slim novel is still the sharpest Bangla book about the business of belief.", author: "Nusrat Jahan", date: "2026-09-12", minutes: 6, bookId: "lalsalu", rating: 5,
    body: ["Lalsalu is a short book that feels enormous.", "Majid, arriving in Mohabbatnagar with nothing, finds an unmarked grave, drapes it in red cloth and names it a saint's shrine. From that single act of invention, a whole economy of fear and devotion grows.", "Waliullah never mocks the villagers. That is the book's genius. He understands why they need Majid — and why Majid, too, is trapped by what he has built.", "Read it in an afternoon. Think about it for a year."] },
  { slug: "review-golden-age", kind: "review", title: "A Golden Age and the domestic war", excerpt: "Tahmima Anam writes 1971 from the kitchen, the garden and the locked bedroom — and it is all the more powerful for it.", author: "Sabrina Khan", date: "2026-08-28", minutes: 5, bookId: "golden-age", rating: 4,
    body: ["Most war novels look outward. A Golden Age looks in.", "Rehana Haque is a widow who has already lost her children once, to a custody battle. When the war comes, she will do anything to keep them.", "Anam's prose is clean and unshowy. The violence happens mostly offstage, which makes it worse.", "Not every subplot lands, but the central portrait of a mother is unforgettable."] },
  { slug: "review-little-prince", kind: "review", title: "Re-reading The Little Prince at forty", excerpt: "A book for children that turns out to be a book about grief.", author: "Kamal Hossain", date: "2026-08-03", minutes: 4, bookId: "little-prince", rating: 5,
    body: ["I first read The Little Prince at nine and thought it was about a boy and a fox.", "At forty I understand that it is about a man in the desert, about to die of thirst, inventing a child so he will have someone to talk to.", "It is still about the fox, too. It is still about the rose. It is about what we tame and what tames us."] },
  { slug: "review-khoabnama", kind: "review", title: "Khoabnama: dreaming a whole region", excerpt: "Elias's last novel is demanding, digressive and absolutely worth it.", author: "Arif Mahmud", date: "2026-07-19", minutes: 8, bookId: "khoabnama", rating: 4,
    body: ["Khoabnama is not an easy book. It does not want to be.", "Elias builds a world from dreams, rumours, ghost stories and peasant uprisings, and asks you to live in it for four hundred pages.", "The reward is a portrait of North Bengal so dense you can smell the jute.", "Give it time. It will give you more."] },
];

export const gallery = [
  { src: gShelves, cat: "Architecture", caption: "The east stacks, morning light", h: 1280 },
  { src: gChildren, cat: "Community", caption: "Friday story hour", h: 912 },
  { src: gPoetry, cat: "Literary activities", caption: "Monsoon poetry evening", h: 912 },
  { src: gHands, cat: "Reading", caption: "An old Bangla edition, well loved", h: 1280 },
  { src: gStack, cat: "Books", caption: "Cloth-bound donations, 2026", h: 912 },
  { src: gReader, cat: "Reading", caption: "The window chair", h: 1280 },
  { src: hero, cat: "Library", caption: "The long reading table", h: 1104 },
  { src: gPoetry, cat: "Community", caption: "Readers' circle, August", h: 912 },
  { src: gShelves, cat: "Library", caption: "Reference section", h: 1280 },
];

export const library = {
  name: "Noholi Library",
  nameBn: "নহলি পাঠাগার",
  address: ["House 808, Road 11 Avenue 6", "Pallabi, Dhaka 1216", "Bangladesh"],
  addressShort: "House 808, Road 11 Avenue 6, Pallabi, Dhaka 1216",
  phoneDisplay: "+880 1730-591580",
  phoneHref: "tel:+8801730591580",
  email: "hello@noholi.org",
  hours: [["Sunday – Friday", "10:00 – 18:00"], ["Saturday", "Closed"]] as [string, string][],
  hoursShort: "Sun–Fri · 10:00–18:00",
  placeId: "ChIJM8Rqm57BVTcRKEtREEFChO0",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Noholi%20Library&query_place_id=ChIJM8Rqm57BVTcRKEtREEFChO0",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=ChIJM8Rqm57BVTcRKEtREEFChO0",
  embedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.442266633703!2d90.36902767442658!3d23.838424085393076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c19e9b6ac433%3A0xed84424110514b28!2sNoholi%20Library!5e0!3m2!1sen!2sbd!4v1791544446148!5m2!1sen!2sbd",
};

export const user = {
  name: "Aurko Rahman", nameBn: "অর্ক রহমান", memberId: "NH-00124", email: "aurko@example.com",
  phone: "+880 1712-345678", address: "House 14, Road 7, Dhanmondi, Dhaka 1205",
  since: "2023-02-11", expires: "2027-02-10", plan: "Free membership", nid: "1990 2614 8873 4401",
};

/* ---------- Member records (prototype sample data, not a library database) ---------- */

/** One recorded event on a request, loan, recommendation or submission. Only events that happened. */
export type RecordEvent = { date: string; label: string; note?: string };

/** Member details as they were when a record was created — kept with the record, never refreshed from the profile. */
export type MemberSnapshot = { name: string; memberId: string; phone: string; email: string; address: string; verification: string };
export type Guarantor = { name: string; relation: string; phone: string; email?: string; address?: string; nidLast4?: string; status: string };

const memberNow: MemberSnapshot = { name: user.name, memberId: user.memberId, phone: user.phone, email: user.email, address: user.address, verification: "NID verified" };
const memberEarly2026: MemberSnapshot = { ...memberNow, address: "Flat 6A, Road 3, Lalmatia, Dhaka 1207" };
const shirin: Guarantor = { name: "Shirin Rahman", relation: "Mother", phone: "+880 1711-220934", email: "shirin.rahman@example.com", address: "House 14, Road 7, Dhanmondi, Dhaka 1205", nidLast4: "7712", status: "Verified by librarian" };
const shirinEarly: Guarantor = { ...shirin, phone: "+880 1552-610447", address: "Flat 6A, Road 3, Lalmatia, Dhaka 1207" };
const tanvir: Guarantor = { name: "Tanvir Hasan", relation: "Friend", phone: "+880 1819-552013", email: "tanvir.h@example.com", address: "Flat 3B, 22 Mirpur Road, Dhaka 1207", nidLast4: "3058", status: "Verified by librarian" };

/** Request statuses describe the request. Once a book is handed over the request is "Issued" and the loan carries its own status. */
export type BorrowStatus = "Pending Review" | "Approved" | "Ready for Pickup" | "Issued" | "Rejected" | "Cancelled";
export type BorrowRequest = {
  id: string; bookId: string; copy: string; submitted: string; updated: string; due: string; status: BorrowStatus; notes?: string;
  loanId?: string; member: MemberSnapshot; guarantor: Guarantor; timeline: RecordEvent[];
};
export const initialBorrowRequests: BorrowRequest[] = [
  { id: "BR-26-0418", bookId: "khoabnama", copy: "Copy 2 of 3", submitted: "2026-09-30", updated: "2026-10-02", due: "2026-10-21", status: "Ready for Pickup", member: memberNow, guarantor: shirin,
    timeline: [{ date: "2026-09-30", label: "Request submitted" }, { date: "2026-10-01", label: "Request reviewed", note: "Guarantor details checked." }, { date: "2026-10-02", label: "Approved — ready for pickup", note: "Copy 2 set aside at the front desk." }] },
  { id: "BR-26-0402", bookId: "chilekothar-sepai", copy: "Copy 1 of 2", submitted: "2026-09-25", updated: "2026-09-25", due: "2026-10-16", status: "Pending Review", member: memberNow, guarantor: shirin,
    timeline: [{ date: "2026-09-25", label: "Request submitted" }] },
  { id: "BR-26-0389", bookId: "sapiens", copy: "Copy 1 of 1", submitted: "2026-09-19", updated: "2026-09-21", due: "2026-10-10", status: "Rejected", member: memberNow, guarantor: tanvir,
    timeline: [{ date: "2026-09-19", label: "Request submitted" }, { date: "2026-09-21", label: "Request reviewed" }, { date: "2026-09-21", label: "Rejected", note: "The only copy is reserved for the reading circle this month. You're welcome to request it again later." }] },
  { id: "BR-26-0377", bookId: "aranyak", copy: "Copy 1 of 3", submitted: "2026-09-12", updated: "2026-09-14", due: "2026-10-05", status: "Issued", loanId: "LN-26-0377", member: memberNow, guarantor: shirin,
    timeline: [{ date: "2026-09-12", label: "Request submitted" }, { date: "2026-09-13", label: "Approved" }, { date: "2026-09-14", label: "Book issued", note: "Due back 5 Oct 2026." }] },
  { id: "BR-26-0352", bookId: "god-small-things", copy: "Copy 2 of 2", submitted: "2026-09-17", updated: "2026-09-20", due: "2026-10-11", status: "Issued", loanId: "LN-26-0352", member: memberNow, guarantor: tanvir,
    timeline: [{ date: "2026-09-17", label: "Request submitted" }, { date: "2026-09-18", label: "Approved" }, { date: "2026-09-20", label: "Book issued", note: "Due back 11 Oct 2026." }] },
  { id: "BR-26-0311", bookId: "padma-nadir-majhi", copy: "Copy 3 of 4", submitted: "2026-08-30", updated: "2026-09-30", due: "2026-09-29", status: "Issued", loanId: "LN-26-0311", member: memberNow, guarantor: tanvir,
    timeline: [{ date: "2026-08-30", label: "Request submitted" }, { date: "2026-08-31", label: "Approved" }, { date: "2026-09-01", label: "Book issued", note: "Due back 29 Sep 2026." }, { date: "2026-09-30", label: "Marked overdue" }] },
  { id: "BR-26-0204", bookId: "nondito-noroke", copy: "Copy 1 of 2", submitted: "2026-06-30", updated: "2026-07-21", due: "2026-07-23", status: "Issued", loanId: "LN-26-0204", member: memberNow, guarantor: shirin,
    timeline: [{ date: "2026-06-30", label: "Request submitted" }, { date: "2026-07-01", label: "Approved" }, { date: "2026-07-02", label: "Book issued" }, { date: "2026-07-21", label: "Book returned" }] },
  { id: "BR-26-0140", bookId: "solitude", copy: "Copy 1 of 1", submitted: "2026-05-07", updated: "2026-06-02", due: "2026-05-31", status: "Issued", loanId: "LN-26-0140", member: memberNow, guarantor: tanvir,
    timeline: [{ date: "2026-05-07", label: "Request submitted" }, { date: "2026-05-08", label: "Approved" }, { date: "2026-05-10", label: "Book issued" }, { date: "2026-06-02", label: "Book returned", note: "Returned 2 days late — fine F-2104 recorded." }] },
  { id: "BR-26-0098", bookId: "thakurmar-jhuli", copy: "Copy 2 of 3", submitted: "2026-03-29", updated: "2026-04-20", due: "2026-04-22", status: "Issued", loanId: "LN-26-0098", member: memberEarly2026, guarantor: shirinEarly,
    timeline: [{ date: "2026-03-29", label: "Request submitted" }, { date: "2026-03-31", label: "Approved" }, { date: "2026-04-01", label: "Book issued" }, { date: "2026-04-20", label: "Book returned" }] },
  { id: "BR-26-0051", bookId: "pather-panchali", copy: "Copy 4 of 5", submitted: "2026-02-08", updated: "2026-03-12", due: "2026-03-10", status: "Issued", loanId: "LN-26-0051", member: memberEarly2026, guarantor: shirinEarly,
    timeline: [{ date: "2026-02-08", label: "Request submitted" }, { date: "2026-02-09", label: "Approved" }, { date: "2026-02-10", label: "Book issued", note: "Due back 3 Mar 2026." }, { date: "2026-03-02", label: "Due date changed", note: "Renewed at the desk — new due date 10 Mar 2026." }, { date: "2026-03-12", label: "Book returned", note: "Minor page damage noted — fine F-1987 recorded." }] },
];

export type LoanStatus = "Active" | "Overdue" | "Returned" | "Lost";
export type Loan = { id: string; requestId: string; bookId: string; copy: string; issued: string; due: string; returned?: string; status: LoanStatus };
export const loans: Loan[] = [
  { id: "LN-26-0377", requestId: "BR-26-0377", bookId: "aranyak", copy: "Copy 1 of 3", issued: "2026-09-14", due: "2026-10-05", status: "Active" },
  { id: "LN-26-0352", requestId: "BR-26-0352", bookId: "god-small-things", copy: "Copy 2 of 2", issued: "2026-09-20", due: "2026-10-11", status: "Active" },
  { id: "LN-26-0311", requestId: "BR-26-0311", bookId: "padma-nadir-majhi", copy: "Copy 3 of 4", issued: "2026-09-01", due: "2026-09-29", status: "Overdue" },
  { id: "LN-26-0204", requestId: "BR-26-0204", bookId: "nondito-noroke", copy: "Copy 1 of 2", issued: "2026-07-02", due: "2026-07-23", returned: "2026-07-21", status: "Returned" },
  { id: "LN-26-0140", requestId: "BR-26-0140", bookId: "solitude", copy: "Copy 1 of 1", issued: "2026-05-10", due: "2026-05-31", returned: "2026-06-02", status: "Returned" },
  { id: "LN-26-0098", requestId: "BR-26-0098", bookId: "thakurmar-jhuli", copy: "Copy 2 of 3", issued: "2026-04-01", due: "2026-04-22", returned: "2026-04-20", status: "Returned" },
  { id: "LN-26-0051", requestId: "BR-26-0051", bookId: "pather-panchali", copy: "Copy 4 of 5", issued: "2026-02-10", due: "2026-03-10", returned: "2026-03-12", status: "Returned" },
];
export const getLoan = (id?: string) => loans.find((l) => l.id === id);

export type ContributionStatus = "Draft" | "Pending Review" | "Approved" | "Published" | "Needs Revision" | "Rejected";
export type Contribution = {
  id: string; kind: "blog" | "creative" | "review"; title: string; updated: string; status: ContributionStatus;
  /** Member-visible editor feedback. */ note?: string;
  slug?: string; bookId?: string; bookTitle?: string; bookSource?: string; rating?: number;
  submitted?: string; language?: string; category?: string; excerpt?: string; tags?: string[]; content?: string;
  file?: { name: string; type: "DOC" | "DOCX" | "PDF"; size: string };
  timeline?: RecordEvent[];
};
export const initialContributions: Contribution[] = [
  { id: "C-1182", kind: "review", title: "Aranyak and the forest that keeps calling", submitted: "2026-10-02", updated: "2026-10-02", status: "Pending Review", bookId: "aranyak", bookTitle: "Aranyak", bookSource: "Noholi catalogue · Books", rating: 5, language: "English",
    content: "I came to Aranyak expecting a nature book and found a book about guilt. Satyacharan clears the forest he loves, and Bibhutibhushan never lets him — or us — look away from that. Read it slowly, one chapter an evening.",
    timeline: [{ date: "2026-10-02", label: "Submitted for review" }] },
  { id: "C-1166", kind: "review", title: "Lalsalu, re-read at thirty", updated: "2026-09-26", status: "Draft", bookId: "lalsalu", bookTitle: "Lalsalu", bookSource: "Noholi catalogue · Books", rating: 4, language: "English",
    content: "Notes so far: Majid's fear is the real engine of the novel…", timeline: [{ date: "2026-09-26", label: "Draft saved" }] },
  { id: "C-1150", kind: "creative", title: "ধানমন্ডি লেকের ভোর", updated: "2026-09-21", status: "Draft", category: "Poetry", language: "Bangla", timeline: [{ date: "2026-09-21", label: "Draft saved" }] },
  { id: "C-1128", kind: "review", title: "Gitanjali in the audio edition", submitted: "2026-09-04", updated: "2026-09-12", status: "Needs Revision", bookId: "a-gitanjali", bookTitle: "Gitanjali (Audio Book)", bookSource: "Noholi catalogue · Audio Books", rating: 4, language: "English",
    file: { name: "gitanjali-audio-review.docx", type: "DOCX", size: "48 KB" },
    note: "A lovely review. Please add a sentence about the narration itself, and remove the quoted full poem (copyright), then resubmit.",
    timeline: [{ date: "2026-09-04", label: "Submitted for review" }, { date: "2026-09-12", label: "Returned for revision", note: "Editor feedback shared below." }] },
  { id: "C-1120", kind: "review", title: "Why Pather Panchali still breaks my heart", submitted: "2026-08-20", updated: "2026-08-27", status: "Published", bookId: "pather-panchali", bookTitle: "Pather Panchali", bookSource: "Noholi catalogue · Books", rating: 5, language: "English",
    content: "Durga running through the kash flowers is the scene everyone remembers. What stays with me is the quiet after — the house, the rain, the waiting.",
    timeline: [{ date: "2026-08-20", label: "Submitted for review" }, { date: "2026-08-25", label: "Approved" }, { date: "2026-08-27", label: "Published" }] },
  { id: "C-1094", kind: "blog", title: "What I learned volunteering at the children's corner", submitted: "2026-08-10", updated: "2026-08-18", status: "Published", slug: "children-corner-opens", category: "Library life", language: "English",
    excerpt: "Saturday mornings, thirty children, one shelf of picture books — and what they taught me about reading aloud.", tags: ["Volunteering", "Children", "Reading aloud"],
    timeline: [{ date: "2026-08-10", label: "Submitted for review" }, { date: "2026-08-15", label: "Approved" }, { date: "2026-08-18", label: "Published" }] },
  { id: "C-1062", kind: "review", title: "Sapiens — big ideas, thin evidence", submitted: "2026-07-20", updated: "2026-07-28", status: "Rejected", bookId: "sapiens", bookTitle: "Sapiens", bookSource: "Noholi catalogue · Books", rating: 2, language: "English",
    note: "This reads as a reply to another reader's review rather than a review of the book. We can't publish it in this form.",
    timeline: [{ date: "2026-07-20", label: "Submitted for review" }, { date: "2026-07-28", label: "Rejected", note: "Explanation shared below." }] },
  { id: "C-1031", kind: "creative", title: "Letters to a closed bookshop", submitted: "2026-06-22", updated: "2026-07-04", status: "Needs Revision", category: "Short story", language: "English",
    file: { name: "letters-to-a-closed-bookshop.pdf", type: "PDF", size: "212 KB" }, tags: ["Bookshops", "Dhaka"],
    excerpt: "Dear Mr. Karim, the shutter has been down for eleven days now…",
    note: "Thank you — this piece is close. The editors suggest tightening the second half and resubmitting.",
    timeline: [{ date: "2026-06-22", label: "Submitted for review" }, { date: "2026-07-04", label: "Returned for revision", note: "Editor feedback shared below." }] },
];

export type RecStatus = "Submitted" | "Under Review" | "Considering" | "Acquired" | "Not Planned";
export type Recommendation = {
  id: string; format?: "Physical Book" | "E-Book" | "Audio Book"; title: string; author: string; language: "Bangla" | "English"; reason: string; date: string; status: RecStatus;
  updated?: string; publisher?: string; isbn?: string; year?: string; edition?: string; genre?: string; category?: string; narrator?: string; source?: string; notes?: string;
  /** Public-facing explanation from the acquisitions team, when given. */ explanation?: string;
  /** Catalogue record id, only once an acquired title is actually catalogued. */ catalogId?: string;
  timeline?: RecordEvent[];
};
export const initialRecommendations: Recommendation[] = [
  { id: "RQ-0102", format: "Audio Book", title: "Lalsalu (audio edition)", author: "Syed Waliullah", narrator: "Any Bangla narrator", source: "Library-recorded or licensed", language: "Bangla", reason: "Older members in the reading circle have asked for Bangla classics they can listen to.", date: "2026-09-28", updated: "2026-10-01", status: "Under Review",
    timeline: [{ date: "2026-09-28", label: "Submitted" }, { date: "2026-10-01", label: "Under review" }] },
  { id: "RQ-0093", format: "Physical Book", title: "Shesher Kobita", author: "Rabindranath Tagore", publisher: "Visva-Bharati", genre: "Fiction", category: "Adults", language: "Bangla", reason: "Our only copy is falling apart and the reading circle wants to study it next term.", notes: "A hardback would survive the circle better.", date: "2026-09-18", updated: "2026-09-29", status: "Considering",
    explanation: "Being compared against our budget for next month's purchases.",
    timeline: [{ date: "2026-09-18", label: "Submitted" }, { date: "2026-09-22", label: "Under review" }, { date: "2026-09-29", label: "Considering" }] },
  { id: "RQ-0071", format: "Physical Book", title: "The Hungry Tide", author: "Amitav Ghosh", publisher: "HarperCollins", isbn: "978-0-00-714178-4", year: "2004", genre: "Fiction", language: "English", reason: "A Sundarbans novel — it would sit well beside Padma Nadir Majhi.", date: "2026-07-02", updated: "2026-09-05", status: "Acquired",
    explanation: "Purchased. It is being catalogued and will appear on the shelves soon.",
    timeline: [{ date: "2026-07-02", label: "Submitted" }, { date: "2026-07-10", label: "Under review" }, { date: "2026-08-01", label: "Considering" }, { date: "2026-09-05", label: "Acquired" }] },
  { id: "RQ-0058", format: "E-Book", title: "Atomic Habits", author: "James Clear", publisher: "Avery", year: "2018", source: "Publisher e-book licence", language: "English", reason: "Lots of students ask for it.", date: "2026-05-14", updated: "2026-06-02", status: "Not Planned",
    explanation: "We couldn't secure a library e-book licence for this title.",
    timeline: [{ date: "2026-05-14", label: "Submitted" }, { date: "2026-05-20", label: "Under review" }, { date: "2026-06-02", label: "Not planned" }] },
];

export type FinePayment = { date: string; amount: number; method: string; receipt: string };
export type Fine = { id: string; bookId: string; loanId: string; reason: string; overdueDays?: number; amount: number; date: string; payments: FinePayment[] };
export const fines: Fine[] = [
  { id: "F-2291", bookId: "padma-nadir-majhi", loanId: "LN-26-0311", reason: "Late return", overdueDays: 4, amount: 40, date: "2026-10-03", payments: [] },
  { id: "F-2104", bookId: "solitude", loanId: "LN-26-0140", reason: "Late return", overdueDays: 2, amount: 20, date: "2026-06-02", payments: [{ date: "2026-06-02", amount: 20, method: "Cash at front desk", receipt: "RC-0611" }] },
  { id: "F-1987", bookId: "pather-panchali", loanId: "LN-26-0051", reason: "Minor page damage", amount: 150, date: "2026-03-12", payments: [{ date: "2026-03-12", amount: 100, method: "Cash at front desk", receipt: "RC-0402" }, { date: "2026-03-19", amount: 50, method: "Cash at front desk", receipt: "RC-0417" }] },
];
export const fineOutstanding = (f: Fine) => f.amount - f.payments.reduce((s, p) => s + p.amount, 0);

export const readingActivity = [
  { kind: "ebook" as const, id: "pather-panchali", progress: 0.42, when: "Yesterday" },
  { kind: "audio" as const, id: "a-gitanjali", progress: 0.68, when: "2 days ago" },
  { kind: "ebook" as const, id: "nodir-naam", progress: 0.15, when: "Last week" },
];

export const readerChapters = [
  { title: "Chapter One — The Bamboo Grove", paras: [
    "The house stood at the edge of the village where the bamboo grew thickest, and in the mornings the light came through it in long green bars.",
    "Durga was always up first. She would slip out before their mother woke, barefoot on the cold earth, to see what the night had left: fallen mangoes, a snail on the wall, the tracks of a jackal in the dust by the pond.",
    "Apu followed when he could. He was smaller and slower, and he asked too many questions, but she let him come because it was more fun to show someone a thing than to see it alone.",
    "\"Look,\" she said that morning, crouching by the roots of the old jackfruit tree. Something gleamed in the mud. A bead — red glass, the kind sold at the fair. Apu held it up to the light and the whole world turned the colour of a pomegranate.",
    "It was nothing, of course. A cheap bead someone had lost. But he kept it in a tin box for the rest of his childhood, and when he was a grown man in a city far away, he found he could still remember exactly how the light had looked through it.",
  ] },
  { title: "Chapter Two — The Train", paras: [
    "They had heard of the train long before they saw it. It was a rumour, a story the older boys told, a sound that sometimes came across the fields on still evenings — a long, thin cry like a bird that had lost its way.",
    "One afternoon in the season of kash flowers, Durga took his hand and said, \"Today.\"",
    "They ran through the white fields until their legs were scratched and their breath was gone, and then they stood at the edge of the embankment and waited.",
    "When it came, it was larger and louder and blacker than anything Apu had imagined. Smoke poured from it. The ground shook. He did not realise he was shouting until it had passed and his throat was sore.",
    "Durga was laughing. She was laughing so hard she had to sit down in the flowers. He would remember that, too.",
  ] },
  { title: "Chapter Three — Monsoon", paras: [
    "The rains came early that year. The pond overflowed into the courtyard and the frogs sang all night.",
    "Their mother worried about the roof. Their father was away again, in some distant town, writing letters that promised money that never quite arrived.",
    "Durga caught a fever after dancing in the first rain. It was only a small fever, everyone said. It would pass.",
    "Apu sat by her bed and told her stories he had invented about the train, about where it went, about the cities at the end of the line. She listened with her eyes closed and smiled at the good parts.",
  ] },
];

/** Short member reviews attached to a book or audio book (by id). Longer editorial reviews live in `articles`. */
export type CommunityReview = { id: string; itemId: string; name: string; date: string; rating: number; title: string; text: string; recommend: boolean; tags?: string[] };
export const communityReviews: CommunityReview[] = [
  { id: "R-301", itemId: "pather-panchali", name: "Farzana Akter", date: "2026-09-12", rating: 5, title: "A book that smells of rain", text: "I borrowed it for my daughter's school project and ended up reading it myself in two evenings. Durga will stay with me for a long time.", recommend: true, tags: ["Emotional", "Slow-paced"] },
  { id: "R-288", itemId: "pather-panchali", name: "Imran Chowdhury", date: "2026-08-02", rating: 4, title: "Slow, and worth it", text: "The first hundred pages ask for patience. After that, every small event in the village feels enormous.", recommend: true, tags: ["Thought-provoking"] },
  { id: "R-276", itemId: "lalsalu", name: "Nusrat Jahan", date: "2026-09-21", rating: 5, title: "Short and sharp", text: "Barely 130 pages and it says more about power than books three times its length.", recommend: true, tags: ["Challenging", "Thought-provoking"] },
  { id: "R-262", itemId: "khoabnama", name: "Rafi Islam", date: "2026-07-25", rating: 4, title: "Demanding, rewarding", text: "Keep a notebook for the names. The dream sequences are unlike anything else in Bangla fiction.", recommend: true, tags: ["Challenging"] },
  { id: "R-255", itemId: "aranyak", name: "Tanvir Hasan", date: "2026-08-30", rating: 5, title: "The forest as a character", text: "Read it during load-shedding by candlelight — exactly the right way.", recommend: true, tags: ["Inspiring", "Slow-paced"] },
  { id: "R-240", itemId: "a-gitanjali", name: "Sabrina Khan", date: "2026-09-04", rating: 5, title: "Kamal Hossain's voice is perfect", text: "Unhurried and warm. I listen to two poems every night before sleeping.", recommend: true, tags: ["Inspiring"] },
  { id: "R-233", itemId: "a-nondito", name: "Arif Mahmud", date: "2026-08-11", rating: 4, title: "Funny, then devastating", text: "The narration catches Humayun Ahmed's humour well. The ending still hurts.", recommend: true, tags: ["Emotional", "Easy to read"] },
  { id: "R-219", itemId: "little-prince", name: "Kamal Hossain", date: "2026-08-03", rating: 5, title: "Better at forty", text: "A children's book that turns out to be about grief.", recommend: true, tags: ["Emotional"] },
];
