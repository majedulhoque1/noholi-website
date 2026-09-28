import { Link } from 'react-router-dom';
import './Privacy.css';

// Privacy notice. Not a Figma frame: written by hand in the Rules page's type and colour tokens.
const SECTIONS = [
  {
    kicker: '01',
    title: 'What we collect',
    body: (
      <ul>
        <li><strong>Membership application:</strong> your name, phone number, email, postal address and the photograph you upload.</li>
        <li><strong>Borrow requests:</strong> your NID / passport / birth certificate number, and your guarantor’s name, relationship to you, phone number, NID and address.</li>
        <li><strong>Lending records:</strong> the books you borrow, due and return dates, and any fines and payments.</li>
      </ul>
    ),
  },
  {
    kicker: '02',
    title: 'Who sees it',
    body: <p>Library staff only. Your details are never published on the website, sold or shared with anyone else. Other members cannot see them.</p>,
  },
  {
    kicker: '03',
    title: 'Why we keep it',
    body: (
      <p>
        Noholi lends books on trust. We need to know who has each book, how to reach them and, if a book is not returned,
        who stands as their guarantor. We use the details for lending accountability and nothing else.
      </p>
    ),
  },
  {
    kicker: '04',
    title: 'How long we keep it',
    body: (
      <p>
        Rejected membership applications, and their photographs, are deleted automatically 90 days after the decision.
        Members’ details and lending records are kept while the membership is active, so the library can account for its books.
      </p>
    ),
  },
  {
    kicker: '05',
    title: 'Questions or corrections',
    body: (
      <p>
        Ask at the circulation desk, or <Link to="/contact">contact the library</Link>. The desk can correct your name,
        NID or guarantor details; you can change your phone number and address yourself in your member profile.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="privacy">
      <nav className="privacy-crumbs" aria-label="Breadcrumb">
        <div className="privacy-crumbs-inner">
          <Link to="/">HOME</Link>
          <span aria-hidden="true">/</span>
          <span className="privacy-crumbs-current">PRIVACY NOTICE</span>
        </div>
      </nav>
      <section className="privacy-main">
        <header className="privacy-header">
          <p className="privacy-kicker">
            <span className="privacy-kicker-bar" aria-hidden="true" />
            HOW WE LOOK AFTER YOUR DETAILS
          </p>
          <h1 className="privacy-title">Privacy Notice</h1>
          <p className="privacy-title-bn" lang="bn">গোপনীয়তা বিজ্ঞপ্তি</p>
          <p className="privacy-lede">
            A short, plain account of the personal details Noholi Library keeps, who can see them, and for how long.
          </p>
        </header>
        <div className="privacy-sections">
          {SECTIONS.map((s) => (
            <section key={s.kicker} className="privacy-section">
              <span className="privacy-section-num">{s.kicker}</span>
              <div className="privacy-section-body">
                <h2 className="privacy-section-title">{s.title}</h2>
                {s.body}
              </div>
            </section>
          ))}
        </div>
        <p className="privacy-foot">
          See also the <Link to="/rules">Library Rules &amp; Borrowing Guidelines</Link>.
        </p>
      </section>
    </div>
  );
}
