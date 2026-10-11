// Join, contact, privacy, footer and coming-soon strings ("forms.*").
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Namespace keys, e.g. "forms.someKey".
// Bangla is reused from web-legacy/src/i18n/bn.js where the meaning matches; the rest needs a native proofread.
const en = {
  // ---- Coming soon (features with no backend yet) ----
  "forms.soon.badge": "Coming soon",
  "forms.soon.title": "Coming soon",
  "forms.soon.list": "Coming soon — this part of your account isn't live yet.",
  "forms.soon.listBody":
    "Nothing is saved or sent from here yet. We'll switch it on once the library is ready.",
  "forms.soon.banner":
    "Coming soon — this part of your account isn't live yet. You can look around, but nothing you enter is saved or sent.",
  "forms.soon.dialogBody":
    "This feature isn't live yet, so nothing has been saved or sent. We'll switch it on once the library is ready.",
  "forms.soon.ok": "Got it",
  "forms.soon.upload": "Document upload is coming soon.",
  "forms.soon.wish": "Saving to a wishlist is coming soon.",
  "forms.soon.contribute": "Submitting writing is coming soon — nothing was saved or sent.",
  "forms.soon.recommend": "Recommending books is coming soon — nothing was saved or sent.",
  "forms.soon.reviews":
    "Community reviews are coming soon. Nothing is shown here until they are live.",
  "forms.soon.writeReview": "Writing a review is coming soon",

  // ---- Join ----
  "forms.join.pageTitle": "Become a Member — Noholi Library",
  "forms.join.eyebrow": "Membership",
  "forms.join.title": "Become part of Noholi.",
  "forms.join.intro": "Membership is free. Four short steps, no payment.",
  "forms.join.backToSite": "Back to website",
  "forms.join.step1": "Your details",
  "forms.join.step2": "Address",
  "forms.join.step3": "Photo",
  "forms.join.step4": "Review & send",
  "forms.join.stepHeading": "Step {n} — {name}",
  "forms.join.name": "Full name",
  "forms.join.namePh": "e.g. Nusrat Jahan",
  "forms.join.email": "Email address",
  "forms.join.emailPh": "you@example.com",
  "forms.join.phone": "Phone number",
  "forms.join.phonePh": "+880 17…",
  "forms.join.street": "Street address",
  "forms.join.streetPh": "House, road, area",
  "forms.join.city": "City / area",
  "forms.join.district": "District",
  "forms.join.postal": "Postal code",
  "forms.join.optional": "(optional)",
  "forms.join.photo": "Applicant photo",
  "forms.join.photoHint":
    "A clear, front-facing JPG, PNG or WebP photograph, up to 15 MB. Optional — you can also bring one to the circulation desk.",
  "forms.join.choosePhoto": "Choose photo",
  "forms.join.changePhoto": "Change photo",
  "forms.join.removePhoto": "Remove",
  "forms.join.photoSelected": "Selected: {name}",
  "forms.join.freeTitle": "Membership is free.",
  "forms.join.freeBody":
    "Noholi Library functions on mutual accountability. There are no subscription tiers or membership purchase fees. See circulation desk for current policy details.",
  "forms.join.reviewPhoto": "Photo",
  "forms.join.photoAttached": "Attached",
  "forms.join.photoNone": "Not attached",
  "forms.join.reviewMembership": "Membership",
  "forms.join.reviewFree": "Free",
  "forms.join.consent":
    "By submitting, you agree that library staff may keep these details and your photograph to process your application. Read the",
  "forms.join.consentLink": "privacy notice",
  "forms.join.back": "Back",
  "forms.join.continue": "Continue",
  "forms.join.submit": "Submit application",
  "forms.join.sending": "Sending your application…",
  "forms.join.errName": "Please enter your full name.",
  "forms.join.errEmail": "Please enter a valid email address.",
  "forms.join.errPhone": "Please enter a valid phone number.",
  "forms.join.errStreet": "Please enter your street address.",
  "forms.join.errPhoto": "The photograph must be a JPG, PNG or WebP image of 15MB or less.",
  "forms.join.doneTitle": "Application received.",
  "forms.join.doneThanks": "Thank you, {name}. Your application has been received.",
  "forms.join.doneRef": "Your reference is {ref}.",
  "forms.join.donePhone":
    "The library will phone you on {phone} to arrange verification at the circulation desk.",
  "forms.join.donePhotoFailed":
    "Your photograph could not be uploaded, so please bring one to the circulation desk.",
  "forms.join.refLabel": "Reference",
  "forms.join.browse": "Browse the library",
  "forms.join.sendFailed":
    "The application could not be sent. Please check your connection and try again.",

  // ---- Shared intake errors ----
  "forms.intake.throttled":
    "You have already sent this form several times today. We will be in touch.",
  "forms.intake.photoUnreadable":
    "That file could not be read as an image. Please choose a JPG or PNG photograph.",
  "forms.intake.photoFailed": "The photograph could not be prepared. Please try another file.",

  // ---- Contact ----
  "forms.contact.pageTitle": "Contact — Noholi Library",
  "forms.contact.eyebrow": "Contact · যোগাযোগ",
  "forms.contact.title": "Write to us.",
  "forms.contact.intro":
    "For inquiries, study reservations, membership questions, or manuscript and publication submissions, please get in touch using the form. We will respond to your message as soon as we can.",
  "forms.contact.detailsTitle": "Address, phone and opening hours",
  "forms.contact.detailsSoon":
    "We are still confirming these details and will publish them here. Until then, please use the form — it goes to the library team.",
  "forms.contact.name": "Name",
  "forms.contact.namePh": "Your full name",
  "forms.contact.email": "Email",
  "forms.contact.emailPh": "you@example.com",
  "forms.contact.subject": "Subject",
  "forms.contact.subjectPh": "Membership, donations, events…",
  "forms.contact.message": "Message",
  "forms.contact.messagePh": "Write your message",
  "forms.contact.send": "Send message",
  "forms.contact.sending": "Sending…",
  "forms.contact.errRequired": "Please fill in your name, email address and message.",
  "forms.contact.errEmail": "Please enter a valid email address.",
  "forms.contact.sentTitle": "Thank you — message received.",
  "forms.contact.sentBody":
    "Thank you, {name}. Your message has reached the library team, who will reply to {email}.",
  "forms.contact.sendAnother": "Send another",
  "forms.contact.sendFailed":
    "Your message could not be sent. Please check your connection and try again.",
  "forms.contact.sendFailedGeneric": "Your message could not be sent. Please try again.",

  // ---- Privacy ----
  "forms.privacy.pageTitle": "Privacy Notice — Noholi Library",
  "forms.privacy.metaDesc":
    "What personal details Noholi Library keeps, who can see them, and for how long.",
  "forms.privacy.eyebrow": "How we look after your details",
  "forms.privacy.title": "Privacy Notice",
  "forms.privacy.lede":
    "A short, plain account of the personal details Noholi Library keeps, who can see them, and for how long.",
  "forms.privacy.s1Title": "What we collect",
  "forms.privacy.membershipCollect": "Membership application:",
  "forms.privacy.membershipCollectText":
    " your name, phone number, email, postal address and the photograph you upload.",
  "forms.privacy.borrowCollect": "Borrow requests:",
  "forms.privacy.borrowCollectText":
    " your NID / passport / birth certificate number, and your guarantor’s name, relationship to you, phone number, NID and address.",
  "forms.privacy.lendingCollect": "Lending records:",
  "forms.privacy.lendingCollectText":
    " the books you borrow, due and return dates, and any fines and payments.",
  "forms.privacy.s2Title": "Who sees it",
  "forms.privacy.s2Body":
    "Library staff only. Your details are never published on the website, sold or shared with anyone else. Other members cannot see them.",
  "forms.privacy.s3Title": "Why we keep it",
  "forms.privacy.s3Body":
    "Noholi lends books on trust. We need to know who has each book, how to reach them and, if a book is not returned, who stands as their guarantor. We use the details for lending accountability and nothing else.",
  "forms.privacy.s4Title": "How long we keep it",
  "forms.privacy.s4Body":
    "Rejected membership applications, and their photographs, are deleted automatically 90 days after the decision. Members’ details and lending records are kept while the membership is active, so the library can account for its books.",
  "forms.privacy.s5Title": "Questions or corrections",
  "forms.privacy.s5Body1": "Ask at the circulation desk, or ",
  "forms.privacy.s5Link": "contact the library",
  "forms.privacy.s5Body2":
    ". The desk can correct your name, NID or guarantor details; you can change your phone number and address yourself in your member profile.",
  "forms.privacy.seeAlso": "See also the ",
  "forms.privacy.rulesLink": "Library Rules & Borrowing Guidelines",

  // ---- Footer ----
  "forms.footer.privacy": "Privacy notice",
  "forms.footer.staff": "Staff login",
  "forms.footer.visit": "Visit",
  "forms.footer.visitSoon": "Address, phone and opening hours will be published here soon.",
  "forms.footer.copyright": "© 2026 Noholi Library. All rights reserved.",
  "forms.map.soon": "Directions coming soon",
};

