import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { OverlaySelect, SOON_STUDIO, Status, saveDraft, useManuscript, useSubmission } from './memberStudio.jsx';
import './StudioWriting.css';

const MANUSCRIPT = "The river remembers no names, only the heavy wash of dark barges\nsliding through the monsoon twilight, water like poured lead.\nAt Sadarghat, the oars slap the tide with ancient indifference,\nand the aroma of drenched brick rises from the ghats of Lalbagh.\n\n\u2726 \u2726 \u2726\n\n\u0986\u09ae\u09b0\u09be \u099c\u09b2\u099c \u09ae\u09be\u099f\u09bf\u09b0 \u09ae\u09be\u09a8\u09c1\u09b7, \u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b6\u09cb\u0995 \u099c\u09ae\u09c7 \u09a5\u09be\u0995\u09c7 \u09a8\u09a6\u09c0\u0997\u09b0\u09cd\u09ad\u09c7;\n\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09ad\u09be\u0999\u09a8 \u098f\u0995 \u098f\u0995\u099f\u09bf \u0985\u09b2\u09bf\u0996\u09bf\u09a4 \u09ae\u09b9\u09be\u0995\u09be\u09ac\u09cd\u09af\u09c7\u09b0 \u0985\u09ac\u09b6\u09c7\u09b7\u0964\n\u09ac\u09c3\u09b7\u09cd\u099f\u09bf \u09a8\u09be\u09ae\u09b2\u09c7 \u09b6\u09b9\u09b0\u09c7\u09b0 \u09b8\u09ae\u09b8\u09cd\u09a4 \u0995\u09cb\u09b2\u09be\u09b9\u09b2 \u09a1\u09c1\u09ac\u09c7 \u09af\u09be\u09df \u09ad\u09c7\u099c\u09be \u0995\u09be\u09a0\u09c7\u09b0 \u09a7\u09cb\u0981\u09df\u09be\u09df,\n\u0986\u09b0 \u09ae\u09be\u099d\u09bf \u0995\u09c7\u09ac\u09b2 \u09a8\u09bf\u0983\u09b6\u09ac\u09cd\u09a6\u09c7 \u0997\u09c1\u09a8\u09c7 \u09a8\u09c7\u09df \u09a2\u09c7\u0989\u09df\u09c7\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09aa\u0964";
const ABSTRACT = "A reflective free-verse poem contemplating the shifting silt and monsoon currents of the Buriganga River as \nobserved from the Ahsan Manzil ghats at twilight.";
const GENRES = [
  { value: 'poetry', label: 'Poetry / কবিতা (Verse, Sonnet, Blank Verse)' },
  { value: 'short-story', label: 'Short Story / ছোটগল্প' },
  { value: 'excerpt', label: 'Novel Excerpt / উপন্যাসাংশ' },
  { value: 'creative-nonfiction', label: 'Creative Non-fiction / সৃজনশীল গদ্য' },
];
const CADENCES = [
  { value: '1-3', label: '1–3 Minutes (Short Lyric)' },
  { value: '3-5', label: '3–5 Minutes (Standard Lyric Verse)' },
  { value: '5-15', label: '5–15 Minutes (Short Prose)' },
  { value: '15+', label: '15+ Minutes (Extended Prose)' },
];
const REQUIRED = [
  ['title-of-work', 'title of work'],
  ['genre', 'literary form / genre'],
  ['cadence', 'estimated reading cadence'],
  ['manuscript', 'manuscript'],
  ['affirmation', 'patron declaration'],
];
const labelOf = (list, v) => list.find((o) => o.value === v)?.label;
const stanzas = (t) => t.split(/\n\s*\n/).filter((b) => b.trim()).length;

