// Catalog, search, book detail, home shelves and library rules strings ("catalog.*").
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Namespace keys, e.g. "catalog.someKey".
// Bangla wording reused from web-legacy/src/i18n/bn.js where the meaning matches.
const en = {
  // --- catalogue page ---
  "catalog.title": "The printed collection.",
  "catalog.filters": "Filters",
  "catalog.filterRegion": "Book filters",
  "catalog.closeFilters": "Close filters",
  "catalog.clearAll": "Clear all",
  "catalog.resetFilters": "Reset filters",
  "catalog.filterGenre": "Genre",
  "catalog.filterCategory": "Category",
  "catalog.filterLanguage": "Language",
  "catalog.allGenres": "All genres",
  "catalog.allCategories": "All categories",
  "catalog.allLanguages": "All languages",
  "catalog.facetsError": "The filter choices could not be loaded: {error}",
  "catalog.loading": "Loading catalogue…",
  "catalog.count": "{n} books",
  "catalog.countOne": "{n} book",
  "catalog.forQuery": " for “{q}”",
  "catalog.errorTitle": "The catalogue could not be loaded",
  "catalog.tryAgain": "Try again",
  "catalog.noMatchTitle": "No books match that search",
  "catalog.noMatchBody": "Try a different spelling, search in Bangla, or clear a few filters.",
  "catalog.resetSearch": "Reset search",
  "catalog.noPage": "There are no books on page {page}.",
  "catalog.goToPage1": "Go to page 1",
  "catalog.previous": "Previous",
  "catalog.next": "Next",
  "catalog.pages": "Catalogue pages",
  "catalog.pageOf": "Page {page} of {total}",
  "catalog.showResults": "Show {n} books",
  "catalog.removeFilter": "Remove filter {value}",

  // --- availability (cards, book page) ---
  "catalog.availableOf": "{available} of {total} available",
  "catalog.readingRoomOnly": "Reading room only",
  "catalog.allOnLoan": "All copies on loan",
  "catalog.noCopies": "No copies on the shelf",

  // --- search box and search page ---
  "catalog.searching": "Searching…",
  "catalog.searchError": "Books could not be searched: {error}",
  "catalog.noResults":
    "Nothing on our shelves matches “{q}”. Try an author's name or a Bangla title.",
  "catalog.viewAllResults": "View all results for “{q}” →",
  "catalog.findInCatalogue": "Find in catalogue",
  "catalog.clearSearch": "Clear search",
  "catalog.groupAuthors": "Authors",
  "catalog.searchEyebrow": "Search",
  "catalog.searchPageTitle": "Search the library.",
  "catalog.searchPageIntro": "Books in the catalogue, write ups, e-books and audio books.",
  "catalog.searchResultsFor": "Results for “{q}”",
  "catalog.searchSummary": "{books} in the catalogue · {other} elsewhere on the site.",
  "catalog.searchNothingTitle": "Nothing on our shelves yet.",
  "catalog.searchNothingBody": "We couldn't find “{q}”. Try another spelling, or search in Bangla.",
  "catalog.seeAllInCatalogue": "See all {n} matching books in the catalogue →",

  // --- book page ---
  "catalog.backToLibrary": "Back to Library",
  "catalog.bookNotFoundTitle": "Book not found",
  "catalog.bookNotFoundBody":
    "There is no book with that number in the catalogue. It may have been withdrawn, or the link may be out of date.",
  "catalog.bookLoadErrorTitle": "This book could not be loaded",
  "catalog.browseLibrary": "Browse the library",
  "catalog.labelPublisher": "Publisher",
  "catalog.labelYear": "Year",
  "catalog.labelEdition": "Edition",
  "catalog.labelIsbn": "ISBN",
  "catalog.labelPages": "Pages",
  "catalog.labelCondition": "Condition",
  "catalog.labelCopies": "Copies",
  "catalog.labelBookNumber": "Book number",
  "catalog.copiesOnShelf": "{available} of {total} on shelf",
  "catalog.borrow": "Borrow",
  "catalog.unavailableBtn": "Currently unavailable",
  "catalog.readingRoomBtn": "Reading room only",
  "catalog.readingRoomNotice":
    "This book is for reading at the library only and cannot be borrowed.",
  "catalog.allOnLoanNotice":
    "All copies are on loan right now. Please check back later, or ask at the circulation desk.",
  "catalog.noCopiesNotice": "The library has no copy of this book on the shelf right now.",
  "catalog.borrowNote": "Borrowing is free. Late-return fines apply.",
  "catalog.rulesLink": "Read the library rules",
  "catalog.reviewsSoon": "Reader reviews are coming soon.",
  "catalog.related": "You might also borrow",
  "catalog.relatedError": "Related books could not be loaded: {error}",

  // --- home ---
  "catalog.homeBooksStat": "Books in the catalogue",
  "catalog.fromShelves": "From the shelves",
  "catalog.shelfError": "The shelf could not be loaded: {error}",
  "catalog.fourWaysBooks": "Thousands of volumes in Bangla and English, ready to borrow.",
  "catalog.noholiImprint": "Published by Noholi",
  "catalog.pagesCount": "{n} pages",

  // --- library rules ---
  "catalog.rulesEyebrow": "Library / Rules",
  "catalog.rulesTitle": "A shared space for every reader.",
  "catalog.rulesIntro":
    "Our library rules help keep Noholi welcoming, accessible, and fair to everyone.",
  "catalog.rulesContents": "Contents",
  "catalog.rulesTbcNote":
    "Sections marked “to be confirmed” are not yet official policy. Please check with the library before relying on them.",
  "catalog.rulesTbc": "Details to be confirmed by Noholi Library.",
  "catalog.rulesLoadError":
    "The current loan, fine and hold numbers could not be loaded ({error}), so they are shown as to be confirmed.",
  "catalog.rulesMembership": "Membership",
  "catalog.rulesMembershipFree":
    "Membership at Noholi is free. There is no joining or monthly fee.",
  "catalog.rulesMembershipTbc": "Eligibility and renewal of membership: {tbc}",
  "catalog.rulesBorrowing": "Borrowing Books",
  "catalog.rulesBorrowingHow":
    "Members borrow printed books by sending a Borrow Request from the book's page. A copy is held for you as soon as you send it.",
  "catalog.rulesBorrowingFree": "Borrowing is free. No payment is taken at any step.",
  "catalog.rulesItemLimit":
    "You can have up to {max} books at a time: books on loan plus books being held for you.",
  "catalog.rulesHolds": "Holds and Pickup",
  "catalog.rulesHoldsBody":
    "When you send a Borrow Request you choose a pickup date, from today up to {window} ahead. Your copy is held until {grace} after that date. If it has not been collected by then, the hold expires.",
  "catalog.rulesLoan": "Loan Period and Renewals",
  "catalog.rulesLoanDays": "A book is lent for {days}.",
  "catalog.rulesRenewOnce":
    "You can renew a loan yourself once from your account. The renewal adds {days} to the due date.",
  "catalog.rulesRenewMany":
    "You can renew a loan yourself up to {times} times from your account. Each renewal adds {days} to the due date.",
  "catalog.rulesRenewNone": "Loans cannot be renewed from your account.",
  "catalog.rulesClosedDays": "The library is closed on {days}.",
  "catalog.rulesClosedShift":
    "A due date that falls on a day the library is closed moves to the next open day.",
  "catalog.rulesReturns": "Returns",
  "catalog.rulesOverdue": "Overdue Books and Fines",
  "catalog.rulesOverdueAccount":
    "Overdue books are shown in your account under Overdue & Fines. No fine can be paid online.",
  "catalog.rulesFine":
    "A late fine of {amount} applies for each day a book is overdue, with no grace period. A fine never goes above the value of the book.",
  "catalog.rulesFineTbc": "Any other fine rules: {tbc}",
  "catalog.rulesCare": "Book Care",
  "catalog.rulesLost": "Lost or Damaged Books",
  "catalog.rulesGuarantor": "Guarantor and Identification",
  "catalog.rulesGuarantorBody":
    "A Borrow Request asks for your identification and guarantor details so the library can review it.",
  "catalog.rulesGuarantorTbc": "Which documents are accepted and who can act as a guarantor: {tbc}",
  "catalog.rulesDigital": "E-Books and Audio Books",
  "catalog.rulesDigitalBody":
    "Members can read e-books in the browser and listen to audio books on the Noholi website.",
  "catalog.rulesDigitalTbc": "Access limits and availability: {tbc}",
  "catalog.rulesConduct": "Member Conduct",
  "catalog.rulesPrivacy": "Privacy",
  "catalog.rulesContact": "Contact and Questions",
  "catalog.rulesContactBody":
    "If anything here is unclear, ask at the front desk or send us a message. We're glad to help.",
  "catalog.rulesContactLink": "Contact the library",
  "catalog.rulesCta": "Ready to find your next read?",
  "catalog.rulesExplore": "Explore the Library",
  "catalog.nDays": "{n} days",
  "catalog.nDay": "{n} day",
};