const bn: Record<keyof typeof en, string> = {
  "forms.soon.badge": "শীঘ্রই আসছে",
  "forms.soon.title": "শীঘ্রই আসছে",
  "forms.soon.list": "শীঘ্রই আসছে — আপনার অ্যাকাউন্টের এই অংশটি এখনো চালু হয়নি।",
  "forms.soon.listBody":
    "এখান থেকে এখনো কিছু সংরক্ষণ বা পাঠানো হয় না। লাইব্রেরি প্রস্তুত হলে আমরা এটি চালু করব।",
  "forms.soon.banner":
    "শীঘ্রই আসছে — আপনার অ্যাকাউন্টের এই অংশটি এখনো চালু হয়নি। আপনি ঘুরে দেখতে পারেন, কিন্তু যা লিখবেন তা সংরক্ষণ বা পাঠানো হবে না।",
  "forms.soon.dialogBody":
    "এই সুবিধাটি এখনো চালু হয়নি, তাই কিছু সংরক্ষণ বা পাঠানো হয়নি। লাইব্রেরি প্রস্তুত হলে আমরা এটি চালু করব।",
  "forms.soon.ok": "বুঝেছি",
  "forms.soon.upload": "ডকুমেন্ট আপলোড শীঘ্রই আসছে।",
  "forms.soon.wish": "উইশলিস্টে সংরক্ষণ শীঘ্রই আসছে।",
  "forms.soon.contribute": "লেখা জমা দেওয়া শীঘ্রই আসছে — কিছু সংরক্ষণ বা পাঠানো হয়নি।",
  "forms.soon.recommend": "বই সুপারিশ করা শীঘ্রই আসছে — কিছু সংরক্ষণ বা পাঠানো হয়নি।",
  "forms.soon.reviews":
    "পাঠকদের রিভিউ শীঘ্রই আসছে। চালু না হওয়া পর্যন্ত এখানে কিছু দেখানো হবে না।",
  "forms.soon.writeReview": "রিভিউ লেখা শীঘ্রই আসছে",

  "forms.join.pageTitle": "সদস্য হোন — নহলী লাইব্রেরি",
  "forms.join.eyebrow": "সদস্যপদ",
  "forms.join.title": "নহলীর অংশ হোন।",
  "forms.join.intro": "সদস্যপদ বিনামূল্যে। চারটি সংক্ষিপ্ত ধাপ, কোনো টাকা লাগবে না।",
  "forms.join.backToSite": "ওয়েবসাইটে ফিরুন",
  "forms.join.step1": "আপনার তথ্য",
  "forms.join.step2": "ঠিকানা",
  "forms.join.step3": "ছবি",
  "forms.join.step4": "যাচাই ও জমা",
  "forms.join.stepHeading": "ধাপ {n} — {name}",
  "forms.join.name": "পূর্ণ নাম",
  "forms.join.namePh": "যেমন S. Rahman",
  "forms.join.email": "ইমেইল ঠিকানা",
  "forms.join.emailPh": "reader@noholi.org",
  "forms.join.phone": "ফোন নম্বর",
  "forms.join.phonePh": "+৮৮০ ১XXX-XXXXXX",
  "forms.join.street": "সড়কের ঠিকানা",
  "forms.join.streetPh": "যেমন House 14, Road 5, Dhanmondi",
  "forms.join.city": "শহর / এলাকা",
  "forms.join.district": "জেলা",
  "forms.join.postal": "পোস্ট কোড",
  "forms.join.optional": "(ঐচ্ছিক)",
  "forms.join.photo": "আবেদনকারীর ছবি",
  "forms.join.photoHint":
    "জেপিজি, পিএনজি বা ওয়েবপি ছবি, সর্বোচ্চ ১৫ এমবি; সরাসরি সামনের দিকে তাকানো স্পষ্ট ছবি। ঐচ্ছিক — সার্কুলেশন ডেস্কেও ছবি নিয়ে আসতে পারেন।",
  "forms.join.choosePhoto": "ছবি বেছে নিন",
  "forms.join.changePhoto": "ছবি পাল্টান",
  "forms.join.removePhoto": "সরান",
  "forms.join.photoSelected": "নির্বাচিত: {name}",
  "forms.join.freeTitle": "সদস্যপদ বিনামূল্যে।",
  "forms.join.freeBody":
    "নহলী লাইব্রেরি পারস্পরিক দায়বদ্ধতার উপর ভিত্তি করে পরিচালিত হয়। এখানে কোনো সাবস্ক্রিপশন স্তর বা সদস্যপদ ফি নেই। বিস্তারিত জানতে সার্কুলেশন ডেস্ক দেখুন।",
  "forms.join.reviewPhoto": "ছবি",
  "forms.join.photoAttached": "সংযুক্ত",
  "forms.join.photoNone": "সংযুক্ত নেই",
  "forms.join.reviewMembership": "সদস্যপদ",
  "forms.join.reviewFree": "বিনামূল্যে",
  "forms.join.consent":
    "আবেদন জমা দিয়ে আপনি সম্মত হচ্ছেন যে লাইব্রেরি স্টাফ আপনার আবেদন প্রক্রিয়াকরণের জন্য এই তথ্য ও ছবি সংরক্ষণ করতে পারবে। দেখুন",
  "forms.join.consentLink": "গোপনীয়তা নীতি",
  "forms.join.back": "পিছনে",
  "forms.join.continue": "এগিয়ে যান",
  "forms.join.submit": "আবেদন জমা দিন",
  "forms.join.sending": "পাঠানো হচ্ছে…",
  "forms.join.errName": "দয়া করে আপনার পূর্ণ নাম লিখুন।",
  "forms.join.errEmail": "দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন।",
  "forms.join.errPhone": "দয়া করে একটি সঠিক ফোন নম্বর দিন।",
  "forms.join.errStreet": "দয়া করে আপনার সড়কের ঠিকানা লিখুন।",
  "forms.join.errPhoto":
    "ছবিটি অবশ্যই জেপিজি, পিএনজি বা ওয়েবপি ফরম্যাটে এবং ১৫ এমবি-এর কম হতে হবে।",
  "forms.join.doneTitle": "আবেদন গৃহীত হয়েছে।",
  "forms.join.doneThanks": "ধন্যবাদ, {name}। আপনার আবেদন গৃহীত হয়েছে।",
  "forms.join.doneRef": "আপনার রেফারেন্স {ref}।",
  "forms.join.donePhone":
    "সার্কুলেশন ডেস্কে যাচাইয়ের ব্যবস্থা করতে লাইব্রেরি আপনাকে {phone} নম্বরে ফোন করবে।",
  "forms.join.donePhotoFailed":
    "আপনার ছবিটি আপলোড করা যায়নি, তাই দয়া করে সার্কুলেশন ডেস্কে একটি ছবি নিয়ে আসুন।",
  "forms.join.refLabel": "রেফারেন্স",
  "forms.join.browse": "লাইব্রেরি ব্রাউজ করুন",
  "forms.join.sendFailed": "আবেদনটি পাঠানো যায়নি। দয়া করে সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",

  "forms.intake.throttled": "আপনি আজ এই ফর্মটি ইতিমধ্যে কয়েকবার পাঠিয়েছেন। আমরা যোগাযোগ করব।",
  "forms.intake.photoUnreadable":
    "ফাইলটি ছবি হিসেবে পড়া যায়নি। দয়া করে একটি জেপিজি বা পিএনজি ছবি বেছে নিন।",
  "forms.intake.photoFailed": "ছবিটি প্রস্তুত করা যায়নি। দয়া করে অন্য একটি ফাইল চেষ্টা করুন।",

  "forms.contact.pageTitle": "যোগাযোগ — নহলী লাইব্রেরি",
  "forms.contact.eyebrow": "Contact · যোগাযোগ",
  "forms.contact.title": "আমাদের লিখুন।",
  "forms.contact.intro":
    "জিজ্ঞাসা, পাঠকক্ষ সংরক্ষণ, সদস্যপদ প্রশ্ন বা পাণ্ডুলিপি ও প্রকাশনা জমা দেওয়ার জন্য ফর্মটি ব্যবহার করে যোগাযোগ করুন। আমরা যত দ্রুত সম্ভব আপনার বার্তার উত্তর দেব।",
  "forms.contact.detailsTitle": "ঠিকানা, ফোন ও খোলার সময়",
  "forms.contact.detailsSoon":
    "এই তথ্যগুলো আমরা এখনো নিশ্চিত করছি, নিশ্চিত হলে এখানে প্রকাশ করা হবে। ততদিন দয়া করে ফর্মটি ব্যবহার করুন — এটি লাইব্রেরি টিমের কাছে যায়।",
  "forms.contact.name": "নাম",
  "forms.contact.namePh": "আপনার পূর্ণ নাম",
  "forms.contact.email": "ইমেইল",
  "forms.contact.emailPh": "reader@noholi.org",
  "forms.contact.subject": "বিষয়",
  "forms.contact.subjectPh": "সদস্যপদ, অনুদান, অনুষ্ঠান…",
  "forms.contact.message": "বার্তা",
  "forms.contact.messagePh": "আপনার বার্তা লিখুন",
  "forms.contact.send": "বার্তা পাঠান",
  "forms.contact.sending": "পাঠানো হচ্ছে…",
  "forms.contact.errRequired": "দয়া করে আপনার নাম, ইমেইল ঠিকানা ও বার্তা পূরণ করুন।",
  "forms.contact.errEmail": "দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন।",
  "forms.contact.sentTitle": "ধন্যবাদ — বার্তা পৌঁছেছে।",
  "forms.contact.sentBody":
    "ধন্যবাদ, {name}। আপনার বার্তা লাইব্রেরি টিমের কাছে পৌঁছেছে, তারা {email}-এ উত্তর দেবে।",
  "forms.contact.sendAnother": "আরেকটি পাঠান",
  "forms.contact.sendFailed":
    "আপনার বার্তা পাঠানো যায়নি। দয়া করে সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
  "forms.contact.sendFailedGeneric": "আপনার বার্তা পাঠানো যায়নি। দয়া করে আবার চেষ্টা করুন।",

  "forms.privacy.pageTitle": "গোপনীয়তা নীতি — নহলী লাইব্রেরি",
  "forms.privacy.metaDesc":
    "নহলী লাইব্রেরি কোন ব্যক্তিগত তথ্য সংরক্ষণ করে, কে তা দেখতে পারে এবং কতদিন রাখা হয়।",
  "forms.privacy.eyebrow": "আমরা কীভাবে আপনার তথ্যের যত্ন নিই",
  "forms.privacy.title": "গোপনীয়তা নীতি",
  "forms.privacy.lede":
    "নহলী লাইব্রেরি কোন ব্যক্তিগত তথ্য সংরক্ষণ করে, কে তা দেখতে পারে এবং কতদিন রাখা হয় তার একটি সংক্ষিপ্ত, সহজ বিবরণ।",
  "forms.privacy.s1Title": "আমরা কী সংগ্রহ করি",
  "forms.privacy.membershipCollect": "সদস্যপদ আবেদন:",
  "forms.privacy.membershipCollectText":
    " আপনার নাম, ফোন নম্বর, ইমেইল, ডাকযোগ ঠিকানা এবং আপনার আপলোড করা ছবি।",
  "forms.privacy.borrowCollect": "ধারের অনুরোধ:",
  "forms.privacy.borrowCollectText":
    " আপনার এনআইডি / পাসপোর্ট / জন্ম নিবন্ধন নম্বর, এবং আপনার জামিনদারের নাম, সম্পর্ক, ফোন নম্বর, এনআইডি ও ঠিকানা।",
  "forms.privacy.lendingCollect": "ধারের রেকর্ড:",
  "forms.privacy.lendingCollectText":
    " আপনার ধার নেওয়া বই, ফেরতের তারিখ, এবং যেকোনো জরিমানা ও পরিশোধ।",
  "forms.privacy.s2Title": "কে এটি দেখতে পারে",
  "forms.privacy.s2Body":
    "শুধুমাত্র লাইব্রেরি স্টাফ। আপনার তথ্য কখনো ওয়েবসাইটে প্রকাশ করা হয় না, বিক্রি করা হয় না বা অন্য কারো সাথে শেয়ার করা হয় না। অন্য সদস্যরাও এগুলো দেখতে পারেন না।",
  "forms.privacy.s3Title": "আমরা কেন এটি রাখি",
  "forms.privacy.s3Body":
    "নহলী আস্থার ভিত্তিতে বই ধার দেয়। কার কাছে কোন বই আছে, তাদের কীভাবে যোগাযোগ করতে হবে এবং বই ফেরত না দিলে কে জামিনদার — এসব জানা আমাদের প্রয়োজন। আমরা শুধু ধার-প্রদানের দায়বদ্ধতার জন্য এই তথ্য ব্যবহার করি, অন্য কোনো কাজে নয়।",
  "forms.privacy.s4Title": "আমরা কতদিন এটি রাখি",
  "forms.privacy.s4Body":
    "প্রত্যাখ্যাত সদস্যপদ আবেদন ও তাদের ছবি সিদ্ধান্তের ৯০ দিন পর স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়। সদস্যপদ সক্রিয় থাকাকালীন সদস্যের তথ্য ও ধারের রেকর্ড রাখা হয়, যাতে লাইব্রেরি তার বইয়ের হিসাব রাখতে পারে।",
  "forms.privacy.s5Title": "প্রশ্ন বা সংশোধন",
  "forms.privacy.s5Body1": "সার্কুলেশন ডেস্কে জিজ্ঞাসা করুন, অথবা ",
  "forms.privacy.s5Link": "লাইব্রেরিতে যোগাযোগ করুন",
  "forms.privacy.s5Body2":
    "। ডেস্ক আপনার নাম, এনআইডি বা জামিনদারের তথ্য সংশোধন করতে পারে; আপনি নিজে আপনার সদস্য প্রোফাইলে ফোন নম্বর ও ঠিকানা পরিবর্তন করতে পারেন।",
  "forms.privacy.seeAlso": "আরও দেখুন ",
  "forms.privacy.rulesLink": "লাইব্রেরির নিয়ম ও ধার নেওয়ার নির্দেশিকা",

  "forms.footer.privacy": "গোপনীয়তা নীতি",
  "forms.footer.staff": "স্টাফ লগ ইন",
  "forms.footer.visit": "ঠিকানা",
  "forms.footer.visitSoon": "ঠিকানা, ফোন ও খোলার সময় শীঘ্রই এখানে প্রকাশ করা হবে।",
  "forms.footer.copyright": "© ২০২৬ নহলী লাইব্রেরি। সর্বস্বত্ব সংরক্ষিত।",
  "forms.map.soon": "পথনির্দেশ শীঘ্রই আসছে",
};

export const forms = { en, bn };
