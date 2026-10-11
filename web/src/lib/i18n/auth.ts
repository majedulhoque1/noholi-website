// Login / session / password strings. Keys are namespaced ("auth.*") so modules never collide.
// Bangla reused from web-legacy/src/i18n/bn.js. The wave-1 auth agent adds screen keys here.
const en = {
  "auth.genericLoginError": "Incorrect membership number or password.",
  "auth.staffLoginError": "Staff accounts use Noholi OS.",
  "auth.enterCredentials": "Enter your membership number or email and your password.",
  "supabaseLib.networkError":
    "Couldn't reach the Noholi server. Check your internet connection and try again.",
  "supabaseLib.genericError": "Something went wrong. Please try again.",
};

const bn: Record<keyof typeof en, string> = {
  "auth.genericLoginError": "সদস্য নম্বর বা পাসওয়ার্ড সঠিক নয়।",
  "auth.staffLoginError": "স্টাফ অ্যাকাউন্ট Noholi OS ব্যবহার করে।",
  "auth.enterCredentials": "আপনার সদস্য নম্বর বা ইমেইল এবং পাসওয়ার্ড দিন।",
  "supabaseLib.networkError":
    "নহলী সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
  "supabaseLib.genericError": "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
};

export const auth = { en, bn };