// Generated from Figma frame "Noholi Library — Member Writing Studio: Submit Creative Writing (After login)" (126:3268) by tools/gen_member.py, then hand-edited.
export default function StudioWriting() {
  const { member } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [genre, setGenre] = useState('poetry');
  const [cadence, setCadence] = useState('3-5');
  const [keywords, setKeywords] = useState('Monsoon, Buriganga, Old Dhaka, Riverine, Solitude, বর্ষা');
  const [abstract, setAbstract] = useState(ABSTRACT);
  // the design's ledger figures are shown until the visitor edits, then counted live
  const [edited, setEdited] = useState({ abstract: false, manuscript: false });
  const ms = useManuscript(MANUSCRIPT);
  const { status, setStatus, submit } = useSubmission(REQUIRED, SOON_STUDIO, { ok: false });
  const onSaveDraft = () =>
    setStatus(saveDraft(formRef.current, 'noholi.draft.creative-writing')
      ? { ok: true, text: 'Draft saved in this browser.' }
      : { ok: false, text: 'This browser would not store the draft.' });
  const addTag = (tag) => setKeywords((k) => (k.includes(tag) ? k : `${k.trim().replace(/,$/, '')}, ${tag}`));
  const tool = (kind) => {
    setEdited((v) => ({ ...v, manuscript: true }));
    ms.apply(kind);
  };

  return (
    <div className="swriting">
      <section className="swriting-main">
        <div className="swriting-main-box">
          <div className="swriting-archival-broadside-header-folio">
            <div className="swriting-archival-broadside-header-folio-box">
              <nav className="swriting-nav-folio-breadcrumb">
                <Link to="/" className="swriting-nav-folio-breadcrumb-box">HOME</Link>
                <div className="swriting-nav-folio-breadcrumb-box-2">
                  <span className="swriting-nav-folio-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="swriting-nav-folio-breadcrumb-box">WRITE UPS</Link>
                <div className="swriting-nav-folio-breadcrumb-box-2">
                  <span className="swriting-nav-folio-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/creative-writings" className="swriting-nav-folio-breadcrumb-box">CREATIVE WRITING</Link>
                <div className="swriting-nav-folio-breadcrumb-box-2">
                  <span className="swriting-nav-folio-breadcrumb-box-2-text">/</span>
                </div>
                <div className="swriting-nav-folio-breadcrumb-box-2">
                  <span className="swriting-nav-folio-breadcrumb-box-2-text-2">SUBMIT A CREATIVE WRITING</span>
                </div>
              </nav>
              <div className="swriting-registry-folio-code">
                <img className="swriting-registry-folio-code-box" src="/svg/container-1gywguk.svg" alt="" width="13" height="11" />
                <div className="swriting-registry-folio-code-box-2">
                  <span className="swriting-registry-folio-code-box-2-text">FOLIO REGISTRY: 2026 / LITERARY FOLIO TERM I • SEC-NL-CW</span>
                </div>
              </div>
            </div>
          </div>
          <section className="swriting-main-workstation-layout">
            <div className="swriting-header-title-curatorial-prologue">
              <div className="swriting-header-title-curatorial-prologue-box">
                <div className="swriting-header-title-curatorial-prologue-box-box" />
                <div className="swriting-header-title-curatorial-prologue-box-box-2">
                  <span className="swriting-member-writing-studio">MEMBER WRITING STUDIO • সাহিত্য ও সৃজনশীল রচনা প্রকাশনা</span>
                </div>
              </div>
              <div className="swriting-horizontalborder">
                <div className="swriting-horizontalborder-box">
                  <h1 className="swriting-heading-1">Submit Creative Writing</h1>
                  <div className="swriting-horizontalborder-box-box">
                    <span className="swriting-contribute-original-poetry-short">Contribute original poetry, short stories, literary excerpts, or dramatic sketches to Noholi Library’s public{' '}<br className="soft-br" />literary archives. All submissions undergo review by the literary curation committee before accession.</span>
                  </div>
                </div>
                <div className="swriting-horizontalborder-box-2">
                  <div className="swriting-background-border">
                    <div className="swriting-background-border-box">
                      <span className="swriting-background-border-box-text">DESPATCH STATUS</span>
                    </div>
                    <span className="swriting-background-border-text">FOLIO READY</span>
                  </div>
                </div>
              </div>
              <div className="swriting-patron-authentication-seal-inset">
                <div className="swriting-patron-authentication-seal-inset-box">
                  <div className="swriting-patron-authentication-seal-inset-box-box">
                    <img className="swriting-patron-authentication-seal-inset-box-box-box" src="/svg/background-1jg1x8i.svg" alt="" width="40" height="40" />
                    <div className="swriting-patron-authentication-seal-inset-box-box-box-2">
                      <div className="swriting-patron-authentication-seal-inset-box-box-box-2-box">
                        <div className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box">
                          <span className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box-text">AUTHENTICATED CONTRIBUTOR SESSION</span>
                        </div>
                        <div className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box">
                          <span className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box-text-2">•</span>
                        </div>
                        <div className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box">
                          <span className="swriting-patron-authentication-seal-inset-box-box-box-2-box-box-text-3">{`Card # ${member?.cardNumber}`}</span>
                        </div>
                      </div>
                      <div className="swriting-patron-authentication-seal-inset-box-box-box-2-box-2">
                        <span className="swriting-patron-authentication-seal-inset-box-box-box-2-box-2-text">{"Posting as authenticated member "}<span className="swriting-span">{member?.name}</span>{". Coming soon: online submissions are not open yet, so nothing is sent."}</span>
                      </div>
                    </div>
                  </div>
                  <div className="swriting-patron-authentication-seal-inset-box-box-2">
                    <div className="swriting-background-border-2">
                      <div className="swriting-background-border-2-box" />
                      <span className="swriting-background-border-2-text">LEDGER SYNCHRONIZED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="swriting-editorial-workspace-grid">
              <form id="swriting-form" ref={formRef} className="swriting-primary-composition-ledger-form" onSubmit={(e) => submit(e)} noValidate>
                <section className="swriting-section-01-literary-metadata">
                  <section className="swriting-section-title-tag">
                    <div className="swriting-section-title-tag-box">
                      <div className="swriting-section-title-tag-box-box">
                        <span className="swriting-section-title-tag-box-box-text">01</span>
                      </div>
                      <h2 className="swriting-heading-2">Literary Metadata & Classification</h2>
                    </div>
                    <div className="swriting-section-title-tag-box-2">
                      <span className="swriting-section-title-tag-box-2-text">[REQUIRED]</span>
                    </div>
                  </section>
                  <div className="swriting-section-01-literary-metadata-box">
                    <div className="swriting-title-of-work">
                      <label className="swriting-label" htmlFor="swriting-title-of-work"><span>{"TITLE OF WORK (LATIN SCRIPT) "}<span className="swriting-span-2">*</span></span></label>
                      <input id="swriting-title-of-work" name="title-of-work" required className="swriting-input" defaultValue="The Scent of Wet Clay at Buriganga" />
                      <div className="swriting-title-of-work-box">
                        <span className="swriting-provide-the-title-as-it-should-a">Provide the title as it should appear in the primary institutional catalog.</span>
                      </div>
                    </div>
                    <div className="swriting-title-of-work">
                      <label className="swriting-label" htmlFor="swriting-bengali-title-subtitle">BENGALI TITLE & SUBTITLE (বাংলা শিরোনাম ও উপশিরোনাম)</label>
                      <input id="swriting-bengali-title-subtitle" name="bengali-title-subtitle" className="swriting-input-2" defaultValue="বুড়িগঙ্গার ভিজে মাটির ঘ্রাণ" />
                      <div className="swriting-title-of-work-box">
                        <span className="swriting-optional-vernacular-parallel-dis">Optional vernacular parallel display for bilingual folio indexing.</span>
                      </div>
                    </div>
                    <div className="swriting-two-column-meta-genre-duration">
                      <div className="swriting-two-column-meta-genre-duration-box">
                        <label className="swriting-label" htmlFor="swriting-genre"><span>{"LITERARY FORM / GENRE "}<span className="swriting-span-2">*</span></span></label>
                        <div className="swriting-two-column-meta-genre-duration-box-box">
                          <OverlaySelect id="swriting-genre" name="genre" required value={genre} onChange={setGenre} options={GENRES} />
                          <div className="swriting-options">
                            <div className="swriting-options-box">
                              <span className="swriting-poetry">{labelOf(GENRES, genre)}</span>
                            </div>
                          </div>
                          <img className="swriting-two-column-meta-genre-duration-box-box-box" src="/svg/container-v9anv1.svg" alt="" width="8" height="20" />
                        </div>
                      </div>
                      <div className="swriting-two-column-meta-genre-duration-box">
                        <label className="swriting-label" htmlFor="swriting-cadence"><span>{"ESTIMATED READING CADENCE "}<span className="swriting-span-2">*</span></span></label>
                        <div className="swriting-two-column-meta-genre-duration-box-box">
                          <OverlaySelect id="swriting-cadence" name="cadence" required value={cadence} onChange={setCadence} options={CADENCES} />
                          <div className="swriting-options">
                            <div className="swriting-options-box">
                              <span className="swriting-3-5-minutes">{labelOf(CADENCES, cadence)}</span>
                            </div>
                          </div>
                          <img className="swriting-two-column-meta-genre-duration-box-box-box-2" src="/svg/container-gogduc.svg" alt="" width="17" height="20" />
                        </div>
                      </div>
                    </div>
                    <div className="swriting-thematic-tags-keywords">
                      <label className="swriting-label" htmlFor="swriting-thematic-keywords">THEMATIC KEYWORDS (SEPARATED BY COMMAS)</label>
                      <input id="swriting-thematic-keywords" name="thematic-keywords" className="swriting-input-3" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                      <div className="swriting-thematic-tags-keywords-box">
                        <div className="swriting-thematic-tags-keywords-box-box">
                          <span className="swriting-thematic-tags-keywords-box-box-text">COMMON FOLIO INDICES:</span>
                        </div>
                        <button type="button" onClick={() => addTag('#BengalRenaissance')} className="swriting-thematic-tags-keywords-box-box-2">#BengalRenaissance</button>
                        <div className="swriting-thematic-tags-keywords-box-box">
                          <span className="swriting-thematic-tags-keywords-box-box-text-2">•</span>
                        </div>
                        <button type="button" onClick={() => addTag('#DeltaicPoetics')} className="swriting-thematic-tags-keywords-box-box-2">#DeltaicPoetics</button>
                        <div className="swriting-thematic-tags-keywords-box-box">
                          <span className="swriting-thematic-tags-keywords-box-box-text-2">•</span>
                        </div>
                        <button type="button" onClick={() => addTag('#DhakaHeritage')} className="swriting-thematic-tags-keywords-box-box-2">#DhakaHeritage</button>
                      </div>
                    </div>
                    <div className="swriting-curatorial-abstract-synopsis">
                      <div className="swriting-curatorial-abstract-synopsis-box">
                        <label className="swriting-label-2" htmlFor="swriting-curatorial-abstract-synopsis">CURATORIAL ABSTRACT & SYNOPSIS (সারসংক্ষেপ)</label>
                        <div className="swriting-curatorial-abstract-synopsis-box-box">
                          <span className="swriting-curatorial-abstract-synopsis-box-box-text">{edited.abstract ? abstract.length : 142} / 300 Characters</span>
                        </div>
                      </div>
                      <textarea id="swriting-curatorial-abstract-synopsis" name="curatorial-abstract-synopsis" className="swriting-textarea" maxLength={300} value={abstract} onChange={(e) => { setAbstract(e.target.value); setEdited((v) => ({ ...v, abstract: true })); }} />
                    </div>
                  </div>
                </section>
                <section className="swriting-section-02-manuscript-compositio">
                  <section className="swriting-section-header">
                    <div className="swriting-section-header-box">
                      <div className="swriting-section-header-box-box">
                        <span className="swriting-section-header-box-box-text">02</span>
                      </div>
                      <h2 className="swriting-heading-2">Manuscript Composition Studio (মূল সাহিত্য রচনা)</h2>
                    </div>
                    <div className="swriting-section-header-box-2">
                      <div className="swriting-section-header-box-2-box" />
                      <div className="swriting-section-header-box-2-box-2">
                        <span className="swriting-section-header-box-2-box-2-text">LIVE FOLIO CANVAS</span>
                      </div>
                    </div>
                  </section>
                  <div className="swriting-editorial-literary-toolbar">
                    <div className="swriting-left-toolset">
                      <button type="button" onClick={() => tool('h2')} className="swriting-left-toolset-box">H2</button>
                      <button type="button" onClick={() => tool('h3')} className="swriting-left-toolset-box-2">H3</button>
                      <div className="swriting-left-toolset-box-3">
                        <div className="swriting-vertical-divider" />
                      </div>
                      <button type="button" onClick={() => tool('bold')} className="swriting-left-toolset-box-4">B</button>
                      <button type="button" onClick={() => tool('italic')} className="swriting-left-toolset-box-5">I</button>
                      <div className="swriting-left-toolset-box-3">
                        <div className="swriting-vertical-divider" />
                      </div>
                      <button type="button" onClick={() => tool('stanza')} className="swriting-stanza-poetry-specific-formatter">
                        <img className="swriting-stanza-poetry-specific-formatter-box" src="/svg/container-1x83t7k.svg" alt="" width="12" height="10" />
                        <div className="swriting-stanza-poetry-specific-formatter-box-2">
                          <span className="swriting-stanza-poetry-specific-formatter-box-2-text">STANZA BREAK</span>
                        </div>
                      </button>
                      <button type="button" onClick={() => tool('indent')} className="swriting-left-toolset-box-6">
                        <img className="swriting-left-toolset-box-6-box" src="/svg/container-19kzp7o.svg" alt="" width="11" height="11" />
                        <div className="swriting-left-toolset-box-6-box-2">
                          <span className="swriting-left-toolset-box-6-box-2-text">INDENT</span>
                        </div>
                      </button>
                      <img className="swriting-left-toolset-box-7" src="/svg/button-i6eoko.svg" alt="" width="28" height="28" />
                      <div className="swriting-left-toolset-box-3">
                        <div className="swriting-vertical-divider" />
                      </div>
                      <div className="swriting-ornamental-glyphs-for-bengal-pre">
                        <div className="swriting-ornamental-glyphs-for-bengal-pre-box">
                          <span className="swriting-ornamental-glyphs-for-bengal-pre-box-text">Ornaments:</span>
                        </div>
                        <button type="button" onClick={() => { setEdited((v) => ({ ...v, manuscript: true })); ms.setText((t) => `${t} ✦`); }} className="swriting-ornamental-glyphs-for-bengal-pre-box-2">✦</button>
                        <img className="swriting-ornamental-glyphs-for-bengal-pre-box-3" src="/svg/button-zucjdt.svg" alt="" width="20" height="17" />
                        <button type="button" onClick={() => { setEdited((v) => ({ ...v, manuscript: true })); ms.setText((t) => `${t} ❧`); }} className="swriting-ornamental-glyphs-for-bengal-pre-box-2">❧</button>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setEdited((v) => ({ ...v, manuscript: true })); ms.clear(); }} className="swriting-right-quick-actions">
                      <span className="swriting-right-quick-actions-text">CLEAR CANVAS</span>
                    </button>
                  </div>
                  <div className="swriting-volume-ledger-bar">
                    <div className="swriting-volume-ledger-bar-box">
                      <div className="swriting-volume-ledger-bar-box-box">
                        <span className="swriting-volume-ledger-bar-box-box-text">{edited.manuscript ? `CURRENT VOLUME: ${ms.words} WORDS • ${stanzas(ms.text)} STANZAS` : 'CURRENT VOLUME: 68 WORDS • 3 STANZAS'}</span>
                      </div>
                      <div className="swriting-volume-ledger-bar-box-box">
                        <span className="swriting-volume-ledger-bar-box-box-text-2">|</span>
                      </div>
                      <div className="swriting-volume-ledger-bar-box-box">
                        <span className="swriting-volume-ledger-bar-box-box-text-3">INK DENSITY: STANDARD FOLIO</span>
                      </div>
                    </div>
                    <div className="swriting-volume-ledger-bar-box-2">
                      <img className="swriting-volume-ledger-bar-box-2-box" src="/svg/container-tbzpb9.svg" alt="" width="11" height="11" />
                      <div className="swriting-volume-ledger-bar-box-2-box-2">
                        <span className="swriting-volume-ledger-bar-box-2-box-2-text">AUTOSAVED TO LEDGER (14:32)</span>
                      </div>
                    </div>
                  </div>
                  <div className="swriting-the-core-broadside-writing-canva">
                    <textarea ref={ms.ref} value={ms.text} onChange={(e) => { ms.setText(e.target.value); setEdited((v) => ({ ...v, manuscript: true })); }} required id="swriting-manuscript" name="manuscript" aria-label="Manuscript composition" className="swriting-textarea-2" />
                    <div className="swriting-subtle-deckle-plate-inner-border" />
                  </div>
                  <div className="swriting-canvas-footnote-format-directive">
                    <div className="swriting-canvas-footnote-format-directive-box">
                      <span className="swriting-canvas-footnote-format-directive-box-text">Guideline: Poems up to 150 lines; Short stories 1,000–5,000 words recommended.</span>
                    </div>
                    <div className="swriting-canvas-footnote-format-directive-box">
                      <span className="swriting-canvas-footnote-format-directive-box-text-2">UTF-8 BENGALI UNICODE COMPLIANT</span>
                    </div>
                  </div>
                </section>
                <section className="swriting-section-03-dedication-context-tr">
                  <section className="swriting-section-title-tag-2">
                    <div className="swriting-section-title-tag-2-box">
                      <div className="swriting-section-title-tag-2-box-box">
                        <span className="swriting-section-title-tag-2-box-box-text">03</span>
                      </div>
                      <h2 className="swriting-heading-2">Dedication, Context & Translation Apparatus</h2>
                    </div>
                    <div className="swriting-section-title-tag-2-box-2">
                      <span className="swriting-section-title-tag-2-box-2-text">[SCHOLARLY NOTES]</span>
                    </div>
                  </section>
                  <div className="swriting-section-03-dedication-context-tr-box">
                    <div className="swriting-section-03-dedication-context-tr-box-box">
                      <label className="swriting-label" htmlFor="swriting-epigraph-or-dedication">EPIGRAPH OR DEDICATION (উৎসর্গপত্র বা এপিগ্রাফ)</label>
                      <input id="swriting-epigraph-or-dedication" name="epigraph-or-dedication" className="swriting-input-4" defaultValue="Dedicated to the nocturnal river-dwellers of old Buriganga." />
                    </div>
                    <div className="swriting-section-03-dedication-context-tr-box-box-2">
                      <label className="swriting-label" htmlFor="swriting-translator-attribution-source-no">TRANSLATOR ATTRIBUTION & SOURCE NOTES (অনুবাদ ও উৎস স্বীকৃতি)</label>
                      <textarea id="swriting-translator-attribution-source-no" name="translator-attribution-source-no" className="swriting-textarea-3" defaultValue={"Bilingual verse composed concurrently in English and Bengali by the author, referencing colloquial boatmen \nterminology collected at Swarighat in July 2024."} />
                    </div>
                  </div>
                </section>
                <section className="swriting-section-04-authorial-affirmation">
                  <div className="swriting-horizontalborder-2">
                    <div className="swriting-horizontalborder-2-box">
                      <span className="swriting-horizontalborder-2-box-text">04</span>
                    </div>
                    <h2 className="swriting-heading-2">Authorial Affirmation & Archival License</h2>
                  </div>
                  <div className="swriting-section-04-authorial-affirmation-box">
                    <div className="swriting-input-5">
                      <input type="checkbox" id="swriting-affirmation" name="affirmation" required defaultChecked className="swriting-input-6 studio-check" />
                    </div>
                    <label className="swriting-label-3 studio-clickable" htmlFor="swriting-affirmation">
                      <span className="swriting-strong">SOLEMN PATRON DECLARATION & PERPETUAL NON-EXCLUSIVE LICENSE:</span>
                      <span className="swriting-label-3-text">I solemnly affirm that this creative work is my original composition and that I hold moral rights to its contents. I{' '}<br className="soft-br" />grant Noholi Library & Press perpetual, non-exclusive license to publish, display, and archive this work within the{' '}<br className="soft-br" />Noholi Literary Folios under open library reading access. I retain all independent copyright and moral authorship.</span>
                    </label>
                  </div>
                </section>
                <div className="swriting-submission-controls">
                  <Link to="/creative-writings" className="swriting-submission-controls-box">
                    <img className="swriting-submission-controls-box-box" src="/svg/container-8ykjfr.svg" alt="" width="11" height="11" />
                    <div className="swriting-submission-controls-box-box-2">
                      <span className="swriting-submission-controls-box-box-2-text">RETURN TO CREATIVE<br />WRITINGS</span>
                    </div>
                  </Link>
                  <div className="swriting-submission-controls-box-2">
                    <button type="button" onClick={onSaveDraft} className="swriting-submission-controls-box-2-box">SAVE AS<br />DRAFT</button>
                    <button type="submit" className="swriting-submission-controls-box-2-box-2">
                      <div className="swriting-submission-controls-box-2-box-2-box">
                        <span className="swriting-submission-controls-box-2-box-2-box-text">SUBMIT FOR LITERARY<br />REVIEW</span>
                      </div>
                      <div className="swriting-submission-controls-box-2-box-2-box-2">
                        <span className="swriting-submission-controls-box-2-box-2-box-2-text">•</span>
                      </div>
                      <div className="swriting-submission-controls-box-2-box-2-box-3">
                        <span className="swriting-submission-controls-box-2-box-2-box-3-text">রচনা জমা দিন<br />→</span>
                      </div>
                    </button>
                  </div>
                </div>
                <Status status={status} />
              </form>
              <div className="swriting-right-editorial-mandate-flow-sid">
                <div className="swriting-sidebar-card-1-literary-curation">
                  <div className="swriting-horizontalborder-3">
                    <div className="swriting-horizontalborder-3-box">
                      <span className="swriting-edict">EDICT • সংস্করণ নীতি</span>
                    </div>
                    <h3 className="swriting-heading-3">Literary Curation Mandate</h3>
                    <div className="swriting-horizontalborder-3-box">
                      <span className="swriting-horizontalborder-3-box-text">সাহিত্য নীতি ও গ্রহণযোগ্যতার মানদণ্ড</span>
                    </div>
                  </div>
                  <ul className="swriting-list">
                    <li className="swriting-item">
                      <div className="swriting-item-box">
                        <span className="swriting-item-box-text">§ 1</span>
                      </div>
                      <div className="swriting-item-box-2">
                        <span className="swriting-strong-2">Originality & Genesis: Work must be an{' '}<br className="soft-br" />authentic, previously unpublished original piece{' '}<br className="soft-br" />or an authorized translation bearing explicit donor{' '}<br className="soft-br" />attribution.</span>
                      </div>
                    </li>
                    <li className="swriting-item">
                      <div className="swriting-item-box">
                        <span className="swriting-item-box-text">§ 2</span>
                      </div>
                      <div className="swriting-item-box-3">
                        <span className="swriting-strong-3">Literary Forms: Verse, lyrical poetry, serialized{' '}<br className="soft-br" />fiction excerpts, or dramatic dialogues exploring{' '}<br className="soft-br" />historical, deltaic, or philosophical motifs.</span>
                      </div>
                    </li>
                    <li className="swriting-item-2">
                      <div className="swriting-item-2-box">
                        <span className="swriting-item-2-box-text">§ 3</span>
                      </div>
                      <div className="swriting-item-2-box-2">
                        <span className="swriting-strong-3">Tone & Sensibility: Prioritizing intellectual{' '}<br className="soft-br" />depth, refined aesthetic voice, and respectful{' '}<br className="soft-br" />cultural engagement.</span>
                      </div>
                    </li>
                    <li className="swriting-item">
                      <div className="swriting-item-box">
                        <span className="swriting-item-box-text">§ 4</span>
                      </div>
                      <div className="swriting-item-box-4">
                        <span className="swriting-strong-2">Exclusions: Strictly prohibits commercial{' '}<br className="soft-br" />advertorials, defamatory libel, polemics, or{' '}<br className="soft-br" />machine-synthesized prose devoid of patron{' '}<br className="soft-br" />craft.</span>
                      </div>
                    </li>
                  </ul>
                  <div className="swriting-horizontalborder-4">
                    <Link to="/rules" className="swriting-horizontalborder-4-box">
                      <div className="swriting-horizontalborder-4-box-box">
                        <span className="swriting-horizontalborder-4-box-box-text">VIEW COMPLETE LITERARY BYLAWS</span>
                      </div>
                      <img className="swriting-horizontalborder-4-box-box-2" src="/svg/container-iccidq.svg" alt="" width="10" height="10" />
                    </Link>
                  </div>
                </div>
                <div className="swriting-sidebar-card-2-curation-timeline">
                  <div className="swriting-horizontalborder-3">
                    <div className="swriting-horizontalborder-3-box">
                      <span className="swriting-curation-path">CURATION PATH</span>
                    </div>
                    <h3 className="swriting-heading-3">Review & Accession Flow</h3>
                  </div>
                  <div className="swriting-sidebar-card-2-curation-timeline-box">
                    <div className="swriting-continuous-hairline-track" />
                    <div className="swriting-step-1">
                      <div className="swriting-background-border-3">
                        <span className="swriting-background-border-3-text">1</span>
                      </div>
                      <div className="swriting-step-1-box">
                        <div className="swriting-step-1-box-box">
                          <span className="swriting-step-1-box-box-text">SUBMISSION DEPOSIT</span>
                        </div>
                        <div className="swriting-step-1-box-box">
                          <span className="swriting-step-1-box-box-text-2">Immediate ledger accession receipt and unique{' '}<br className="soft-br" />temporary archival reference token (NL-CW-2026-{' '}<br className="soft-br" />X).</span>
                        </div>
                      </div>
                    </div>
                    <div className="swriting-step-2">
                      <div className="swriting-background-border-3">
                        <span className="swriting-background-border-3-text">2</span>
                      </div>
                      <div className="swriting-step-2-box">
                        <div className="swriting-step-2-box-box">
                          <span className="swriting-step-2-box-box-text">CURATORIAL REVIEW</span>
                        </div>
                        <div className="swriting-step-2-box-box">
                          <span className="swriting-step-2-box-box-text-2">3 to 5 business days for editorial proofing, lyrical{' '}<br className="soft-br" />meter review, and catalog classification by library{' '}<br className="soft-br" />fellows.</span>
                        </div>
                      </div>
                    </div>
                    <div className="swriting-step-3">
                      <div className="swriting-step-3-box">
                        <span className="swriting-step-3-box-text">3</span>
                      </div>
                      <div className="swriting-step-3-box-2">
                        <div className="swriting-step-3-box-2-box">
                          <span className="swriting-step-3-box-2-box-text">PUBLIC GAZETTING</span>
                        </div>
                        <div className="swriting-step-3-box-2-box">
                          <span className="swriting-step-3-box-2-box-text-2">Permanently bound into the public reading folios{' '}<br className="soft-br" />and indexed into your patron research portfolio.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="swriting-sidebar-card-3-saved-drafts-ledg">
                  <div className="swriting-horizontalborder-5">
                    <h4 className="swriting-heading-4">SAVED DRAFTS (খসড়া খাতা)</h4>
                    <div className="swriting-horizontalborder-5-box">
                      <span className="swriting-horizontalborder-5-box-text">3 SLOTS FREE</span>
                    </div>
                  </div>
                  <div className="swriting-sidebar-card-3-saved-drafts-ledg-box">
                    <div className="swriting-background-verticalborder">
                      <div className="swriting-background-verticalborder-box">
                        <div className="swriting-background-verticalborder-box-box">
                          <span className="swriting-background-verticalborder-box-box-text">The Scent of Wet Clay...</span>
                        </div>
                        <div className="swriting-background-verticalborder-box-box">
                          <span className="swriting-background-verticalborder-box-box-text-2">Active</span>
                        </div>
                      </div>
                      <div className="swriting-background-verticalborder-box-2">
                        <span className="swriting-autosaved-3-mins-ago-68-words">Autosaved 3 mins ago • 68 words</span>
                      </div>
                    </div>
                    <div className="swriting-background-border-4">
                      <div className="swriting-background-border-4-box">
                        <div className="swriting-background-border-4-box-box">
                          <span className="swriting-background-border-4-box-box-text">Monsoon Diary — June 1988</span>
                        </div>
                        <div className="swriting-background-border-4-box-box">
                          <span className="swriting-background-border-4-box-box-text-2">2 days ago</span>
                        </div>
                      </div>
                      <div className="swriting-background-border-4-box-2">
                        <span className="swriting-short-story-1-420-words">Short Story • 1,420 words</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate('/member/dashboard')} className="swriting-sidebar-card-3-saved-drafts-ledg-box-2">MANAGE PATRON DRAFT VAULT</button>
                </div>
                <div className="swriting-sidebar-card-4-traditional-press">
                  <div className="swriting-background-border-5">
                    <div className="swriting-background-border-5-box">
                      <span className="swriting-background-border-5-box-text">নহলী</span>
                    </div>
                    <div className="swriting-background-border-5-box-2">
                      <span className="swriting-background-border-5-box-2-text">LITERARY PRESS</span>
                    </div>
                  </div>
                  <div className="swriting-sidebar-card-4-traditional-press-box">
                    <span className="swriting-sidebar-card-4-traditional-press-box-text">"যাহা কিছু কালজয়ী, তাহাই নহলীর অক্ষরশালায় চিরস্থায়ী রূপ পরিগ্রহ করে।"</span>
                  </div>
                  <div className="swriting-sidebar-card-4-traditional-press-box-2">
                    <span className="swriting-sidebar-card-4-traditional-press-box-2-text">BENGALI FOLIO TRADITION • EST. 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
