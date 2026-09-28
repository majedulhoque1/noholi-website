import { startTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import './MemberDashboard.css';

// Generated from Figma frame "Noholi Library — Member Dashboard" (126:2) by tools/gen_member.py, then hand-edited.
export default function MemberDashboard() {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const onLogOut = () => {
    // one transition: the route change and sign-out render together, so this
    // member-only page never renders logged-out (which would bounce to /login)
    startTransition(() => {
      navigate('/');
      logOut();
    });
  };

  return (
    <div className="mdash">
      <div className="mdash-breadcrumb">
        <div className="mdash-breadcrumb-box">
          <Link to="/" className="mdash-breadcrumb-box-box">HOME</Link>
          <div className="mdash-breadcrumb-box-box-2">
            <span className="mdash-breadcrumb-box-box-2-text">/</span>
          </div>
          <div className="mdash-breadcrumb-box-box-2">
            <span className="mdash-breadcrumb-box-box-2-text-2">MEMBER DASHBOARD</span>
          </div>
        </div>
      </div>
      <section className="mdash-main">
        <div className="mdash-main-box">
          <div className="mdash-member-greeting-profile-header">
            <div className="mdash-member-greeting-profile-header-box">
              <div className="mdash-member-greeting-profile-header-box-box">
                <span className="mdash-member-greeting-profile-header-box-box-text">READER ACCOUNT</span>
              </div>
              <h1 className="mdash-heading-1">Welcome, [Member Name]</h1>
              <p className="mdash-paragraph">
                <span className="mdash-paragraph-text">{"Card ID: "}</span>
                <span className="mdash-paragraph-text-2">[NL-READER-XXXX]</span>
                <span className="mdash-paragraph-text">{" \u00a0\u2022\u00a0 Status: "}<span className="mdash-span">Active Reader</span></span>
              </p>
            </div>
            <div className="mdash-member-greeting-profile-header-box-2">
              <button type="button" className="mdash-member-greeting-profile-header-box-2-box" onClick={onLogOut}>
                <img className="mdash-member-greeting-profile-header-box-2-box-box" src="/svg/container-1n0za15.svg" alt="" width="12" height="12" />
                <span className="mdash-member-greeting-profile-header-box-2-box-text">LOG OUT</span>
              </button>
            </div>
          </div>
          <div className="mdash-layout-grid-main-content-sidebar">
            <div className="mdash-left-8-cols-my-books-reservation">
              <section className="mdash-section-1-my-books">
                <div className="mdash-horizontalborder">
                  <h2 className="mdash-heading-2">
                    <span className="mdash-heading-2-text">{"My Books "}</span>
                    <span className="mdash-heading-2-text-2">ধার নেওয়া বই</span>
                  </h2>
                  <span className="mdash-horizontalborder-text">2 VOLUMES ACTIVE</span>
                </div>
                <div className="mdash-books-list">
                  <div className="mdash-book-1">
                    <div className="mdash-book-1-box">
                      <div className="mdash-book-1-box-box">
                        <h3 className="mdash-heading-3">The River Path</h3>
                        <div className="mdash-book-1-box-box-box">
                          <span className="mdash-book-1-box-box-box-text">নদীর পথ</span>
                        </div>
                      </div>
                      <div className="mdash-book-1-box-box-2">
                        <span className="mdash-book-1-box-box-2-text">{"Borrowed: "}<span className="mdash-span">[Borrowed Date]</span>{" \u00a0|\u00a0 Due: "}<span className="mdash-span">[Due Date]</span></span>
                      </div>
                    </div>
                    <div className="mdash-background-border">
                      <span className="mdash-background-border-text">Due in 5 days</span>
                    </div>
                  </div>
                  <div className="mdash-book-2">
                    <div className="mdash-book-2-box">
                      <div className="mdash-book-2-box-box">
                        <h3 className="mdash-heading-3">Padma River Boatman</h3>
                        <div className="mdash-book-2-box-box-box">
                          <span className="mdash-book-2-box-box-box-text">পদ্মা নদীর মাঝি</span>
                        </div>
                      </div>
                      <div className="mdash-book-2-box-box-2">
                        <span className="mdash-book-2-box-box-2-text">{"Borrowed: "}<span className="mdash-span">[Borrowed Date]</span>{" \u00a0|\u00a0 Due: "}<span className="mdash-span">[Due Date]</span></span>
                      </div>
                    </div>
                    <div className="mdash-overlay-border">
                      <span className="mdash-overlay-border-text">Overdue</span>
                    </div>
                  </div>
                  <div className="mdash-book-3">
                    <div className="mdash-book-3-box">
                      <div className="mdash-book-3-box-box">
                        <h3 className="mdash-heading-3">Selected Poems of Jibanananda Das</h3>
                        <div className="mdash-book-3-box-box-box">
                          <span className="mdash-book-3-box-box-box-text">জীবনানন্দ দাশের কবিতা</span>
                        </div>
                      </div>
                      <div className="mdash-book-3-box-box-2">
                        <span className="mdash-book-3-box-box-2-text">{"Borrowed: "}<span className="mdash-span">[Borrowed Date]</span>{" \u00a0|\u00a0 Due: "}<span className="mdash-span">[Due Date]</span></span>
                      </div>
                    </div>
                    <div className="mdash-background-border">
                      <span className="mdash-background-border-text">Due in 12 days</span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="mdash-section-3-reservations">
                <div className="mdash-horizontalborder">
                  <h2 className="mdash-heading-2-2">
                    <span className="mdash-heading-2-2-text">{"Reservations "}</span>
                    <span className="mdash-heading-2-2-text-2">সংরক্ষণ</span>
                  </h2>
                  <span className="mdash-horizontalborder-text-2">1 VOLUME PENDING</span>
                </div>
                <div className="mdash-background-border-2">
                  <div className="mdash-background-border-2-box">
                    <div className="mdash-background-border-2-box-box">
                      <h3 className="mdash-heading-3">A Heritage of Words</h3>
                      <div className="mdash-background-border-2-box-box-box">
                        <span className="mdash-background-border-2-box-box-box-text">শব্দের ঐতিহ্য</span>
                      </div>
                    </div>
                    <div className="mdash-background-border-2-box-box-2">
                      <span className="mdash-background-border-2-box-box-2-text">{"Reserved: "}<span className="mdash-span">[Reserved Date]</span>{" \u00a0|\u00a0 Hold Shelf: "}<span className="mdash-span">Circulation Desk</span></span>
                    </div>
                  </div>
                  <div className="mdash-border">
                    <span className="mdash-border-text">Awaiting pickup</span>
                  </div>
                </div>
              </section>
              <div className="mdash-left-8-cols-my-books-reservation-box">
                <div className="mdash-horizontalborder">
                  <h2 className="mdash-heading-2-3">
                    <span className="mdash-heading-2-3-text">{"Reading History "}</span>
                    <span className="mdash-heading-2-3-text-2">পঠিত গ্রন্থাবলি</span>
                  </h2>
                  <span className="mdash-horizontalborder-text-3">5 VOLUMES COMPLETED</span>
                </div>
                <div className="mdash-left-8-cols-my-books-reservation-box-box">
                  <div className="mdash-book-1">
                    <div className="mdash-book-1-box-2">
                      <div className="mdash-book-1-box-2-box">
                        <h3 className="mdash-heading-3">The Solitary Hour</h3>
                        <div className="mdash-book-1-box-2-box-box">
                          <span className="mdash-book-1-box-2-box-box-text">নিঃসঙ্গ প্রহর</span>
                        </div>
                      </div>
                      <p className="mdash-paragraph">
                        <span className="mdash-paragraph-text-3">{"Returned: "}<span className="mdash-span">14 Feb 2026</span>{" \u00a0\u2022\u00a0 Loaned: "}<span className="mdash-span">24 Jan 2026</span>{" \u00a0\u2022\u00a0 Accession No: "}</span>
                        <span className="mdash-paragraph-text-4">NL-2024-0312</span>
                      </p>
                    </div>
                    <div className="mdash-book-1-box-3">
                      <div className="mdash-background-border">
                        <span className="mdash-background-border-text-2">Returned</span>
                      </div>
                      <Link to="/books/the-solitary-hour" className="mdash-book-1-box-3-box">View Monograph →</Link>
                    </div>
                  </div>
                  <div className="mdash-book-2">
                    <div className="mdash-book-2-box-2">
                      <div className="mdash-book-2-box-2-box">
                        <h3 className="mdash-heading-3">Songs of the Delta</h3>
                        <div className="mdash-book-2-box-2-box-box">
                          <span className="mdash-book-2-box-2-box-box-text">বদ্বীপের গান</span>
                        </div>
                      </div>
                      <p className="mdash-paragraph">
                        <span className="mdash-paragraph-text-3">{"Returned: "}<span className="mdash-span">02 Jan 2026</span>{" \u00a0\u2022\u00a0 Loaned: "}<span className="mdash-span">12 Dec 2025</span>{" \u00a0\u2022\u00a0 Accession No: "}</span>
                        <span className="mdash-paragraph-text-4">NL-2023-0884</span>
                      </p>
                    </div>
                    <div className="mdash-book-2-box-3">
                      <div className="mdash-background-border">
                        <span className="mdash-background-border-text-2">Returned</span>
                      </div>
                      <Link to="/books/songs-of-the-delta" className="mdash-book-2-box-3-box">View Monograph →</Link>
                    </div>
                  </div>
                  <div className="mdash-book-3">
                    <div className="mdash-book-3-box-2">
                      <div className="mdash-book-3-box-2-box">
                        <h3 className="mdash-heading-3">Echoes of the Green Shore</h3>
                        <div className="mdash-book-3-box-2-box-box">
                          <span className="mdash-book-3-box-2-box-box-text">সবুজ তীরের প্রতিধ্বনি</span>
                        </div>
                      </div>
                      <p className="mdash-paragraph">
                        <span className="mdash-paragraph-text-3">{"Returned: "}<span className="mdash-span">18 Nov 2025</span>{" \u00a0\u2022\u00a0 Loaned: "}<span className="mdash-span">28 Oct 2025</span>{" \u00a0\u2022\u00a0 Accession No: "}</span>
                        <span className="mdash-paragraph-text-4">NL-2023-0519</span>
                      </p>
                    </div>
                    <div className="mdash-book-3-box-3">
                      <div className="mdash-background-border">
                        <span className="mdash-background-border-text-2">Returned</span>
                      </div>
                      <Link to="/books/echoes-of-the-green-shore" className="mdash-book-3-box-3-box">View Monograph →</Link>
                    </div>
                  </div>
                </div>
                <div className="mdash-circulation-archive-link">
                  <Link to="/catalog" className="mdash-circulation-archive-link-box">View Complete Circulation Archive (2024–2026) →</Link>
                  <div className="mdash-circulation-archive-link-box-2">
                    <span className="mdash-circulation-archive-link-box-2-text">Archival Records</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mdash-right-4-cols-section-2-notice">
              <section className="mdash-section-2-fines">
                <div className="mdash-horizontalborder-2">
                  <h2 className="mdash-heading-2-4">
                    <span className="mdash-heading-2-4-text">{"Fines "}</span>
                    <span className="mdash-heading-2-4-text-2">জরিমানা</span>
                  </h2>
                  <span className="mdash-horizontalborder-2-text">ACCOUNT NOTE</span>
                </div>
                <div className="mdash-minimal-fine-list">
                  <div className="mdash-minimal-fine-list-box">
                    <div className="mdash-minimal-fine-list-box-box">
                      <span className="mdash-minimal-fine-list-box-box-text">৳20</span>
                    </div>
                    <div className="mdash-minimal-fine-list-box-box">
                      <span className="mdash-minimal-fine-list-box-box-text-2">OUTSTANDING</span>
                    </div>
                  </div>
                  <div className="mdash-minimal-fine-list-box-2">
                    <span className="mdash-overdue-padma-river-boatman">Overdue: Padma River Boatman</span>
                  </div>
                  <div className="mdash-minimal-fine-list-box-2">
                    <span className="mdash-please-settle-fine-during-book-r">Please settle fine during book return at the desk.</span>
                  </div>
                </div>
                <div className="mdash-horizontalborder-3">
                  <span className="mdash-horizontalborder-3-text">Fines must be settled in person with the duty librarian. No{' '}<br className="soft-br" />online payments.</span>
                </div>
              </section>
              <div className="mdash-account-notice-desk-instructions">
                <h3 className="mdash-heading-3-2">Member Support</h3>
                <div className="mdash-account-notice-desk-instructions-box">
                  <span className="mdash-for-full-account-changes-contact">For full account changes, contact the circulation desk.</span>
                </div>
                <div className="mdash-horizontalborder-4">
                  <div className="mdash-horizontalborder-4-box">
                    <span className="mdash-desk-inquiries-phone">{"Desk Inquiries: "}<span className="mdash-span">[Phone]</span></span>
                  </div>
                  <div className="mdash-horizontalborder-4-box">
                    <span className="mdash-email-desk-email">{"Email Desk: "}<span className="mdash-span">[Email]</span></span>
                  </div>
                </div>
              </div>
              <div className="mdash-borrowing-guidance-note">
                <div className="mdash-borrowing-guidance-note-box">
                  <span className="mdash-renewals-holds">Renewals & Holds</span>
                </div>
                <span className="mdash-borrowing-guidance-note-text">Volumes may be renewed provided there are no pending reserve{' '}<br className="soft-br" />slips logged by other patrons. Standard loan terms apply.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
