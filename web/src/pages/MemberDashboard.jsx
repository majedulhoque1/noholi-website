import { startTransition, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { supabase, describeError } from '../lib/supabase.js';
import { bookPath } from '../lib/books.js';
import { formatDhaka, todayDhaka } from '../lib/dhakaDate.js';
import './MemberDashboard.css';

const taka = (n) => `৳${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const day = (iso) => (iso ? formatDhaka(iso, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/** Whole days from Dhaka "today" to a due date (negative = overdue). */
const daysUntil = (today, iso) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
const bookLink = (id, title) => bookPath({ id, title });
const HISTORY_PREVIEW = 3;

/** Everything the dashboard shows, read with the member's own RLS (CONTRACT.md §2–3). */
async function loadDashboard(memberId) {
  const [loans, requests, fines, payments, settings] = await Promise.all([
    supabase.from('loan_status_v')
      .select('id,book_id,book_title,issued_date,due_date,return_date,status,derived_status,days_overdue,fine_amount,fine_is_accruing,fine_status,fine_balance,renewal_count')
      .eq('member_id', memberId)
      .order('due_date', { ascending: true }),
    supabase.from('borrow_requests')
      .select('id,book_id,book_title,pickup_date,expires_at,status,reason,created_at,decided_at,loan_id')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('fines')
      .select('id,loan_id,kind,days_overdue,amount,amount_paid,status,created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false }),
    supabase.from('fine_payments')
      .select('id,fine_id,amount,method,paid_at')
      .order('paid_at', { ascending: false })
      .limit(5),
    supabase.rpc('get_public_settings'),
  ]);
  for (const r of [loans, requests, fines, payments, settings]) if (r.error) throw r.error;
  return { loans: loans.data, requests: requests.data, fines: fines.data, payments: payments.data, settings: settings.data };
}

// Generated from Figma frame "Noholi Library — Member Dashboard" (126:2) by tools/gen_member.py, then hand-edited.
// Real data only: loans (loan_status_v), holds (borrow_requests), fines/payments, counts (member_summary_v).
export default function MemberDashboard() {
  const { logOut, memberRow, refresh } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null); // { ok, text } after renew / cancel
  const [working, setWorking] = useState(''); // id of the loan/request being changed
  const [showAllHistory, setShowAllHistory] = useState(false);

  const memberId = memberRow?.id;
  const load = useCallback(async () => {
    if (!memberId) return;
    try {
      setData(await loadDashboard(memberId));
      setError('');
    } catch (err) {
      setError(describeError(err));
    }
  }, [memberId]);
  useEffect(() => { load(); }, [load]);

  const onLogOut = () => {
    // one transition: the route change and sign-out render together, so this
    // member-only page never renders logged-out (which would bounce to /login)
    startTransition(() => {
      navigate('/');
      logOut();
    });
  };

  const act = async (id, rpc, args, okText) => {
    if (working) return;
    setWorking(id);
    setNotice(null);
    const { data: row, error: err } = await supabase.rpc(rpc, args);
    setWorking('');
    if (err) {
      setNotice({ ok: false, id, text: describeError(err) });
      return;
    }
    setNotice({ ok: true, id, text: okText(row) });
    await Promise.all([load(), refresh()]);
  };
  const renew = (loan) => act(loan.id, 'renew_my_loan', { p_loan_id: loan.id },
    (row) => `Renewed “${loan.book_title}”. It is now due on ${day(row.due_date)}.`);
  const cancel = (req) => act(req.id, 'cancel_my_request', { p_request_id: req.id },
    () => `Request ${req.id} for “${req.book_title}” was cancelled and the copy released.`);

  const m = memberRow || {};
  const s = data?.settings || {};
  const today = s.today;
  const loans = data?.loans || [];
  const active = loans.filter((l) => l.status === 'Active');
  const history = loans
    .filter((l) => l.status === 'Returned' || l.status === 'Lost')
    .sort((a, b) => String(b.return_date || b.due_date).localeCompare(String(a.return_date || a.due_date)));
  const shownHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW);
  const requests = data?.requests || [];
  const pending = requests.filter((r) => r.status === 'Pending');
  // recently closed requests (not issued) stay visible for 30 days so a rejection reason is seen
  const recentClosed = requests.filter((r) => ['Rejected', 'Expired', 'Cancelled'].includes(r.status)
    && today && daysUntil(todayDhaka(new Date(r.decided_at || r.created_at)), today) <= 30).slice(0, 3);
  const holds = [...pending, ...recentClosed];
  const openFines = (data?.fines || []).filter((f) => f.status === 'Unpaid' || f.status === 'Partially Paid');
  const accruing = active.filter((l) => l.fine_is_accruing && Number(l.fine_amount) > 0);
  const titleOfLoan = Object.fromEntries(loans.map((l) => [l.id, l.book_title]));
  const fineById = Object.fromEntries((data?.fines || []).map((f) => [f.id, f]));
  const outstanding = Number(m.outstanding_fines || 0) + Number(m.accruing_fines || 0);
  const lastPayment = data?.payments?.[0];

  const renewalsAllowed = s.renewals_allowed ?? 1;
  const blocked = m.status !== 'Active' || Number(m.overdue_loans || 0) > 0 || Number(m.outstanding_fines || 0) > 0;
  /** Why a loan can't be renewed online (null = the Renew button is offered). */
  const renewBlock = (l) => {
    if (l.derived_status === 'Overdue') return 'Overdue: please return it';
    if ((l.renewal_count || 0) >= renewalsAllowed) return renewalsAllowed ? 'Already renewed' : 'Renew at the desk';
    if (blocked) return 'Renewal paused';
    return null;
  };
  const dueBadge = (l) => {
    if (l.derived_status === 'Overdue') {
      return `Overdue ${plural(l.days_overdue, 'day', 'days')} · ${taka(l.fine_amount)}`;
    }
    const d = today ? daysUntil(today, l.due_date) : null;
    if (d === 0) return 'Due today';
    if (d === 1) return 'Due tomorrow';
    return d == null ? `Due ${day(l.due_date)}` : `Due in ${d} days`;
  };
  const holdBadge = (r) => ({
    Pending: 'Awaiting pickup', Rejected: 'Not approved', Expired: 'Expired', Cancelled: 'Cancelled',
  }[r.status] || r.status);
  const noticeFor = (id) => (notice && notice.id === id
    ? <span className={`mdash-live-notice${notice.ok ? ' is-ok' : ''}`} role="status">{notice.text}</span>
    : null);

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
              <h1 className="mdash-heading-1">Welcome, {m.name}</h1>
              <p className="mdash-paragraph">
                <span className="mdash-paragraph-text">{"Card ID: "}</span>
                <span className="mdash-paragraph-text-2">{m.id}</span>
                <span className="mdash-paragraph-text">{" \u00a0\u2022\u00a0 Status: "}<span className="mdash-span">{m.status === 'Active' ? 'Active Reader' : `${m.status} Account`}</span></span>
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
                  <span className="mdash-horizontalborder-text">{plural(active.length, 'VOLUME', 'VOLUMES')} ACTIVE</span>
                </div>
                <div className="mdash-books-list">
                  {error && (
                    <div className="mdash-book-1">
                      <div className="mdash-book-1-box mdash-live-left">
                        <span className="mdash-book-1-box-box-2-text mdash-live-wrap">Your account could not be loaded: {error}</span>
                      </div>
                    </div>
                  )}
                  {data && !active.length && (
                    <div className="mdash-book-1">
                      <div className="mdash-book-1-box mdash-live-left">
                        <span className="mdash-book-1-box-box-2-text mdash-live-wrap">No books on loan right now. <Link to="/catalog" className="mdash-live-link">Browse the catalogue</Link> to request one.</span>
                      </div>
                    </div>
                  )}
                  {active.map((l, i) => {
                    const k = (i % 3) + 1;
                    const why = renewBlock(l);
                    const overdue = l.derived_status === 'Overdue';
                    return (
                      <div key={l.id} className={`mdash-book-${k}`}>
                        <div className={`mdash-book-${k}-box mdash-live-left`}>
                          <div className={`mdash-book-${k}-box-box`}>
                            <h3 className="mdash-heading-3"><Link to={bookLink(l.book_id, l.book_title)}>{l.book_title}</Link></h3>
                          </div>
                          <div className={`mdash-book-${k}-box-box-2`}>
                            <span className={`mdash-book-${k}-box-box-2-text`}>{"Borrowed: "}<span className="mdash-span">{day(l.issued_date)}</span>{" \u00a0|\u00a0 Due: "}<span className="mdash-span">{day(l.due_date)}</span>{l.renewal_count ? ` \u00a0|\u00a0 Renewed ${plural(l.renewal_count, 'time', 'times')}` : ''}</span>
                          </div>
                          {overdue && (
                            <div className={`mdash-book-${k}-box-box-2`}>
                              <span className={`mdash-book-${k}-box-box-2-text mdash-live-wrap`}>{`Fine so far ${taka(l.fine_amount)} (${taka(s.fine_per_day)} a day). Please return it to the desk.`}</span>
                            </div>
                          )}
                          {noticeFor(l.id)}
                        </div>
                        <div className={`mdash-book-${k}-box-3`}>
                          <div className={overdue ? 'mdash-overlay-border' : 'mdash-background-border'}>
                            <span className={overdue ? 'mdash-overlay-border-text' : 'mdash-background-border-text'}>{dueBadge(l)}</span>
                          </div>
                          {why
                            ? <span className="mdash-live-muted" title="See Renewals & Holds">{why}</span>
                            : (
                              <button type="button" className={`mdash-book-${k}-box-3-box`} disabled={working === l.id} onClick={() => renew(l)}>
                                {working === l.id ? 'Renewing…' : 'Renew →'}
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="mdash-section-3-reservations">
                <div className="mdash-horizontalborder">
                  <h2 className="mdash-heading-2-2">
                    <span className="mdash-heading-2-2-text">{"Reservations "}</span>
                    <span className="mdash-heading-2-2-text-2">সংরক্ষণ</span>
                  </h2>
                  <span className="mdash-horizontalborder-text-2">{plural(pending.length, 'VOLUME', 'VOLUMES')} PENDING</span>
                </div>
                {data && !holds.length && (
                  <div className="mdash-background-border-2">
                    <div className="mdash-background-border-2-box mdash-live-left">
                      <span className="mdash-background-border-2-box-box-2-text mdash-live-wrap">No holds or borrow requests. Use “Borrow” on a book’s page to have it held at the desk.</span>
                    </div>
                  </div>
                )}
                {holds.map((r) => (
                  <div key={r.id} className="mdash-background-border-2">
                    <div className="mdash-background-border-2-box mdash-live-left">
                      <div className="mdash-background-border-2-box-box">
                        <h3 className="mdash-heading-3"><Link to={bookLink(r.book_id, r.book_title)}>{r.book_title}</Link></h3>
                        <div className="mdash-background-border-2-box-box-box">
                          <span className="mdash-background-border-2-box-box-box-text mdash-live-mono">{r.id}</span>
                        </div>
                      </div>
                      <div className="mdash-background-border-2-box-box-2">
                        {r.status === 'Pending'
                          ? <span className="mdash-background-border-2-box-box-2-text mdash-live-wrap">{"Pickup: "}<span className="mdash-span">{day(r.pickup_date)}</span>{" \u00a0|\u00a0 Held until: "}<span className="mdash-span">{day(r.expires_at)}</span>{" \u00a0|\u00a0 Hold Shelf: "}<span className="mdash-span">Circulation Desk</span></span>
                          : <span className="mdash-background-border-2-box-box-2-text mdash-live-wrap">{"Requested: "}<span className="mdash-span">{day(r.created_at)}</span>{r.reason ? <>{" \u00a0|\u00a0 "}<span className="mdash-span">{r.reason}</span></> : null}</span>}
                      </div>
                      {noticeFor(r.id)}
                    </div>
                    <div className="mdash-book-1-box-3">
                      <div className="mdash-border">
                        <span className="mdash-border-text">{holdBadge(r)}</span>
                      </div>
                      {r.status === 'Pending' && (
                        <button type="button" className="mdash-book-1-box-3-box" disabled={working === r.id} onClick={() => cancel(r)}>
                          {working === r.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {notice && !holds.some((r) => r.id === notice.id) && !active.some((l) => l.id === notice.id) && (
                  <span className={`mdash-live-notice${notice.ok ? ' is-ok' : ''}`} role="status">{notice.text}</span>
                )}
              </section>
              <div className="mdash-left-8-cols-my-books-reservation-box">
                <div className="mdash-horizontalborder">
                  <h2 className="mdash-heading-2-3">
                    <span className="mdash-heading-2-3-text">{"Reading History "}</span>
                    <span className="mdash-heading-2-3-text-2">পঠিত গ্রন্থাবলি</span>
                  </h2>
                  <span className="mdash-horizontalborder-text-3">{plural(history.length, 'VOLUME', 'VOLUMES')} COMPLETED</span>
                </div>
                <div className="mdash-left-8-cols-my-books-reservation-box-box">
                  {data && !history.length && (
                    <div className="mdash-book-1">
                      <div className="mdash-book-1-box-2 mdash-live-left">
                        <span className="mdash-paragraph-text-3 mdash-live-wrap">Books you return will be listed here.</span>
                      </div>
                    </div>
                  )}
                  {shownHistory.map((l, i) => {
                    const k = (i % 3) + 1;
                    const fine = l.fine_status && l.fine_status !== 'Voided' ? ` \u00a0\u2022\u00a0 Fine: ${taka(l.fine_amount)} (${l.fine_status})` : '';
                    return (
                      <div key={l.id} className={`mdash-book-${k}`}>
                        <div className={`mdash-book-${k}-box-2 mdash-live-left`}>
                          <div className={`mdash-book-${k}-box-2-box`}>
                            <h3 className="mdash-heading-3">{l.book_title}</h3>
                          </div>
                          <p className="mdash-paragraph">
                            <span className="mdash-paragraph-text-3 mdash-live-wrap">{l.status === 'Lost' ? 'Reported lost' : 'Returned: '}{l.status === 'Lost' ? '' : <span className="mdash-span">{day(l.return_date)}</span>}{" \u00a0\u2022\u00a0 Loaned: "}<span className="mdash-span">{day(l.issued_date)}</span>{fine}{" \u00a0\u2022\u00a0 Loan No: "}</span>
                            <span className="mdash-paragraph-text-4">{l.id}</span>
                          </p>
                        </div>
                        <div className={`mdash-book-${k}-box-3`}>
                          <div className="mdash-background-border">
                            <span className="mdash-background-border-text-2">{l.status === 'Lost' ? 'Lost' : 'Returned'}</span>
                          </div>
                          <Link to={bookLink(l.book_id, l.book_title)} className={`mdash-book-${k}-box-3-box`}>View Monograph →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mdash-circulation-archive-link">
                  {history.length > HISTORY_PREVIEW
                    ? <button type="button" className="mdash-circulation-archive-link-box" onClick={() => setShowAllHistory((v) => !v)}>{showAllHistory ? 'Show fewer →' : `View Complete Borrowing History (${history.length}) →`}</button>
                    : <Link to="/catalog" className="mdash-circulation-archive-link-box">Browse the Catalogue →</Link>}
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
                      <span className="mdash-minimal-fine-list-box-box-text">{taka(outstanding)}</span>
                    </div>
                    <div className="mdash-minimal-fine-list-box-box">
                      <span className="mdash-minimal-fine-list-box-box-text-2">OUTSTANDING</span>
                    </div>
                  </div>
                  {openFines.map((f) => (
                    <div key={f.id} className="mdash-minimal-fine-list-box-2">
                      <span className="mdash-overdue-padma-river-boatman">{`${f.kind}: ${titleOfLoan[f.loan_id] || f.loan_id} — ${taka(f.amount - f.amount_paid)}${Number(f.amount_paid) > 0 ? ` of ${taka(f.amount)}` : ''}`}</span>
                    </div>
                  ))}
                  {accruing.map((l) => (
                    <div key={l.id} className="mdash-minimal-fine-list-box-2">
                      <span className="mdash-overdue-padma-river-boatman">{`Overdue: ${l.book_title} — ${taka(l.fine_amount)} so far`}</span>
                    </div>
                  ))}
                  <div className="mdash-minimal-fine-list-box-2">
                    <span className="mdash-please-settle-fine-during-book-r">
                      {outstanding > 0
                        ? 'Please settle fines during book return at the desk. Borrowing and renewals pause until they are cleared.'
                        : data ? 'No fines on your account.' : ' '}
                    </span>
                  </div>
                  {lastPayment && (
                    <div className="mdash-minimal-fine-list-box-2">
                      <span className="mdash-please-settle-fine-during-book-r">{`Last payment: ${taka(lastPayment.amount)} on ${day(lastPayment.paid_at)} (${lastPayment.method})${fineById[lastPayment.fine_id] ? ` for ${titleOfLoan[fineById[lastPayment.fine_id].loan_id] || 'a fine'}` : ''}.`}</span>
                    </div>
                  )}
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
                <span className="mdash-borrowing-guidance-note-text mdash-live-wrap">
                  {renewalsAllowed
                    ? `Each loan can be renewed online ${renewalsAllowed === 1 ? 'once' : `${renewalsAllowed} times`}, adding ${s.renewal_days ?? 14} days, up to and including its due date — unless another reader is waiting for the only copy, a book is overdue or a fine is unpaid. `
                    : 'Loans are renewed at the circulation desk. '}
                  {`Holds wait at the desk for ${s.hold_grace_days ?? 2} days after the pickup date, then the copy is released.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
