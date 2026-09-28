import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ComingSoon, SOON_REQUEST, Status, useSubmission } from './memberStudio.jsx';
import './WishlistBooks.css';

const REQUIRED = [
  ['book-title', 'book title'],
  ['author-name', 'author name'],
];

// Generated from Figma frame "Noholi Library — Book Wishlist & Shelf Requests (After login)" (126:5346) by tools/gen_member.py, then hand-edited.
export default function WishlistBooks() {
  const { member } = useAuth();
  // Wishlists and acquisition requests have no backend yet: honest "coming soon" states.
  const { status, submit } = useSubmission(REQUIRED, SOON_REQUEST, { ok: false });
  const onSubmit = (e) => submit(e);

  return (
    <div className="wlbooks">
      <section className="wlbooks-main">
        <div className="wlbooks-main-box">
          <div className="wlbooks-streamlined-breadcrumb-strip">
            <div className="wlbooks-streamlined-breadcrumb-strip-box">
              <div className="wlbooks-streamlined-breadcrumb-strip-box-box">
                <Link to="/" className="wlbooks-streamlined-breadcrumb-strip-box-box-box">HOME</Link>
                <div className="wlbooks-streamlined-breadcrumb-strip-box-box-box-2">
                  <span className="wlbooks-streamlined-breadcrumb-strip-box-box-box-2-text">/</span>
                </div>
                <Link to="/wishlist/books" className="wlbooks-streamlined-breadcrumb-strip-box-box-box">WISHLIST</Link>
                <div className="wlbooks-streamlined-breadcrumb-strip-box-box-box-2">
                  <span className="wlbooks-streamlined-breadcrumb-strip-box-box-box-2-text">/</span>
                </div>
                <div className="wlbooks-streamlined-breadcrumb-strip-box-box-box-2">
                  <span className="wlbooks-books-wishlist">BOOKS WISHLIST (বইয়ের উইশলিস্ট)</span>
                </div>
              </div>
              <div className="wlbooks-streamlined-breadcrumb-strip-box-box-2">
                <span className="wlbooks-streamlined-breadcrumb-strip-box-box-2-text">PATRON ID: #{member?.cardNumber}</span>
              </div>
            </div>
          </div>
          <section className="wlbooks-page-header">
            <div className="wlbooks-page-header-box">
              <div className="wlbooks-page-header-box-box">
                <div className="wlbooks-page-header-box-box-box">
                  <img className="wlbooks-page-header-box-box-box-box" src="/svg/container-1ejuq2p.svg" alt="" width="11" height="14" />
                  <div className="wlbooks-page-header-box-box-box-box-2">
                    <span className="wlbooks-patron-ledger">PATRON LEDGER • সংরক্ষিত ও প্রস্তাবিত তালিকা</span>
                  </div>
                </div>
                <h1 className="wlbooks-heading-1">Books Wishlist & Acquisitions</h1>
                <div className="wlbooks-page-header-box-box-box-2">
                  <span className="wlbooks-page-header-box-box-box-2-text">বইয়ের উইশলিস্ট ও লাইব্রেরির জন্য নতুন বই সংগ্রহের আবেদন</span>
                </div>
                <div className="wlbooks-page-header-box-box-box-3">
                  <span className="wlbooks-page-header-box-box-box-3-text">Manage your saved physical stacks and reading room books, or recommend new titles for the accession{' '}<br className="soft-br" />committee to purchase in the upcoming acquisition cycle.</span>
                </div>
              </div>
              <div className="wlbooks-page-header-box-box-2">
                <div className="wlbooks-background-border">
                  <div className="wlbooks-background-border-box">
                    <span className="wlbooks-background-border-box-text">0</span>
                  </div>
                  <span className="wlbooks-background-border-text">SAVED BOOKS</span>
                </div>
                <div className="wlbooks-background-border">
                  <div className="wlbooks-background-border-box-2">
                    <span className="wlbooks-background-border-box-2-text">0</span>
                  </div>
                  <span className="wlbooks-background-border-text">PURCHASE REQUESTS</span>
                </div>
              </div>
            </div>
          </section>
          <div className="wlbooks-main-dual-section">
            <div className="wlbooks-main-dual-section-box">
              <div className="wlbooks-left-column-my-saved-wishlist-bo">
                <div className="wlbooks-horizontalborder">
                  <p className="wlbooks-paragraph">
                    <span className="wlbooks-heading-2">My Saved Wishlist Books</span>
                    <span className="wlbooks-paragraph-text">ব্যক্তিগত সংরক্ষিত গ্রন্থতালিকা (শীঘ্রই আসছে)</span>
                  </p>
                  <img className="wlbooks-horizontalborder-box" src="/svg/container-1h2qo7f.svg" alt="" width="18" height="22" />
                </div>
                <div className="wlbooks-simplified-book-cards-list">
                  <ComingSoon
                    title="Saved books are coming soon"
                    action={<Link to="/catalog" className="studio-soon-action">BROWSE THE CATALOGUE →</Link>}
                  >
                    You will be able to keep a list of books to borrow later. For now, open a book in the catalogue and use
                    “Borrow” to have it held at the circulation desk.
                  </ComingSoon>
                </div>
              </div>
              <div className="wlbooks-right-column-acquisition-recomme">
                <div className="wlbooks-recommendation-card">
                  <div className="wlbooks-horizontalborder">
                    <div className="wlbooks-horizontalborder-box-2">
                      <span className="wlbooks-horizontalborder-box-2-text">ACQUISITION SUGGESTION DESK</span>
                      <h2 className="wlbooks-heading-2-2">Recommend a Book for Library<br />Acquisition</h2>
                      <div className="wlbooks-horizontalborder-box-2-box">
                        <span className="wlbooks-horizontalborder-box-2-box-text">লাইব্রেরির জন্য নতুন বই ক্রয়ের প্রস্তাব বা রিকোয়েস্ট</span>
                      </div>
                    </div>
                    <img className="wlbooks-horizontalborder-box-3" src="/svg/container-1dr4kas.svg" alt="" width="20" height="20" />
                  </div>
                  <div className="wlbooks-recommendation-card-box">
                    <span className="wlbooks-if-a-bengali-literary-work-histo">If a Bengali literary work, historical folio, or South Asian{' '}<br className="soft-br" />scholarly title is missing from our stacks, propose it below. Our{' '}<br className="soft-br" />bibliographic team considers patron recommendations for{' '}<br className="soft-br" />monthly acquisition purchases.</span>
                  </div>
                  <div className="wlbooks-form">
                    <form className="wlbooks-form-2" onSubmit={onSubmit} noValidate>
                      <div className="wlbooks-form-2-box">
                        <label className="wlbooks-label" htmlFor="wlbooks-book-title">BOOK TITLE (LATIN / TRANSLITERATED OR BENGALI) *</label>
                        <input id="wlbooks-book-title" name="book-title" required className="wlbooks-input" placeholder="e.g., Jagadish Chandra Bose: Life and Work / কপালকুণ্ডলা" />
                      </div>
                      <div className="wlbooks-form-2-box">
                        <label className="wlbooks-label" htmlFor="wlbooks-author-name">AUTHOR NAME *</label>
                        <input id="wlbooks-author-name" name="author-name" required className="wlbooks-input-2" placeholder="e.g., Patrick Geddes / বঙ্কিমচন্দ্র চট্টোপাধ্যায়" />
                      </div>
                      <div className="wlbooks-form-2-box-2">
                        <div className="wlbooks-form-2-box-2-box">
                          <label className="wlbooks-label" htmlFor="wlbooks-publisher-year">PUBLISHER / YEAR (OPTIONAL)</label>
                          <input id="wlbooks-publisher-year" name="publisher-year" className="wlbooks-input-3" placeholder="e.g., Longmans, 1920" />
                        </div>
                        <div className="wlbooks-form-2-box-2-box">
                          <label className="wlbooks-label" htmlFor="wlbooks-isbn-ref-link">ISBN / REF LINK (OPTIONAL)</label>
                          <input id="wlbooks-isbn-ref-link" name="isbn-ref-link" className="wlbooks-input-4" placeholder="ISBN or catalog URL" />
                        </div>
                      </div>
                      <div className="wlbooks-form-2-box-3">
                        <label className="wlbooks-label" htmlFor="wlbooks-why-should-the-library-acquire-t">WHY SHOULD THE LIBRARY ACQUIRE THIS BOOK? / REASON OR{' '}<br className="soft-br" />PATRON NOTE</label>
                        <textarea id="wlbooks-why-should-the-library-acquire-t" name="why-should-the-library-acquire-t" className="wlbooks-textarea" placeholder={"Explain why this work would be valuable to scholars and \nreaders visiting Noholi Library..."} />
                      </div>
                      <div className="wlbooks-form-2-box-4">
                        <button type="submit" className="wlbooks-form-2-box-4-box">
                          <div className="wlbooks-form-2-box-4-box-box">
                            <span className="wlbooks-submit-book-acquisition-request">SUBMIT BOOK ACQUISITION REQUEST / নতুন বই ক্রয়ের আবেদন জমা দিন{' '}<br className="soft-br" />→</span>
                          </div>
                        </button>
                      </div>
                      <Status status={status} />
                    </form>
                  </div>
                </div>
                <div className="wlbooks-previous-acquisition-requests-st">
                  <div className="wlbooks-horizontalborder">
                    <p className="wlbooks-paragraph-2">
                      <span className="wlbooks-heading-3-6">My Acquisition Requests</span>
                      <span className="wlbooks-paragraph-2-text">পূর্ববর্তী ক্রয়ের আবেদনের অবস্থা</span>
                    </p>
                    <img className="wlbooks-horizontalborder-box-4" src="/svg/container-j4c9ic.svg" alt="" width="15" height="17" />
                  </div>
                  <div className="wlbooks-previous-acquisition-requests-st-box">
                    <ComingSoon title="No acquisition requests yet">
                      Suggesting books online is coming soon. Until then, tell the circulation desk which titles you would like the library to buy.
                    </ComingSoon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
