import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { OverlaySelect, SOON_STUDIO, Status, saveDraft, useSubmission } from './memberStudio.jsx';
import './StudioReview.css';

const CLASSIFICATIONS = [
  { value: 'riverine', label: 'Riverine Lore & Rural Dialectics (নদীকেন্দ্রিক আখ্যান)' },
  { value: 'urban', label: 'Urban Realism & City Chronicles (নাগরিক আখ্যান)' },
  { value: 'poetry', label: 'Poetry & Verse Criticism (কাব্য সমালোচনা)' },
  { value: 'history', label: 'History & Partition Literature (ইতিহাস ও দেশভাগ)' },
];
const DIFFICULTY = [
  { value: 'accessible', label: 'ACCESSIBLE', note: 'Lyrical flow' },
  { value: 'substantial', label: 'SUBSTANTIAL', note: 'Dialectical depth' },
  { value: 'demanding', label: 'DEMANDING', note: 'Archival rigor' },
];
const TAGS = [
  ['sreview-background-border-3', 'Scholars of Bengal Renaissance'],
  ['sreview-background-border-4', 'Navigational & Riverine Fiction'],
  ['sreview-background-border-5', 'Socialist Realism'],
];
const REQUIRED = [
  ['book-title', 'book title'],
  ['book-title-in-bengali', 'book title in Bengali'],
  ['author-name', 'author name(s)'],
  ['year-of-publication', 'year of publication'],
  ['classification', 'primary literary classification'],
  ['affirmation', 'patron declaration'],
];
const STARS = ['sreview-1-star', 'sreview-2-stars', 'sreview-3-stars', 'sreview-4-stars', 'sreview-5-stars'];