const bn: Record<keyof typeof en, string> = {
  // --- catalogue page ---
  "catalog.title": "মুদ্রিত সংগ্রহ।",
  "catalog.filters": "ফিল্টার",
  "catalog.filterRegion": "বইয়ের ফিল্টার",
  "catalog.closeFilters": "ফিল্টার বন্ধ করুন",
  "catalog.clearAll": "সব মুছুন",
  "catalog.resetFilters": "ফিল্টার রিসেট করুন",
  "catalog.filterGenre": "ধরন",
  "catalog.filterCategory": "ক্যাটাগরি",
  "catalog.filterLanguage": "ভাষা",
  "catalog.allGenres": "সকল ধরন",
  "catalog.allCategories": "সকল ক্যাটাগরি",
  "catalog.allLanguages": "সকল ভাষা",
  "catalog.facetsError": "ফিল্টারের তালিকা লোড করা যায়নি: {error}",
  "catalog.loading": "ক্যাটালগ লোড হচ্ছে…",
  "catalog.count": "{n}টি বই",
  "catalog.countOne": "{n}টি বই",
  "catalog.forQuery": " “{q}”-এর জন্য",
  "catalog.errorTitle": "ক্যাটালগ লোড করা যায়নি",
  "catalog.tryAgain": "আবার চেষ্টা করুন",
  "catalog.noMatchTitle": "এই খোঁজের সাথে মিলে এমন কোনো বই নেই",
  "catalog.noMatchBody": "অন্য বানানে লিখুন, বাংলায় খুঁজুন, অথবা কিছু ফিল্টার মুছে দেখুন।",
  "catalog.resetSearch": "খোঁজ রিসেট করুন",
  "catalog.noPage": "পৃষ্ঠা {page}-এ কোনো বই নেই।",
  "catalog.goToPage1": "পৃষ্ঠা ১-এ যান",
  "catalog.previous": "আগের",
  "catalog.next": "পরের",
  "catalog.pages": "ক্যাটালগের পৃষ্ঠা",
  "catalog.pageOf": "পৃষ্ঠা {page} এর {total}",
  "catalog.showResults": "{n}টি বই দেখুন",
  "catalog.removeFilter": "ফিল্টার সরান: {value}",

  // --- availability (cards, book page) ---
  "catalog.availableOf": "{total}টির মধ্যে {available}টি উপলব্ধ",
  "catalog.readingRoomOnly": "শুধুমাত্র পাঠকক্ষে পড়ার জন্য",
  "catalog.allOnLoan": "সবগুলো কপি ধার দেওয়া হয়েছে",
  "catalog.noCopies": "শেলফে কোনো কপি নেই",

  // --- search box and search page ---
  "catalog.searching": "খোঁজা হচ্ছে…",
  "catalog.searchError": "বই খোঁজা যায়নি: {error}",
  "catalog.noResults":
    "“{q}”-এর সাথে মিলে এমন কিছু আমাদের তাকে নেই। লেখকের নাম বা বাংলা শিরোনাম দিয়ে চেষ্টা করুন।",
  "catalog.viewAllResults": "“{q}”-এর সব ফলাফল দেখুন →",
  "catalog.findInCatalogue": "ক্যাটালগে খুঁজুন",
  "catalog.clearSearch": "খোঁজ মুছুন",
  "catalog.groupAuthors": "লেখক",
  "catalog.searchEyebrow": "খোঁজ",
  "catalog.searchPageTitle": "পাঠাগারে খুঁজুন।",
  "catalog.searchPageIntro": "ক্যাটালগের বই, লেখালেখি, ই-বুক ও অডিও বই।",
  "catalog.searchResultsFor": "“{q}”-এর ফলাফল",
  "catalog.searchSummary": "ক্যাটালগে {books} · সাইটের অন্যত্র {other}।",
  "catalog.searchNothingTitle": "আমাদের তাকে এখনো কিছু নেই।",
  "catalog.searchNothingBody": "“{q}” খুঁজে পাওয়া যায়নি। অন্য বানানে লিখুন, অথবা বাংলায় খুঁজুন।",
  "catalog.seeAllInCatalogue": "ক্যাটালগে মিলে যাওয়া সব {n}টি বই দেখুন →",

  // --- book page ---
  "catalog.backToLibrary": "পাঠাগারে ফিরুন",
  "catalog.bookNotFoundTitle": "বইটি পাওয়া যায়নি",
  "catalog.bookNotFoundBody":
    "ক্যাটালগে এই নম্বরের কোনো বই নেই। বইটি সংগ্রহ থেকে সরিয়ে ফেলা হয়ে থাকতে পারে, অথবা লিংকটি পুরনো।",
  "catalog.bookLoadErrorTitle": "এই বইটি লোড করা যায়নি",
  "catalog.browseLibrary": "পাঠাগার ঘুরে দেখুন",
  "catalog.labelPublisher": "প্রকাশক",
  "catalog.labelYear": "প্রকাশ সাল",
  "catalog.labelEdition": "সংস্করণ",
  "catalog.labelIsbn": "আইএসবিএন",
  "catalog.labelPages": "পৃষ্ঠা",
  "catalog.labelCondition": "অবস্থা",
  "catalog.labelCopies": "কপি",
  "catalog.labelBookNumber": "বই নম্বর",
  "catalog.copiesOnShelf": "{total}টির মধ্যে {available}টি শেলফে",
  "catalog.borrow": "ধার নিন",
  "catalog.unavailableBtn": "বর্তমানে পাওয়া যাচ্ছে না",
  "catalog.readingRoomBtn": "শুধু পাঠকক্ষে",
  "catalog.readingRoomNotice": "এই বইটি শুধুমাত্র পাঠকক্ষে পড়ার জন্য, ধার নেওয়া যাবে না।",
  "catalog.allOnLoanNotice":
    "সবগুলো কপি এখন ধার দেওয়া আছে। দয়া করে পরে আবার দেখুন, অথবা সার্কুলেশন ডেস্কে জিজ্ঞাসা করুন।",
  "catalog.noCopiesNotice": "এই বইয়ের কোনো কপি এখন শেলফে নেই।",
  "catalog.borrowNote": "ধার নেওয়া বিনামূল্যে। দেরিতে ফেরত দিলে জরিমানা প্রযোজ্য।",
  "catalog.rulesLink": "পাঠাগারের নিয়মাবলি পড়ুন",
  "catalog.reviewsSoon": "পাঠকদের পর্যালোচনা শীঘ্রই আসছে।",
  "catalog.related": "আপনার আরও পছন্দ হতে পারে",
  "catalog.relatedError": "সম্পর্কিত বই লোড করা যায়নি: {error}",

  // --- home ---
  "catalog.homeBooksStat": "ক্যাটালগে বই",
  "catalog.fromShelves": "শেলফ থেকে",
  "catalog.shelfError": "শেলফ লোড করা যায়নি: {error}",
  "catalog.fourWaysBooks": "বাংলা ও ইংরেজিতে হাজারো বই, ধার নেওয়ার জন্য প্রস্তুত।",
  "catalog.noholiImprint": "নহলি প্রকাশিত",
  "catalog.pagesCount": "{n} পৃষ্ঠা",

  // --- library rules ---
  "catalog.rulesEyebrow": "পাঠাগার / নিয়মাবলি",
  "catalog.rulesTitle": "প্রতিটি পাঠকের জন্য একটি যৌথ জায়গা।",
  "catalog.rulesIntro":
    "আমাদের নিয়মাবলি নহলিকে সবার জন্য স্বাগতপূর্ণ, সহজগম্য ও ন্যায্য রাখতে সাহায্য করে।",
  "catalog.rulesContents": "সূচিপত্র",
  "catalog.rulesTbcNote":
    "“নিশ্চিত করা হবে” চিহ্নিত অংশগুলো এখনো আনুষ্ঠানিক নীতি নয়। ভরসা করার আগে পাঠাগারের সাথে যাচাই করে নিন।",
  "catalog.rulesTbc": "বিস্তারিত নহলী লাইব্রেরি নিশ্চিত করবে।",
  "catalog.rulesLoadError":
    "ধার, জরিমানা ও হোল্ডের বর্তমান সংখ্যাগুলো লোড করা যায়নি ({error}), তাই এগুলো “নিশ্চিত করা হবে” হিসেবে দেখানো হয়েছে।",
  "catalog.rulesMembership": "সদস্যপদ",
  "catalog.rulesMembershipFree": "নহলিতে সদস্যপদ বিনামূল্যে। ভর্তি বা মাসিক কোনো ফি নেই।",
  "catalog.rulesMembershipTbc": "সদস্যপদের যোগ্যতা ও নবায়ন: {tbc}",
  "catalog.rulesBorrowing": "বই ধার নেওয়া",
  "catalog.rulesBorrowingHow":
    "সদস্যরা বইয়ের পাতা থেকে ধারের অনুরোধ পাঠিয়ে ছাপা বই ধার নেন। অনুরোধ পাঠানোর সাথে সাথেই আপনার জন্য একটি কপি আলাদা করে রাখা হয়।",
  "catalog.rulesBorrowingFree": "ধার নেওয়া বিনামূল্যে। কোনো ধাপেই টাকা নেওয়া হয় না।",
  "catalog.rulesItemLimit":
    "একসাথে সর্বোচ্চ {max}টি বই রাখতে পারবেন: ধার নেওয়া বই এবং আপনার জন্য আলাদা করে রাখা বই মিলিয়ে।",
  "catalog.rulesHolds": "হোল্ড ও সংগ্রহ",
  "catalog.rulesHoldsBody":
    "ধারের অনুরোধ পাঠানোর সময় আপনি আজ থেকে শুরু করে {window} পর্যন্ত একটি সংগ্রহের তারিখ বেছে নেন। সেই তারিখের পর {grace} পর্যন্ত কপিটি আপনার জন্য রাখা থাকে। তার মধ্যে সংগ্রহ না করলে হোল্ডের মেয়াদ শেষ হয়ে যায়।",
  "catalog.rulesLoan": "ধারের মেয়াদ ও নবায়ন",
  "catalog.rulesLoanDays": "একটি বই {days}-এর জন্য ধার দেওয়া হয়।",
  "catalog.rulesRenewOnce":
    "নিজের অ্যাকাউন্ট থেকে আপনি একবার ধার নবায়ন করতে পারবেন। নবায়নে ফেরতের তারিখ {days} বাড়ে।",
  "catalog.rulesRenewMany":
    "নিজের অ্যাকাউন্ট থেকে আপনি সর্বোচ্চ {times} বার ধার নবায়ন করতে পারবেন। প্রতিবার নবায়নে ফেরতের তারিখ {days} বাড়ে।",
  "catalog.rulesRenewNone": "অ্যাকাউন্ট থেকে ধার নবায়ন করা যায় না।",
  "catalog.rulesClosedDays": "পাঠাগার {days} বন্ধ থাকে।",
  "catalog.rulesClosedShift":
    "ফেরতের তারিখ পাঠাগার বন্ধ থাকার দিনে পড়লে তা পরের খোলা দিনে সরে যায়।",
  "catalog.rulesReturns": "ফেরত",
  "catalog.rulesOverdue": "মেয়াদোত্তীর্ণ বই ও জরিমানা",
  "catalog.rulesOverdueAccount":
    "মেয়াদোত্তীর্ণ বই আপনার অ্যাকাউন্টের “মেয়াদোত্তীর্ণ ও জরিমানা” অংশে দেখা যায়। অনলাইনে জরিমানা দেওয়া যায় না।",
  "catalog.rulesFine":
    "বই যতদিন মেয়াদোত্তীর্ণ থাকে, প্রতিদিনের জন্য {amount} জরিমানা প্রযোজ্য; কোনো ছাড়ের সময় নেই। জরিমানা কখনো বইয়ের মূল্যের বেশি হয় না।",
  "catalog.rulesFineTbc": "জরিমানা সম্পর্কিত অন্যান্য নিয়ম: {tbc}",
  "catalog.rulesCare": "বইয়ের যত্ন",
  "catalog.rulesLost": "হারানো বা ক্ষতিগ্রস্ত বই",
  "catalog.rulesGuarantor": "জামিনদার ও পরিচয়পত্র",
  "catalog.rulesGuarantorBody":
    "ধারের অনুরোধে আপনার পরিচয় ও জামিনদারের তথ্য চাওয়া হয়, যাতে পাঠাগার তা যাচাই করতে পারে।",
  "catalog.rulesGuarantorTbc": "কোন কাগজপত্র গ্রহণযোগ্য এবং কে জামিনদার হতে পারবেন: {tbc}",
  "catalog.rulesDigital": "ই-বুক ও অডিও বই",
  "catalog.rulesDigitalBody":
    "সদস্যরা নহলির ওয়েবসাইটে ব্রাউজারে ই-বুক পড়তে ও অডিও বই শুনতে পারেন।",
  "catalog.rulesDigitalTbc": "ব্যবহারের সীমা ও প্রাপ্যতা: {tbc}",
  "catalog.rulesConduct": "সদস্যদের আচরণ",
  "catalog.rulesPrivacy": "গোপনীয়তা",
  "catalog.rulesContact": "যোগাযোগ ও প্রশ্ন",
  "catalog.rulesContactBody":
    "এখানে কিছু অস্পষ্ট মনে হলে ফ্রন্ট ডেস্কে জিজ্ঞাসা করুন বা আমাদের বার্তা পাঠান। আমরা সাহায্য করতে পেরে খুশি হব।",
  "catalog.rulesContactLink": "পাঠাগারের সাথে যোগাযোগ করুন",
  "catalog.rulesCta": "পরের বই খুঁজে নিতে প্রস্তুত?",
  "catalog.rulesExplore": "পাঠাগার ঘুরে দেখুন",
  "catalog.nDays": "{n} দিন",
  "catalog.nDay": "{n} দিন",
};

export const catalog = { en, bn };
