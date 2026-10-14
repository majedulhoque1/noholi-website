// Small strings that bring the live pages in line with the visual reference ("ux.*"):
// hero search placeholder, home stat row, book-page actions and reviews, login "Forgot password?".
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Bangla needs a native proofread.
const en = {
  "ux.search.placeholder": "Search a title, author or ISBN…",
  "ux.home.statBooks": "Books on the shelf",
  "ux.home.statLanguages": "Languages",
  "ux.home.statAvailable": "Available to borrow",
  "ux.login.forgotLink": "Forgot password?",
  "ux.wish.add": "Add to wishlist",
  "ux.wish.remove": "Remove from wishlist",
  "ux.wish.in": "In wishlist",
  "ux.wish.added": "Saved to your wishlist.",
  "ux.wish.removed": "Removed from your wishlist.",
  "ux.book.writeReview": "Write a Review",
  "ux.book.recommend": "Recommend a Book to Noholi",
  "ux.book.reviewsEyebrow": "Readers on this book",
  "ux.book.reviews": "Reviews",
  "ux.book.noReviews": "No reviews yet. Reader reviews are coming soon.",
};

const bn: Record<keyof typeof en, string> = {
  "ux.search.placeholder": "শিরোনাম, লেখক বা ISBN খুঁজুন…",
  "ux.home.statBooks": "তাকে থাকা বই",
  "ux.home.statLanguages": "ভাষা",
  "ux.home.statAvailable": "এখন ধার নেওয়া যায়",
  "ux.login.forgotLink": "পাসওয়ার্ড ভুলে গেছেন?",
  "ux.wish.add": "পছন্দের তালিকায় যোগ করুন",
  "ux.wish.remove": "পছন্দের তালিকা থেকে সরান",
  "ux.wish.in": "পছন্দের তালিকায় আছে",
  "ux.wish.added": "পছন্দের তালিকায় সংরক্ষিত হয়েছে।",
  "ux.wish.removed": "পছন্দের তালিকা থেকে সরানো হয়েছে।",
  "ux.book.writeReview": "রিভিউ লিখুন",
  "ux.book.recommend": "নহলিকে একটি বই সুপারিশ করুন",
  "ux.book.reviewsEyebrow": "এই বইয়ের পাঠকেরা",
  "ux.book.reviews": "রিভিউ",
  "ux.book.noReviews": "এখনো কোনো রিভিউ নেই। পাঠকদের রিভিউ শীঘ্রই আসছে।",
};

export const extras = { en, bn };