// Generated from Figma frame "Noholi Library — Member Writing Studio: Submit Book Review (After login)" (126:4820) by tools/gen_member.py, then hand-edited.
export default function StudioReview() {
  const { member } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const critiqueRef = useRef(null);
  const [source, setSource] = useState('stacks');
  const [classification, setClassification] = useState('riverine');
  const [rating, setRating] = useState(5);
  const [difficulty, setDifficulty] = useState('substantial');
  const [tags, setTags] = useState(TAGS.map(([, t]) => t));
  const tagsEdited = tags.join('|') !== TAGS.map(([, t]) => t).join('|');
  const [plate, setPlate] = useState(null);
  // the design's ledger figures are shown until the critique is edited, then counted live
  const [counts, setCounts] = useState(null);
  const { status, setStatus, submit } = useSubmission(REQUIRED, SOON_STUDIO(), { ok: false });

  const recount = () => {
    const text = critiqueRef.current?.innerText.trim() || '';
    setCounts({ words: text ? text.split(/\s+/).length : 0, chars: text.length });
  };
  // toolbar: markdown-style marks typed into the editable critique at the caret
  const mark = (pre, post = '') => {
    const el = critiqueRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const picked = sel && el.contains(sel.anchorNode) ? sel.toString() : '';
    document.execCommand('insertText', false, pre + picked + post);
    recount();
  };
  const clearCritique = () => {
    if (critiqueRef.current) critiqueRef.current.textContent = '';
    recount();
  };
  const addTag = () => {
    const tag = window.prompt('Add a reader audience tag');
    if (tag && tag.trim()) setTags((t) => [...t, tag.trim()]);
  };
  const onSubmit = (e) =>
    submit(e, () => (critiqueRef.current?.innerText.trim() ? null : 'Please write your critique in Section 03.'));
  const onSaveDraft = () =>
    setStatus(saveDraft(formRef.current, 'noholi.draft.book-review')
      ? { ok: true, text: 'Draft saved in this browser.' }
      : { ok: false, text: 'This browser would not store the draft.' });

  return (
    <div className="sreview">
      <section className="sreview-main--root">
        <div className="sreview-main-box">
          <section className="sreview-breadcrumb-top-folio-header-bar">
            <div className="sreview-breadcrumb-top-folio-header-bar-box">
              <nav className="sreview-nav-breadcrumb">
                <Link to="/" className="sreview-nav-breadcrumb-box">HOME</Link>
                <div className="sreview-nav-breadcrumb-box-2">
                  <span className="sreview-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="sreview-nav-breadcrumb-box">WRITE UPS</Link>
                <div className="sreview-nav-breadcrumb-box-2">
                  <span className="sreview-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/book-reviews" className="sreview-nav-breadcrumb-box">BOOK REVIEWS</Link>
                <div className="sreview-nav-breadcrumb-box-2">
                  <span className="sreview-nav-breadcrumb-box-2-text">/</span>
                </div>
                <div className="sreview-nav-breadcrumb-box-2">
                  <span className="sreview-submit-a-review">SUBMIT A REVIEW (বই পর্যালোচনা জমা দিন)</span>
                </div>
              </nav>
              <div className="sreview-breadcrumb-top-folio-header-bar-box-box">
                <div className="sreview-breadcrumb-top-folio-header-bar-box-box-box" />
                <div className="sreview-breadcrumb-top-folio-header-bar-box-box-box-2">
                  <span className="sreview-breadcrumb-top-folio-header-bar-box-box-box-2-text">FOLIO REGISTRY: 2026 / CRITIQUE SUBMISSION TERMINAL • SEC-NL-CRIT-04</span>
                </div>
              </div>
            </div>
          </section>
          <section className="sreview-page-title-masthead-header">
            <div className="sreview-page-title-masthead-header-box">
              <div className="sreview-page-title-masthead-header-box-box">
                <div className="sreview-page-title-masthead-header-box-box-box">
                  <div className="sreview-page-title-masthead-header-box-box-box-box">
                    <div className="sreview-background-border">
                      <span className="sreview-background-border-text">DESPATCH STATUS: FOLIO READY</span>
                    </div>
                    <div className="sreview-page-title-masthead-header-box-box-box-box-box">
                      <span className="sreview-page-title-masthead-header-box-box-box-box-box-text">ACCREDITED PATRON SUBMISSION</span>
                    </div>
                  </div>
                  <h1 className="sreview-heading-1">Submit a Book Review &<br />Reading Apparatus</h1>
                  <div className="sreview-page-title-masthead-header-box-box-box-box-2">
                    <span className="sreview-page-title-masthead-header-box-box-box-box-2-text">গ্রন্থ সমালোচনা ও পাঠকীয় পাঠপরিক্রমা নিবেদন</span>
                  </div>
                  <div className="sreview-page-title-masthead-header-box-box-box-box-3">
                    <span className="sreview-page-title-masthead-header-box-box-box-box-3-text">Contribute scholarly appraisal, reader marginalia, and interpretive companions for volumes in your{' '}<br className="soft-br" />private library or the Noholi Accession. Patrons submit contextual analysis, thematic appraisals, and{' '}<br className="soft-br" />excerpt notes—no full book manuscript upload is required.</span>
                  </div>
                </div>
                <div className="sreview-archival-ledger-timestamp-box">
                  <div className="sreview-horizontalborder">
                    <div className="sreview-horizontalborder-box">
                      <span className="sreview-horizontalborder-box-text">ACCESSION CYCLE</span>
                    </div>
                    <div className="sreview-horizontalborder-box">
                      <span className="sreview-horizontalborder-box-text-2">SPRING 1432 / 2026</span>
                    </div>
                  </div>
                  <div className="sreview-archival-ledger-timestamp-box-box">
                    <div className="sreview-archival-ledger-timestamp-box-box-box">
                      <span className="sreview-archival-ledger-timestamp-box-box-box-text">{"Gazette Quorum: "}<span className="sreview-span">Vol. IX, Fascicle 2</span></span>
                    </div>
                    <p className="sreview-paragraph">
                      <span className="sreview-paragraph-text">{"Desk Classification: "}</span>
                      <span className="sreview-paragraph-text-2">CRIT-APP-DESK</span>
                    </p>
                    <div className="sreview-archival-ledger-timestamp-box-box-box">
                      <span className="sreview-archival-ledger-timestamp-box-box-box-text-2">Editorial curation occurs weekly on lunar Thursdays.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sreview-authenticated-patron-confirmatio">
                <div className="sreview-authenticated-patron-confirmatio-box">
                  <img className="sreview-authenticated-patron-confirmatio-box-box" src="/svg/background-120ny9v.svg" alt="" width="48" height="48" />
                  <div className="sreview-authenticated-patron-confirmatio-box-box-2">
                    <div className="sreview-authenticated-patron-confirmatio-box-box-2-box">
                      <div className="sreview-authenticated-patron-confirmatio-box-box-2-box-box">
                        <span className="sreview-authenticated-patron-confirmatio-box-box-2-box-box-text">{member?.name}</span>
                      </div>
                      <div className="sreview-background-border-2">
                        <span className="sreview-background-border-2-text">{`#${member?.cardNumber} PATRON`}</span>
                      </div>
                      <div className="sreview-authenticated-patron-confirmatio-box-box-2-box-box">
                        <span className="sreview-authenticated-patron-confirmatio-box-box-2-box-box-text-2">•</span>
                      </div>
                      <div className="sreview-authenticated-patron-confirmatio-box-box-2-box-box">
                        <span className="sreview-authenticated-patron-confirmatio-box-box-2-box-box-text-3">Noholi Library member</span>
                      </div>
                    </div>
                    <div className="sreview-authenticated-patron-confirmatio-box-box-2-box-2">
                      <span className="sreview-authenticated-patron-confirmatio-box-box-2-box-2-text">Coming soon: online reviews are not open yet, so nothing is sent. Drafts save in this browser only.</span>
                    </div>
                  </div>
                </div>
                <div className="sreview-verticalborder">
                  <div className="sreview-verticalborder-box">
                    <div className="sreview-verticalborder-box-box">
                      <span className="sreview-verticalborder-box-box-text">LEDGER SYNCHRONIZED</span>
                    </div>
                    <span className="sreview-verticalborder-box-text">04:18 PM LOCAL TIME</span>
                  </div>
                  <img className="sreview-verticalborder-box-2" src="/svg/container-npqcvt.svg" alt="" width="19" height="15" />
                </div>
              </div>
            </div>
          </section>
          <section className="sreview-main-work-area">
            <div className="sreview-main-work-area-box">
              <form id="sreview-form" ref={formRef} className="sreview-left-column-8-columns" onSubmit={onSubmit} noValidate>
                <div className="sreview-fieldset-section-01-book-identif">
                  <div className="sreview-fieldset-section-01-book-identif-2" />
                  <div className="sreview-legend">
                    <div className="sreview-legend-box" />
                    <span className="sreview-section-01-book-identification-p">SECTION 01: BOOK IDENTIFICATION & PUBLICATION DETAILS (গ্রন্থ পরিচিতি ও প্রকাশনা বিবরণী)</span>
                  </div>
                  <div className="sreview-source-selector-toggle">
                    <span className="sreview-label" id="sreview-source-label">VOLUME PROVENANCE / SOURCE (গ্রন্থের উৎস) *</span>
                    <div className="sreview-source-selector-toggle-box" role="radiogroup" aria-labelledby="sreview-source-label">
                      <label className="sreview-label-2 studio-clickable">
                        <input type="radio" name="source" value="stacks" checked={source === 'stacks'} onChange={() => setSource('stacks')} className="studio-visually-hidden" />
                        <div className="sreview-input">
                          {source === 'stacks' ? <div className="sreview-input-2"><div className="sreview-input-checked" /></div> : <div className="sreview-input-3" />}
                        </div>
                        <div className="sreview-label-2-box">
                          <div className="sreview-label-2-box-box">
                            <span className="sreview-label-2-box-box-text">From Noholi Stacks Catalog</span>
                          </div>
                          <div className="sreview-label-2-box-box">
                            <span className="sreview-label-2-box-box-text-2">Indexed volume currently housed in reading stacks{' '}<br className="soft-br" />or microfilms</span>
                          </div>
                        </div>
                      </label>
                      <label className="sreview-label-3 studio-clickable">
                        <input type="radio" name="source" value="personal" checked={source === 'personal'} onChange={() => setSource('personal')} className="studio-visually-hidden" />
                        <div className="sreview-input">
                          {source === 'personal' ? <div className="sreview-input-2"><div className="sreview-input-checked" /></div> : <div className="sreview-input-3" />}
                        </div>
                        <div className="sreview-label-3-box">
                          <div className="sreview-label-3-box-box">
                            <span className="sreview-label-3-box-box-text">From Personal Patron Collection</span>
                          </div>
                          <div className="sreview-label-3-box-box">
                            <span className="sreview-label-3-box-box-text-2">Private accession, rare imprint, or self-acquired{' '}<br className="soft-br" />edition</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="sreview-dual-title-fields">
                    <div className="sreview-dual-title-fields-box">
                      <label className="sreview-label-4" htmlFor="sreview-book-title">BOOK TITLE (LATIN / TRANSLITERATED) *</label>
                      <input id="sreview-book-title" name="book-title" required className="sreview-input-4" defaultValue="Padma Nadir Majhi" />
                    </div>
                    <div className="sreview-dual-title-fields-box-2">
                      <label className="sreview-label-4" htmlFor="sreview-book-title-in-bengali">BOOK TITLE IN BENGALI (মূল বাংলা শিরোনাম) *</label>
                      <input id="sreview-book-title-in-bengali" name="book-title-in-bengali" required className="sreview-input-5" defaultValue="পদ্মা নদীর মাঝি" />
                    </div>
                  </div>
                  <div className="sreview-author-year-imprint">
                    <div className="sreview-author-year-imprint-box">
                      <label className="sreview-label-4" htmlFor="sreview-author-name">AUTHOR NAME(S) / অনুবাদক (AUTHOR & TRANSLATOR) *</label>
                      <input id="sreview-author-name" name="author-name" required className="sreview-input-6" defaultValue="Manik Bandopadhyay" />
                    </div>
                    <div className="sreview-author-year-imprint-box">
                      <label className="sreview-label-4" htmlFor="sreview-year-of-publication">YEAR OF PUBLICATION *</label>
                      <input id="sreview-year-of-publication" name="year-of-publication" required inputMode="numeric" className="sreview-input-7" defaultValue="1936" />
                    </div>
                  </div>
                  <div className="sreview-publisher-shelf-mark-classificat">
                    <div className="sreview-publisher-shelf-mark-classificat-box">
                      <label className="sreview-label-4" htmlFor="sreview-publisher-press-imprint-shelfmar">PUBLISHER / PRESS IMPRINT & SHELFMARK</label>
                      <input id="sreview-publisher-press-imprint-shelfmar" name="publisher-press-imprint-shelfmar" className="sreview-input-8" defaultValue="Gurudas Chattopadhyay & Sons (Calcutta) • STACK-FIC-891.44" />
                    </div>
                    <div className="sreview-publisher-shelf-mark-classificat-box-2">
                      <label className="sreview-label-4" htmlFor="sreview-classification">PRIMARY LITERARY CLASSIFICATION *</label>
                      <div className="sreview-options" style={{ position: 'relative' }}>
                        <OverlaySelect id="sreview-classification" name="classification" required value={classification} onChange={setClassification} options={CLASSIFICATIONS} />
                        <div className="sreview-options-box">
                          <span className="sreview-riverine-lore-rural-dialectics">{CLASSIFICATIONS.find((o) => o.value === classification).label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sreview-frontispiece-inscription-scan-fr">
                    <div className="sreview-frontispiece-inscription-scan-fr-box">
                      <div className="sreview-frontispiece-inscription-scan-fr-box-box">
                        <img className="sreview-frontispiece-inscription-scan-fr-box-box-box" src="/svg/icon-19u957e.svg" alt="" width="27" height="34" />
                        <div className="sreview-frontispiece-inscription-scan-fr-box-box-box-2">
                          <div className="sreview-frontispiece-inscription-scan-fr-box-box-box-2-box">
                            <span className="sreview-book-cover-or-title-page-inscrip">Book Cover or Title Page Inscription Scan (ঐচ্ছিক প্রচ্ছদ বা প্রথম পাতার{' '}<br className="soft-br" />ছবি)</span>
                          </div>
                          <div className="sreview-frontispiece-inscription-scan-fr-box-box-box-2-box-2">
                            <span className="sreview-frontispiece-inscription-scan-fr-box-box-box-2-box-2-text">Upload an archival scan or clean photograph of the cover, colophon plate, or{' '}<br className="soft-br" />frontispiece (JPG/PNG, up to 5MB).</span>
                            <div className="sreview-strong">
                              <span className="sreview-mandate-do-not-upload-full-book">Mandate: Do not upload full book text manuscripts. Only cover plates or{' '}<br className="soft-br" />bibliographical plates accepted.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sreview-frontispiece-inscription-scan-fr-box-box-2">
                        <input id="sreview-plate" name="plate" type="file" accept="image/*" hidden onChange={(e) => setPlate(e.target.files[0] || null)} />
                        <button type="button" onClick={() => document.getElementById('sreview-plate').click()} className="sreview-frontispiece-inscription-scan-fr-box-box-2-box">
                          <img className="sreview-frontispiece-inscription-scan-fr-box-box-2-box-box" src="/svg/container-1mcsz2e.svg" alt="" width="11" height="14" />
                          <span className="sreview-frontispiece-inscription-scan-fr-box-box-2-box-text">BROWSE PLATE FILES</span>
                        </button>
                      </div>
                    </div>
                    <div className="sreview-filename-mock-badge">
                      <img className="sreview-filename-mock-badge-box" src="/svg/container-1roanaj.svg" alt="" width="8" height="12" />
                      <div className="sreview-filename-mock-badge-box-2">
                        <span className="sreview-filename-mock-badge-box-2-text">{plate ? plate.name : 'padma_nadir_majhi_1936_first_edition_plate.jpg'}</span>
                      </div>
                      <div className="sreview-filename-mock-badge-box-2">
                        <span className="sreview-filename-mock-badge-box-2-text-2">{plate ? `(${(plate.size / 1048576).toFixed(1)} MB — Selected)` : '(1.8 MB — Verified Scan)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sreview-fieldset-section-02-evaluative-a">
                  <div className="sreview-fieldset-section-02-evaluative-a-2" />
                  <div className="sreview-legend-2">
                    <div className="sreview-legend-2-box" />
                    <span className="sreview-legend-2-text">SECTION 02: EVALUATIVE APPRAISAL & TEXTUAL RATING (মূল্যায়ন ও অভিজ্ঞান মানদণ্ড)</span>
                  </div>
                  <div className="sreview-fieldset-section-02-evaluative-a-box">
                    <div className="sreview-star-rating-module">
                      <span className="sreview-label-4" id="sreview-rating-label">OVERALL CRITICAL APPRAISAL SCORE *</span>
                      <div className="sreview-star-rating-module-box" role="radiogroup" aria-labelledby="sreview-rating-label">
                        <input type="hidden" name="rating" value={rating} />
                        <button type="button" role="radio" aria-checked={rating === 1} aria-label="1 of 5" onClick={() => setRating(1)} className="studio-star"><img className="sreview-1-star" style={rating < 1 ? { opacity: 0.25 } : undefined} src="/svg/button-1-star-dl20qx.svg" alt="" width="24" height="34" /></button>
                        <button type="button" role="radio" aria-checked={rating === 2} aria-label="2 of 5" onClick={() => setRating(2)} className="studio-star"><img className="sreview-2-stars" style={rating < 2 ? { opacity: 0.25 } : undefined} src="/svg/button-1-star-dl20qx.svg" alt="" width="24" height="34" /></button>
                        <button type="button" role="radio" aria-checked={rating === 3} aria-label="3 of 5" onClick={() => setRating(3)} className="studio-star"><img className="sreview-3-stars" style={rating < 3 ? { opacity: 0.25 } : undefined} src="/svg/button-1-star-dl20qx.svg" alt="" width="24" height="34" /></button>
                        <button type="button" role="radio" aria-checked={rating === 4} aria-label="4 of 5" onClick={() => setRating(4)} className="studio-star"><img className="sreview-4-stars" style={rating < 4 ? { opacity: 0.25 } : undefined} src="/svg/button-1-star-dl20qx.svg" alt="" width="24" height="34" /></button>
                        <button type="button" role="radio" aria-checked={rating === 5} aria-label="5 of 5" onClick={() => setRating(5)} className="studio-star"><img className="sreview-5-stars" style={rating < 5 ? { opacity: 0.25 } : undefined} src="/svg/button-1-star-dl20qx.svg" alt="" width="24" height="34" /></button>
                        <div className="sreview-star-rating-module-box-box">
                          <span className="sreview-star-rating-module-box-box-text">{rating}.0 / 5.0</span>
                        </div>
                      </div>
                      <div className="sreview-star-rating-module-box-2">
                        <span className="sreview-exceptional-thematic-rigor-endur">✦ EXCEPTIONAL THEMATIC RIGOR & ENDURING{' '}<br className="soft-br" />REGIONAL MERIT</span>
                      </div>
                      <div className="sreview-star-rating-module-box-2">
                        <span className="sreview-appraisal-denotes-enduring-canon">Appraisal denotes enduring canonical significance,{' '}<br className="soft-br" />syntactical mastery, or historical authenticity in South{' '}<br className="soft-br" />Asian literary preservation.</span>
                      </div>
                    </div>
                    <div className="sreview-reading-cadence-difficulty">
                      <div className="sreview-reading-cadence-difficulty-box">
                        <span className="sreview-label-4" id="sreview-difficulty-label">READING DIFFICULTY & LEXICAL CADENCE *</span>
                        <div className="sreview-reading-cadence-difficulty-box-box" role="radiogroup" aria-labelledby="sreview-difficulty-label">
                          <input type="hidden" name="difficulty" value={difficulty} />
                          {DIFFICULTY.map((d, i) => {
                            // selected option takes the design's highlighted (SUBSTANTIAL) look
                            const k = difficulty === d.value ? 6 : i === 2 ? 7 : 5;
                            return (
                              <button type="button" key={d.value} role="radio" aria-checked={difficulty === d.value} onClick={() => setDifficulty(d.value)} className={`sreview-label-${k}`}>
                                <div className={`sreview-label-${k}-box`}>
                                  <span className={`sreview-label-${k}-box-text`}>{d.label}</span>
                                </div>
                                <div className={`sreview-label-${k}-box`}>
                                  <span className={`sreview-label-${k}-box-text-2`}>{d.note}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="sreview-recommended-audience-tags">
                        <div className="sreview-recommended-audience-tags-2">
                          <span className="sreview-label-4">RECOMMENDED READER AUDIENCE / PREREQUISITE LORE</span>
                          <div className={`sreview-recommended-audience-tags-2-box${tagsEdited ? ' studio-tags-flow' : ''}`}>
                            {tags.map((t, i) => {
                              // untouched, the three design tags keep their drawn positions; once edited they flow
                              const cls = !tagsEdited ? TAGS[i][0] : null;
                              return (
                                <button type="button" key={t} aria-label={`Remove ${t}`} onClick={() => setTags((all) => all.filter((x) => x !== t))} className={cls || 'studio-tag'}>
                                  <span className={cls ? `${cls}-text` : 'studio-tag-text'}>{t} ×</span>
                                </button>
                              );
                            })}
                            <input type="hidden" name="audience" value={tags.join(', ')} />
                            <button type="button" onClick={addTag} className="sreview-recommended-audience-tags-2-box-box">+ ADD TAG</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sreview-fieldset-section-03-the-critique">
                  <div className="sreview-legend-3">
                    <div className="sreview-legend-3-box" />
                    <span className="sreview-legend-3-text">SECTION 03: THE CRITIQUE & MARGINALIA COMPOSITION STUDIO (সমালোচনা ও প্রান্তটীকা খসড়া)</span>
                  </div>
                  <div className="sreview-fieldset-section-03-the-critique-2" />
                  <div className="sreview-archival-studio-toolbar">
                    <div className="sreview-archival-studio-toolbar-box">
                      <button type="button" onClick={() => mark('## ')} className="sreview-archival-studio-toolbar-box-box">H2</button>
                      <button type="button" onClick={() => mark('### ')} className="sreview-archival-studio-toolbar-box-box-2">H3</button>
                      <div className="sreview-archival-studio-toolbar-box-box-3">
                        <div className="sreview-vertical-divider" />
                      </div>
                      <button type="button" onClick={() => mark('**', '**')} className="sreview-archival-studio-toolbar-box-box-4">B</button>
                      <button type="button" onClick={() => mark('*', '*')} className="sreview-archival-studio-toolbar-box-box-5">I</button>
                      <button type="button" onClick={() => mark('> ')} className="sreview-archival-studio-toolbar-box-box-6">
                        <img className="sreview-archival-studio-toolbar-box-box-6-box" src="/svg/container-1ngv1yq.svg" alt="" width="12" height="8" />
                        <span className="sreview-archival-studio-toolbar-box-box-6-text">Quote</span>
                      </button>
                      <div className="sreview-archival-studio-toolbar-box-box-3">
                        <div className="sreview-vertical-divider" />
                      </div>
                      <div className="sreview-printer-s-ornaments-insertion">
                        <img className="sreview-printer-s-ornaments-insertion-box" src="/svg/button-1skfze2.svg" alt="" width="26" height="22" />
                        <button type="button" onClick={() => mark(' ✦ ')} className="sreview-printer-s-ornaments-insertion-box-2">✦</button>
                        <button type="button" onClick={() => mark(' ❧ ')} className="sreview-printer-s-ornaments-insertion-box-2">❧</button>
                        <button type="button" onClick={() => mark(' * * * ')} className="sreview-printer-s-ornaments-insertion-box-3">* * *</button>
                      </div>
                    </div>
                    <div className="sreview-archival-studio-toolbar-box-2">
                      <div className="sreview-archival-studio-toolbar-box-2-box">
                        <span className="sreview-archival-studio-toolbar-box-2-box-text">COLOPHON EDITOR</span>
                      </div>
                      <button type="button" onClick={clearCritique} className="sreview-archival-studio-toolbar-box-2-box-2">
                        <img className="sreview-archival-studio-toolbar-box-2-box-2-box" src="/svg/container-s7r9yu.svg" alt="" width="12" height="12" />
                        <span className="sreview-archival-studio-toolbar-box-2-box-2-text">Clear</span>
                      </button>
                    </div>
                  </div>
                  <section className="sreview-main-textarea">
                    <p className="sreview-paragraph-2" ref={critiqueRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Critique" onInput={recount}>
                      <span className="sreview-the-river-as-destiny">## The River as Destiny: মানিক বন্দ্যোপাধ্যায়ের জলজ বাস্তবরীতি</span>
                      <span className="sreview-paragraph-2-text">{"'\u09aa\u09a6\u09cd\u09ae\u09be \u09a8\u09a6\u09c0\u09b0 \u09ae\u09be\u099d\u09bf' \u0995\u09c7\u09ac\u09b2 \u0995\u09c7\u09a4\u09c1\u09aa\u09c1\u09b0 \u0997\u09cd\u09b0\u09be\u09ae\u09c7\u09b0 \u099c\u09c7\u09b2\u09c7 \u099c\u09c0\u09ac\u09a8\u09c7\u09b0 \u09a8\u09bf\u09b0\u09cd\u09b2\u09bf\u09aa\u09cd\u09a4 \u0986\u0996\u09cd\u09af\u09be\u09a8 \u09a8\u09df; \u098f\u099f\u09bf \u09ac\u09be\u0982\u09b2\u09be \u0989\u09aa\u09a8\u09cd\u09af\u09be\u09b8\u09c7\u09b0 \u09b8\u09c7\u0987 \u09a6\u09c1\u09b0\u09cd\u09b2\u09ad \u09ae\u09c1\u09b9\u09c2\u09b0\u09cd\u09a4 "}{' '}<br className="soft-br" />{"\u09af\u09c7\u0996\u09be\u09a8\u09c7 \u09a8\u09a6\u09c0 \u0995\u09cb\u09a8\u09cb \u0986\u09b2\u0982\u0995\u09be\u09b0\u09bf\u0995 \u09aa\u099f\u09ad\u09c2\u09ae\u09bf \u09a5\u09be\u0995\u09c7 \u09a8\u09be, \u09a8\u09bf\u099c\u09c7\u0987 \u098f\u0995 \u09a8\u09bf\u09b7\u09cd\u09a0\u09c1\u09b0 \u0993 \u09aa\u09b0\u09ae \u09a8\u09bf\u09df\u09be\u09ae\u0995 \u099a\u09b0\u09bf\u09a4\u09cd\u09b0\u09c7 \u09b0\u09c2\u09aa\u09be\u09a8\u09cd\u09a4\u09b0\u09bf\u09a4 \u09b9\u09df\u0964 \u0995\u09c1\u09ac\u09c7\u09b0 "}{' '}<br className="soft-br" />মাঝির সংগ্রাম কোনো রোমান্টিক নৈসর্গিক ব্যাকুলতা নয়, বরং বেঁচে থাকার আদিমতম দ্বন্দ্ব।</span>
                      <span className="sreview-paragraph-2-text-2">{"\u09b9\u09cb\u09b8\u09c7\u09a8 \u09ae\u09bf\u09df\u09be\u09b0 '\u09ae\u09af\u09bc\u09a8\u09be \u09a6\u09cd\u09ac\u09c0\u09aa' \u0989\u09aa\u09a8\u09bf\u09ac\u09c7\u09b6\u09c7\u09b0 \u09ac\u09bf\u0995\u09b2\u09cd\u09aa \u09ad\u09c2\u0997\u09cb\u09b2\u09c7\u09b0 \u098f\u0995 \u09b0\u09b9\u09b8\u09cd\u09af\u09ae\u09df \u09b0\u09c2\u09aa\u0995\u0964 \u09ae\u09be\u09a8\u09bf\u0995 \u09ac\u09a8\u09cd\u09a6\u09cd\u09af\u09cb\u09aa\u09be\u09a7\u09cd\u09af\u09be\u09df \u098f\u0996\u09be\u09a8\u09c7 \u0995\u09cb\u09a8\u09cb "}{' '}<br className="soft-br" />{"\u0985\u09b2\u09c0\u0995 \u09b8\u09cd\u09ac\u09b0\u09cd\u0997 \u09b0\u099a\u09a8\u09be \u0995\u09b0\u09c7\u09a8\u09a8\u09bf, \u09ac\u09b0\u0982 \u098f\u0995 \u09a8\u09bf\u09b0\u09cd\u09ae\u09ae \u09b8\u09be\u09ae\u09be\u099c\u09bf\u0995 \u099a\u09c1\u0995\u09cd\u09a4\u09bf\u0995\u09c7 \u0989\u09a8\u09cd\u09ae\u09cb\u099a\u09a8 \u0995\u09b0\u09c7\u099b\u09c7\u09a8 \u09af\u09c7\u0996\u09be\u09a8\u09c7 \u09b8\u09cd\u09ac\u09be\u09a7\u09c0\u09a8\u09a4\u09be\u09b0 \u09ae\u09c2\u09b2\u09cd\u09af \u09a6\u09bf\u09a4\u09c7 \u09b9\u09df \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 "}{' '}<br className="soft-br" />বিচ্ছিন্নতার বিনিময়ে।</span>
                      <span className="sreview-paragraph-2-text-3">{"\u09ad\u09be\u09b7\u09be \u0993 \u09a1\u09be\u09df\u09be\u09b2\u09c7\u0995\u09cd\u099f\u09c7\u09b0 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0\u09c7 \u09ae\u09be\u09a8\u09bf\u0995 \u098f\u0995 \u0985\u09a8\u09a8\u09cd\u09af \u09b8\u0982\u09af\u09ae \u09a6\u09c7\u0996\u09bf\u09df\u09c7\u099b\u09c7\u09a8\u2014\u09af\u09c7\u0996\u09be\u09a8\u09c7 \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09ac\u09be\u0995\u09cd\u09af \u09af\u09c7\u09a8 \u099a\u09b0\u09c7\u09b0 \u0995\u09be\u09a6\u09be\u09ae\u09be\u099f\u09bf\u09a4\u09c7 \u0996\u09cb\u09a6\u09be\u0987 "}{' '}<br className="soft-br" />করা তাম্রলিপি।</span>
                    </p>
                  </section>
                  <div className="sreview-footer-metadata-strip-of-editor">
                    <div className="sreview-footer-metadata-strip-of-editor-box">
                      <div className="sreview-footer-metadata-strip-of-editor-box-box">
                        <span className="sreview-strong-2">{counts ? counts.words : 128}<span className="sreview-span-2">{" Words \u2022 "}</span>{counts ? counts.chars : 842}{' '}<br className="soft-br" /><span className="sreview-span-2">Characters</span></span>
                      </div>
                      <div className="sreview-footer-metadata-strip-of-editor-box-box-2">
                        <span className="sreview-footer-metadata-strip-of-editor-box-box-2-text">{"Reading Time: "}</span>
                        <div className="sreview-strong-3">
                          <span className="sreview-strong-3-text">~{counts ? Math.max(1, Math.round(counts.words / 200)) : 1}</span>
                          <span className="sreview-strong-3-text-2">min</span>
                        </div>
                      </div>
                    </div>
                    <div className="sreview-footer-metadata-strip-of-editor-box-2">
                      <div className="sreview-footer-metadata-strip-of-editor-box-2-box" />
                      <div className="sreview-footer-metadata-strip-of-editor-box-2-box-2">
                        <span className="sreview-footer-metadata-strip-of-editor-box-2-box-2-text">Draft synchronized to local patron cache (3:44{' '}<br className="soft-br" />PM)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sreview-fieldset-section-04-key-excerpts">
                  <div className="sreview-fieldset-section-04-key-excerpts-2" />
                  <div className="sreview-legend-4">
                    <div className="sreview-legend-4-box" />
                    <span className="sreview-section-04-key-excerpts-analytic">SECTION 04: KEY EXCERPTS & ANALYTICAL NOTES (নির্বাচিত উদ্ধৃতি ও বিশ্লেষণ)</span>
                  </div>
                  <div className="sreview-memorable-passage-citation">
                    <div className="sreview-memorable-passage-citation-box">
                      <label className="sreview-label-8" htmlFor="sreview-focal-excerpt-or-memorable-stanz">FOCAL EXCERPT OR MEMORABLE STANZA (মূল উদ্ধৃতি)</label>
                      <div className="sreview-memorable-passage-citation-box-box">
                        <span className="sreview-memorable-passage-citation-box-box-text">Include exact edition pagination</span>
                      </div>
                    </div>
                    <textarea id="sreview-focal-excerpt-or-memorable-stanz" name="focal-excerpt-or-memorable-stanz" className="sreview-textarea" defaultValue="&quot;ঈশ্বর থাকেন ওই গ্রামে, ভদ্রপল্লীতে। এখানে তাহাকে খুঁজিয়া পাওয়া যাইবে না।&quot;" />
                    <div className="sreview-memorable-passage-citation-box-2">
                      <input id="sreview-excerpt-citation" name="excerpt-citation" aria-label="Excerpt citation (chapter, edition, page)" className="sreview-input-9" defaultValue="Chapter IV, 1936 Folio Edition, p. 82" />
                      <input id="sreview-excerpt-theme" name="excerpt-theme" aria-label="Excerpt theme" className="sreview-input-10" defaultValue="Socio-spatial exclusion & class dialectic" />
                    </div>
                  </div>
                  <div className="sreview-companion-reading-suggestions">
                    <label className="sreview-label-4" htmlFor="sreview-companion-reading-recommendation">COMPANION READING RECOMMENDATION (সহপাঠ্য সুপারিশ)</label>
                    <input id="sreview-companion-reading-recommendation" name="companion-reading-recommendation" className="sreview-input-11" defaultValue="Tarashankar Bandopadhyay's 'Hansuli Banker Upakatha' & Adwaita Mallabarman's 'Titas Ekti Nadir Naam'" />
                  </div>
                </div>
                <div className="sreview-fieldset-section-05-patron-decla">
                  <div className="sreview-fieldset-section-05-patron-decla-2" />
                  <div className="sreview-legend-5">
                    <div className="sreview-legend-5-box" />
                    <span className="sreview-section-05-patron-declaration-ar">SECTION 05: PATRON DECLARATION & ARCHIVAL LICENSE (অঙ্গীকারপত্র)</span>
                  </div>
                  <label className="sreview-label-9 studio-clickable" htmlFor="sreview-affirmation">
                    <div className="sreview-input-12">
                      <input type="checkbox" id="sreview-affirmation" name="affirmation" required defaultChecked className="sreview-input-13 studio-check" />
                    </div>
                    <p className="sreview-paragraph-3">
                      <span className="sreview-solemn-patron-declaration-open-a">SOLEMN PATRON DECLARATION & OPEN ACCESS LICENSE (সদস্য অঙ্গীকারপত্র)</span>
                      <span className="sreview-paragraph-3-text">I solemnly certify that this review, critical marginalia, and contextual companion represent my original{' '}<br className="soft-br" />intellectual composition. I confirm that no full manuscript copy is enclosed herein. I grant Noholi Library & Press{' '}<br className="soft-br" />the non-exclusive perpetual right to catalog, transcribe, and gazette this appraisal across the public physical{' '}<br className="soft-br" />reading stacks, regional samayiki folios, and digital accession registers.</span>
                    </p>
                  </label>
                </div>
                <div className="sreview-action-bar">
                  <div className="sreview-action-bar-box">
                    <Link to="/book-reviews" className="sreview-action-bar-box-box">
                      <img className="sreview-action-bar-box-box-box" src="/svg/container-1pponx9.svg" alt="" width="11" height="11" />
                      <span className="sreview-action-bar-box-box-text">RETURN TO<br />REVIEWS</span>
                    </Link>
                    <button type="button" onClick={onSaveDraft} className="sreview-action-bar-box-box-2">
                      <img className="sreview-action-bar-box-box-2-box" src="/svg/container-vku2ii.svg" alt="" width="12" height="12" />
                      <span className="sreview-save-draft">SAVE DRAFT<br />(খসড়া রাখুন)</span>
                    </button>
                  </div>
                  <button type="submit" className="sreview-action-bar-box-2">
                    <div className="sreview-action-bar-box-2-box">
                      <span className="sreview-action-bar-box-2-box-text">SUBMIT FOR CURATORIAL<br />GAZETTING</span>
                    </div>
                    <div className="sreview-action-bar-box-2-box-2">
                      <span className="sreview-action-bar-box-2-box-2-text">(পর্যালোচনা জমা<br />দিন)</span>
                    </div>
                    <img className="sreview-action-bar-box-2-box-3" src="/svg/container-kmijix.svg" alt="" width="12" height="12" />
                  </button>
                </div>
                <Status status={status} />
              </form>
              <div className="sreview-aside-right-column-4-columns">
                <div className="sreview-archival-review-mandate">
                  <div className="sreview-horizontalborder-2">
                    <h2 className="sreview-heading-2">ARCHIVAL REVIEW MANDATE</h2>
                    <div className="sreview-horizontalborder-2-box">
                      <span className="sreview-horizontalborder-2-box-text">REG-NL-DOC</span>
                    </div>
                  </div>
                  <div className="sreview-archival-review-mandate-box">
                    <span className="sreview-archival-review-mandate-box-text">সমালোচনা নীতি ও নির্দেশিকা</span>
                  </div>
                  <ul className="sreview-list">
                    <li className="sreview-item">
                      <span className="sreview-item-text">01.</span>
                      <p className="sreview-paragraph-4">
                        <span className="sreview-strong-4">AUTHENTICITY & CRAFT</span>
                        <span className="sreview-paragraph-4-text">Appraisals must balance aesthetic appreciation{' '}<br className="soft-br" />with rigorous historical and stylistic discernment.{' '}<br className="soft-br" />Both praise and critique require textual citation.</span>
                      </p>
                    </li>
                    <li className="sreview-item">
                      <span className="sreview-item-text">02.</span>
                      <p className="sreview-paragraph-5">
                        <span className="sreview-strong-4">STRICT NON-PIRACY PROTOCOL</span>
                        <span className="sreview-paragraph-5-text">Patrons only submit critical analyses, reading{' '}<br className="soft-br" />companions, and short cited excerpts. Full book{' '}<br className="soft-br" />PDFs or complete manuscript distributions are{' '}<br className="soft-br" />categorically barred.</span>
                      </p>
                    </li>
                    <li className="sreview-item">
                      <span className="sreview-item-text">03.</span>
                      <p className="sreview-paragraph-6">
                        <span className="sreview-strong-4">CURATORIAL PEER ADJUDICATION</span>
                        <span className="sreview-paragraph-6-text">Every submission is read by two members of the{' '}<br className="soft-br" />Noholi Curatorial Guild within 3–5 library{' '}<br className="soft-br" />working days before inclusion into the permanent{' '}<br className="soft-br" />gazette.</span>
                      </p>
                    </li>
                    <li className="sreview-item-2">
                      <span className="sreview-item-2-text">04.</span>
                      <p className="sreview-paragraph-7">
                        <span className="sreview-strong-4">PRINT FOLIO SELECTION</span>
                        <span className="sreview-paragraph-7-text">Exemplary patron contributions are considered{' '}<br className="soft-br" />for the seasonal hand-pressed print run of the{' '}<br className="soft-br" /><span className="sreview-span-3">Noholi Samayiki Folio</span>.</span>
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="sreview-saved-drafts-ledger">
                  <div className="sreview-horizontalborder-3">
                    <h3 className="sreview-heading-3">SAVED DRAFTS LEDGER (খসড়া খাতা)</h3>
                    <div className="sreview-horizontalborder-3-box" />
                  </div>
                  <div className="sreview-active-draft-item">
                    <div className="sreview-active-draft-item-box">
                      <div className="sreview-active-draft-item-box-box">
                        <span className="sreview-active-draft-item-box-box-text">ACTIVE DRAFT</span>
                      </div>
                      <div className="sreview-active-draft-item-box-box">
                        <span className="sreview-active-draft-item-box-box-text-2">4 mins ago</span>
                      </div>
                    </div>
                    <h4 className="sreview-heading-4">Padma Nadir Majhi Critique</h4>
                    <div className="sreview-active-draft-item-box-2">
                      <span className="sreview-the-river-as-destiny-2">"The River as Destiny: মানিক বন্দ্যোপাধ্যায়ের জলজ বাস্তবরীতি..."</span>
                    </div>
                    <div className="sreview-horizontalborder-4">
                      <div className="sreview-horizontalborder-4-box">
                        <span className="sreview-horizontalborder-4-box-text">128 Words</span>
                      </div>
                      <div className="sreview-horizontalborder-4-box">
                        <span className="sreview-horizontalborder-4-box-text-2">Editing in Canvas</span>
                      </div>
                    </div>
                  </div>
                  <div className="sreview-previous-draft-item">
                    <div className="sreview-previous-draft-item-box">
                      <div className="sreview-previous-draft-item-box-box">
                        <span className="sreview-previous-draft-item-box-box-text">SAVED ARCHIVE</span>
                      </div>
                      <div className="sreview-previous-draft-item-box-box">
                        <span className="sreview-previous-draft-item-box-box-text-2">3 days ago</span>
                      </div>
                    </div>
                    <h4 className="sreview-heading-4-2">Lalshalu: Post-Colonial Religious{' '}<br className="soft-br" />Hegemony</h4>
                    <div className="sreview-previous-draft-item-box-2">
                      <span className="sreview-syed-waliullah-s-deconstruction">"Syed Waliullah's deconstruction of pastoral faith and</span>
                    </div>
                    <div className="sreview-horizontalborder-4">
                      <div className="sreview-horizontalborder-4-box">
                        <span className="sreview-horizontalborder-4-box-text-3">640 Words</span>
                      </div>
                      <button type="button" onClick={() => navigate('/member/dashboard')} className="sreview-horizontalborder-4-box-2">SWITCH DRAFT</button>
                    </div>
                  </div>
                  <Link to="/member/dashboard" className="sreview-saved-drafts-ledger-box">MANAGE COMPLETE DRAFT ARCHIVE (4)</Link>
                </div>
                <div className="sreview-curatorial-colophon-seal">
                  <div className="sreview-inner-hairline-border-for-tradit">
                    <div className="sreview-inner-hairline-border-for-tradit-box">
                      <span className="sreview-inner-hairline-border-for-tradit-box-text">❦</span>
                    </div>
                    <div className="sreview-blockquote">
                      <span className="sreview-blockquote-text">"গ্রন্থপাঠ কেবল অক্ষরের বিস্তার নয়, অতীতের{' '}<br className="soft-br" />সহিত পাঠকের নীরব সংলাপ।"</span>
                    </div>
                    <div className="sreview-inner-hairline-border-for-tradit-box-2">
                      <span className="sreview-inner-hairline-border-for-tradit-box-2-text">NOHOLI CURATORIAL DESK • EST. 2024</span>
                    </div>
                    <div className="sreview-inner-hairline-border-for-tradit-box">
                      <span className="sreview-inner-hairline-border-for-tradit-box-text-2">Dhaka Archival Depository • Division of{' '}<br className="soft-br" />Letters</span>
                    </div>
                  </div>
                </div>
                <div className="sreview-citation-assistance-drawer-mini">
                  <div className="sreview-citation-assistance-drawer-mini-box">
                    <img className="sreview-citation-assistance-drawer-mini-box-box" src="/svg/container-ue4nza.svg" alt="" width="15" height="15" />
                    <span className="sreview-citation-assistance-drawer-mini-box-text">NEED CITATION ASSISTANCE?</span>
                  </div>
                  <div className="sreview-citation-assistance-drawer-mini-box-2">
                    <span className="sreview-unsure-of-the-original-accession">Unsure of the original accession shelfmark or 1st{' '}<br className="soft-br" />edition imprint? Contact our Reading Room{' '}<br className="soft-br" />bibliographers at the Reference Desk.</span>
                  </div>
                  <Link to="/contact" className="sreview-citation-assistance-drawer-mini-box-3">INQUIRE WITH SENIOR ARCHIVIST →</Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
