import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { OverlaySelect, SOON_STUDIO, Status, saveDraft, useManuscript, useSubmission } from './memberStudio.jsx';
import './StudioBlog.css';

const CATEGORIES = [
  { value: '', label: 'Select an Archival Folio...', disabled: true },
  { value: 'literary-essay', label: 'Literary Essay' },
  { value: 'city-chronicle', label: 'City Chronicle' },
  { value: 'reading-reflection', label: 'Reading Reflection' },
  { value: 'library-history', label: 'Library & Book History' },
];
const DURATIONS = [
  { value: '5-10', label: '5 – 10 Minutes (Brief Dispatch)' },
  { value: '10-15', label: '10 – 15 Minutes (Standard Essay)' },
  { value: '15-25', label: '15 – 25 Minutes (Long-form Treatise)' },
];
const REQUIRED = [
  ['article-title', 'article title'],
  ['category', 'category / folio'],
  ['abstract', 'abstract & registry summary'],
  ['manuscript', 'composition manuscript'],
  ['affirmation', 'authorial affirmation'],
];
const labelOf = (list, v) => list.find((o) => o.value === v)?.label;

// Generated from Figma frame "Noholi Library — Member Writing Studio: Compose a Blog (After login)" (126:1886) by tools/gen_member.py, then hand-edited.
export default function StudioBlog() {
  const { member } = useAuth();
  const formRef = useRef(null);
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('10-15');
  const [abstract, setAbstract] = useState('');
  const ms = useManuscript();
  const { status, setStatus, submit } = useSubmission(REQUIRED, SOON_STUDIO(), { ok: false });
  const onSaveDraft = () =>
    setStatus(saveDraft(formRef.current, 'noholi.draft.blog')
      ? { ok: true, text: 'Draft saved in this browser.' }
      : { ok: false, text: 'This browser would not store the draft.' });

  return (
    <div className="sblog">
      <section className="sblog-main--root">
        <div className="sblog-main-box">
          <div className="sblog-archival-breadcrumbs-studio-navi">
            <div className="sblog-archival-breadcrumbs-studio-navi-box">
              <nav className="sblog-nav-breadcrumb">
                <Link to="/" className="sblog-nav-breadcrumb-box">HOME</Link>
                <div className="sblog-nav-breadcrumb-box-2">
                  <span className="sblog-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="sblog-nav-breadcrumb-box">WRITE UPS</Link>
                <div className="sblog-nav-breadcrumb-box-2">
                  <span className="sblog-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="sblog-nav-breadcrumb-box">BLOGS</Link>
                <div className="sblog-nav-breadcrumb-box-2">
                  <span className="sblog-nav-breadcrumb-box-2-text">/</span>
                </div>
                <div className="sblog-nav-breadcrumb-box-2">
                  <span className="sblog-nav-breadcrumb-box-2-text-2">WRITE A BLOG POST</span>
                </div>
              </nav>
              <div className="sblog-archival-breadcrumbs-studio-navi-box-box">
                <div className="sblog-archival-breadcrumbs-studio-navi-box-box-box" />
                <span className="sblog-archival-breadcrumbs-studio-navi-box-box-text">FOLIO REGISTRY: 2026 / TERM I</span>
              </div>
            </div>
          </div>
          <div className="sblog-primary-page-header">
            <div className="sblog-primary-page-header-box">
              <div className="sblog-primary-page-header-box-box">
                <div className="sblog-primary-page-header-box-box-box">
                  <div className="sblog-primary-page-header-box-box-box-box">
                    <span className="sblog-member-writing-studio">MEMBER WRITING STUDIO</span>
                  </div>
                  <div className="sblog-primary-page-header-box-box-box-box">
                    <span className="sblog-primary-page-header-box-box-box-box-text">•</span>
                  </div>
                  <div className="sblog-primary-page-header-box-box-box-box-2">
                    <span className="sblog-primary-page-header-box-box-box-box-2-text">সদস্য রচনা ও প্রবন্ধ প্রকাশনা</span>
                  </div>
                </div>
                <h1 className="sblog-heading-1">Compose an Essay or Chronicle</h1>
                <div className="sblog-primary-page-header-box-box-box-2">
                  <span className="sblog-contribute-to-noholi-library-s-p">Contribute to Noholi Library’s public archives and literary journal. All submissions are reviewed{' '}<br className="soft-br" />by the editorial desk before being cataloged in the Chronicles.</span>
                </div>
              </div>
              <div className="sblog-patron-session-status-banner">
                <div className="sblog-patron-session-status-banner-box">
                  <img className="sblog-patron-session-status-banner-box-box" src="/svg/container-rfn1ah.svg" alt="" width="15" height="19" />
                  <div className="sblog-patron-session-status-banner-box-box-2">
                    <div className="sblog-patron-session-status-banner-box-box-2-box">
                      <span className="sblog-patron-session-status-banner-box-box-2-box-text">AUTHENTICATED CONTRIBUTOR SESSION</span>
                    </div>
                    <p className="sblog-paragraph">
                      <span className="sblog-paragraph-text">{"Posting as authenticated member: "}</span>
                      <span className="sblog-paragraph-text-2">{member?.name}</span>
                      <span className="sblog-paragraph-text-3">{`(Card # ${member?.cardNumber})`}</span>
                    </p>
                  </div>
                </div>
                <div className="sblog-patron-session-status-banner-box-2">
                  <span className="sblog-patron-session-status-banner-box-2-text">Coming soon: online submissions are not open yet.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="sblog-editorial-studio-desk-main-layou">
            <form id="sblog-form" ref={formRef} className="sblog-form" onSubmit={(e) => submit(e)} noValidate>
              <div className="sblog-left-main-studio-column">
                <section className="sblog-section-i-monograph-catalog-deta">
                  <div className="sblog-horizontalborder">
                    <div className="sblog-horizontalborder-box">
                      <span className="sblog-horizontalborder-box-text">01 / PRIMARY MONOGRAPH METADATA</span>
                    </div>
                    <div className="sblog-horizontalborder-box">
                      <span className="sblog-horizontalborder-box-text-2">Mandatory Archival Fields *</span>
                    </div>
                  </div>
                  <div className="sblog-field-1-article-title">
                    <p className="sblog-paragraph-2">
                      <label className="sblog-article-title" htmlFor="sblog-article-title">{"ARTICLE TITLE (\u09aa\u09cd\u09b0\u09ac\u09a8\u09cd\u09a7\u09c7\u09b0 \u09b6\u09bf\u09b0\u09cb\u09a8\u09be\u09ae) "}<span className="sblog-span">*</span></label>
                      <span className="sblog-paragraph-2-text">Latin script transcription</span>
                    </p>
                    <input id="sblog-article-title" name="article-title" required className="sblog-input" placeholder="e.g. The Architecture of Old Bookshops in Patuatuly" />
                  </div>
                  <div className="sblog-field-2-bengali-title-subtitle">
                    <p className="sblog-paragraph-2">
                      <label className="sblog-bengali-title-subtitle" htmlFor="sblog-bengali-title-subtitle">BENGALI TITLE / SUBTITLE (বিকল্প বা বাংলা শিরোনাম — ঐচ্ছিক)</label>
                      <span className="sblog-paragraph-2-text-2">বাংলা বর্ণমালা</span>
                    </p>
                    <input id="sblog-bengali-title-subtitle" name="bengali-title-subtitle" className="sblog-input-2" placeholder="e.g. পুরান ঢাকার বইপাড়ার স্মৃতি ও সাহিত্যচর্চার ইতিবৃত্ত" />
                  </div>
                  <div className="sblog-field-3-category-folio-selection">
                    <div className="sblog-field-3-category-folio-selection-box">
                      <label className="sblog-label" htmlFor="sblog-category"><span>{"CATEGORY / FOLIO SELECTION "}<span className="sblog-span">*</span></span></label>
                      <div className="sblog-field-3-category-folio-selection-box-box">
                        <OverlaySelect id="sblog-category" name="category" required value={category} onChange={setCategory} options={CATEGORIES} />
                        <div className="sblog-options">
                          <div className="sblog-options-box">
                            <span className="sblog-select-an-archival-folio">{labelOf(CATEGORIES, category)}</span>
                          </div>
                        </div>
                        <img className="sblog-field-3-category-folio-selection-box-box-box" src="/svg/container-95i62d.svg" alt="" width="10" height="24" />
                      </div>
                    </div>
                    <div className="sblog-field-3-category-folio-selection-box">
                      <label className="sblog-label" htmlFor="sblog-duration">ESTIMATED READING DURATION</label>
                      <div className="sblog-field-3-category-folio-selection-box-box">
                        <OverlaySelect id="sblog-duration" name="duration" value={duration} onChange={setDuration} options={DURATIONS} />
                        <div className="sblog-options">
                          <div className="sblog-options-box">
                            <span className="sblog-10-15-minutes">{labelOf(DURATIONS, duration)}</span>
                          </div>
                        </div>
                        <img className="sblog-field-3-category-folio-selection-box-box-box" src="/svg/container-95i62d.svg" alt="" width="10" height="24" />
                      </div>
                    </div>
                  </div>
                  <div className="sblog-field-4-abstract-summary">
                    <p className="sblog-paragraph-2">
                      <label className="sblog-label-2" htmlFor="sblog-abstract">{"ABSTRACT & REGISTRY SUMMARY "}<span className="sblog-span">*</span></label>
                      <span className="sblog-paragraph-2-text-3">{abstract.length} / 300 characters</span>
                    </p>
                    <textarea id="sblog-abstract" name="abstract" required maxLength={300} value={abstract} onChange={(e) => setAbstract(e.target.value)} className="sblog-textarea" placeholder={"A concise summary outlining your thesis, observations, or subject matter. This synopsis will \nappear on index ledger cards and search folios."} />
                  </div>
                </section>
                <section className="sblog-section-ii-main-editorial-compos">
                  <div className="sblog-background-horizontalborder">
                    <div className="sblog-background-horizontalborder-box">
                      <div className="sblog-background-horizontalborder-box-box">
                        <span className="sblog-02-composition-manuscript">02 / COMPOSITION MANUSCRIPT (মূল রচনা)</span>
                      </div>
                      <div className="sblog-background-horizontalborder-box-box">
                        <span className="sblog-background-horizontalborder-box-box-text">*</span>
                      </div>
                    </div>
                    <div className="sblog-live-word-char-count-ledger">
                      <div className="sblog-live-word-char-count-ledger-box">
                        <span className="sblog-live-word-char-count-ledger-box-text">{"CURRENT VOLUME: "}<span className="sblog-span-2">{ms.words}</span>{" WORDS"}</span>
                      </div>
                      <div className="sblog-live-word-char-count-ledger-box">
                        <span className="sblog-live-word-char-count-ledger-box-text-2">•</span>
                      </div>
                      <div className="sblog-live-word-char-count-ledger-box">
                        <span className="sblog-live-word-char-count-ledger-box-text-3">Unsaved changes</span>
                      </div>
                    </div>
                  </div>
                  <div className="sblog-archival-literary-toolbar">
                    <button type="button" onClick={() => ms.apply('h2')} className="sblog-archival-literary-toolbar-box">H2</button>
                    <button type="button" onClick={() => ms.apply('h3')} className="sblog-archival-literary-toolbar-box">H3</button>
                    <div className="sblog-archival-literary-toolbar-box-2">
                      <div className="sblog-vertical-divider" />
                    </div>
                    <button type="button" onClick={() => ms.apply('bold')} className="sblog-archival-literary-toolbar-box-3">B</button>
                    <button type="button" onClick={() => ms.apply('italic')} className="sblog-archival-literary-toolbar-box-4">I</button>
                    <div className="sblog-archival-literary-toolbar-box-2">
                      <div className="sblog-vertical-divider" />
                    </div>
                    <button type="button" onClick={() => ms.apply('quote')} className="sblog-archival-literary-toolbar-box-5">
                      <img className="sblog-archival-literary-toolbar-box-5-box" src="/svg/container-6pqxh8.svg" alt="" width="12" height="8" />
                      <div className="sblog-archival-literary-toolbar-box-5-box-2">
                        <span className="sblog-archival-literary-toolbar-box-5-box-2-text">QUOTE</span>
                      </div>
                    </button>
                    <button type="button" onClick={() => ms.apply('citation')} className="sblog-archival-literary-toolbar-box-5">
                      <img className="sblog-archival-literary-toolbar-box-5-box-3" src="/svg/container-srl5au.svg" alt="" width="10" height="12" />
                      <div className="sblog-archival-literary-toolbar-box-5-box-2">
                        <span className="sblog-archival-literary-toolbar-box-5-box-2-text">CITATION</span>
                      </div>
                    </button>
                    <button type="button" onClick={() => ms.apply('break')} className="sblog-archival-literary-toolbar-box-6">* * *</button>
                  </div>
                  <div className="sblog-background-horizontalborder-2">
                    <div className="sblog-background-horizontalborder-2-box">
                      <span className="sblog-background-horizontalborder-2-box-text">Composition guidelines: 800 — 2,500 words recommended for archival evaluation.</span>
                    </div>
                    <button type="button" onClick={ms.clear} className="sblog-background-horizontalborder-2-box-2">CLEAR CANVAS</button>
                  </div>
                  <div className="sblog-writing-manuscript-area">
                    <textarea ref={ms.ref} value={ms.text} onChange={(e) => ms.setText(e.target.value)} required id="sblog-manuscript" name="manuscript" aria-label="Composition manuscript" className="sblog-textarea-2" placeholder={"Begin drafting your dispatch here. Focus on considered observation, historical inquiry, or \npersonal reflections on reading craft...\n\nYou may use standard Markdown symbols for archival structure. Separate major \nthematic treatises with asterisk glyphs (* * *)."} />
                  </div>
                </section>
                <section className="sblog-section-iii-footnotes-references">
                  <div className="sblog-horizontalborder">
                    <div className="sblog-horizontalborder-box">
                      <span className="sblog-03-footnotes-bibliographic-refer">03 / FOOTNOTES & BIBLIOGRAPHIC REFERENCES (তথ্যসূত্র ও পাদটীকা)</span>
                    </div>
                    <div className="sblog-horizontalborder-box">
                      <span className="sblog-horizontalborder-box-text-2">Scholarly Apparatus — Optional</span>
                    </div>
                  </div>
                  <div className="sblog-section-iii-footnotes-references-box">
                    <label className="sblog-label-3" htmlFor="sblog-shelf-marks-primary-sources-edit">SHELF MARKS, PRIMARY SOURCES, EDITION RECORDS</label>
                    <textarea id="sblog-shelf-marks-primary-sources-edit" name="shelf-marks-primary-sources-edit" className="sblog-textarea-3" placeholder={"[1] Sen, Sukumar. 'Bangala Sahityer Itihas', Vol. II, Eastern Press, 1965, p. 114.\n[2] Noholi Special Collections, Accession Registry Box #Dhaka-1892-F."} />
                  </div>
                </section>
                <section className="sblog-section-iv-legal-declaration-ori">
                  <label className="sblog-label-4 studio-clickable" htmlFor="sblog-affirmation">
                    <div className="sblog-input-3">
                      <input type="checkbox" id="sblog-affirmation" name="affirmation" required className="sblog-input-4 studio-check" />
                    </div>
                    <div className="sblog-label-4-box">
                      <span className="sblog-strong">Authorial Affirmation:<span className="sblog-span-3">{" I solemnly affirm that this essay is my original work and that I hold moral rights to"}</span>{' '}<br className="soft-br" /><span className="sblog-span-3">its contents. I grant Noholi Library & Press perpetual, non-exclusive license to publish, index, digitize, and</span>{' '}<br className="soft-br" /><span className="sblog-span-3">{"maintain this work within the "}</span><span className="sblog-span-4">Noholi Chronicles</span><span className="sblog-span-3">{" journal repository under public reading access."}</span></span>
                    </div>
                  </label>
                </section>
              </div>
              <div className="sblog-aside-right-sidebar-column">
                <div className="sblog-card-1-archival-editorial-standa">
                  <div className="sblog-background-horizontalborder-3">
                    <div className="sblog-background-horizontalborder-3-box">
                      <span className="sblog-editorial-mandate">EDITORIAL MANDATE</span>
                    </div>
                    <h2 className="sblog-heading-2">Archival Editorial Standards</h2>
                    <span className="sblog-background-horizontalborder-3-text">সম্পাদনা নির্দেশিকা ও নীতিমালা</span>
                  </div>
                  <div className="sblog-card-1-archival-editorial-standa-box">
                    <div className="sblog-horizontalborder-2">
                      <div className="sblog-horizontalborder-2-box">
                        <span className="sblog-horizontalborder-2-box-text">§<br />1</span>
                      </div>
                      <div className="sblog-horizontalborder-2-box-2">
                        <span className="sblog-strong-2">Thematic Focus:<span className="sblog-span-3">{" Treatises must explore literary"}</span>{' '}<br className="soft-br" /><span className="sblog-span-3">craft, reading room history, regional folklore,</span>{' '}<br className="soft-br" /><span className="sblog-span-3">typography, or library experiences.</span></span>
                      </div>
                    </div>
                    <div className="sblog-horizontalborder-2">
                      <div className="sblog-horizontalborder-2-box-3">
                        <span className="sblog-horizontalborder-2-box-3-text">§<br />2</span>
                      </div>
                      <div className="sblog-horizontalborder-2-box-4">
                        <span className="sblog-strong-2">Word Length:<span className="sblog-span-3">{" 800 to 2,500 words. Brief"}</span>{' '}<br className="soft-br" /><span className="sblog-span-3">dispatches under 600 words should be</span>{' '}<br className="soft-br" /><span className="sblog-span-3">formulated as reading notes.</span></span>
                      </div>
                    </div>
                    <div className="sblog-horizontalborder-2">
                      <div className="sblog-horizontalborder-2-box-5">
                        <span className="sblog-horizontalborder-2-box-5-text">§<br />3</span>
                      </div>
                      <div className="sblog-horizontalborder-2-box-6">
                        <span className="sblog-strong-2">Tone & Rigor:<span className="sblog-span-3">{" Maintain an elevated,"}</span>{' '}<br className="soft-br" /><span className="sblog-span-3">contemplative, and scholastically grounded</span>{' '}<br className="soft-br" /><span className="sblog-span-3">narrative voice.</span></span>
                      </div>
                    </div>
                    <div className="sblog-card-1-archival-editorial-standa-box-box">
                      <div className="sblog-card-1-archival-editorial-standa-box-box-box">
                        <span className="sblog-card-1-archival-editorial-standa-box-box-box-text">§<br />4</span>
                      </div>
                      <div className="sblog-card-1-archival-editorial-standa-box-box-box-2">
                        <span className="sblog-strong-2">Exclusions:<span className="sblog-span-3">{" We do not catalog advertorial copy,"}</span>{' '}<br className="soft-br" /><span className="sblog-span-3">promotional releases, or partisan sectarian</span>{' '}<br className="soft-br" /><span className="sblog-span-3">polemics.</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="sblog-background-horizontalborder-4">
                    <Link to="/rules" className="sblog-background-horizontalborder-4-text">VIEW FULL PRESS BYLAWS →</Link>
                  </div>
                </div>
                <div className="sblog-card-2-review-publication-timeli">
                  <div className="sblog-horizontalborder-3">
                    <div className="sblog-horizontalborder-3-box">
                      <span className="sblog-archival-ingestion-flow">ARCHIVAL INGESTION FLOW</span>
                    </div>
                    <div className="sblog-horizontalborder-3-box">
                      <span className="sblog-review-publication-timeline">Review & Publication Timeline</span>
                    </div>
                  </div>
                  <div className="sblog-ordered-list">
                    <li className="sblog-item">
                      <div className="sblog-border">
                        <span className="sblog-border-text">1</span>
                      </div>
                      <div className="sblog-item-box">
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text">MANUSCRIPT DEPOSIT</span>
                        </div>
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text-2">Receipt acknowledged immediately by the{' '}<br className="soft-br" />curatorial desk registry.</span>
                        </div>
                      </div>
                    </li>
                    <li className="sblog-item">
                      <div className="sblog-border-2">
                        <span className="sblog-border-2-text">2</span>
                      </div>
                      <div className="sblog-item-box">
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text">DESK REVIEW & PROOF</span>
                        </div>
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text-2">3–5 working days for factual checks,{' '}<br className="soft-br" />orthography, and metadata tagging.</span>
                        </div>
                      </div>
                    </li>
                    <li className="sblog-item">
                      <div className="sblog-border-2">
                        <span className="sblog-border-2-text">3</span>
                      </div>
                      <div className="sblog-item-box">
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text">PUBLIC GAZETTING</span>
                        </div>
                        <div className="sblog-item-box-box">
                          <span className="sblog-item-box-box-text-2">Patron notified via email with assigned{' '}<br className="soft-br" />accession shelf stamp and live URL.</span>
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
                <div className="sblog-card-3-saved-drafts">
                  <div className="sblog-horizontalborder-4">
                    <div className="sblog-horizontalborder-4-box">
                      <span className="sblog-saved-drafts">SAVED DRAFTS (খসড়া সমূহ)</span>
                    </div>
                    <img className="sblog-horizontalborder-4-box-2" src="/svg/container-yk5yyy.svg" alt="" width="14" height="14" />
                  </div>
                  <div className="sblog-background-border">
                    <div className="sblog-background-border-box">
                      <div className="sblog-background-border-box-box">
                        <span className="sblog-background-border-box-box-text">ACTIVE LEDGER SESSION</span>
                      </div>
                      <div className="sblog-background-border-box-box">
                        <span className="sblog-background-border-box-box-text-2">Autosaved</span>
                      </div>
                    </div>
                    <div className="sblog-background-border-box-2">
                      <span className="sblog-untitled-manuscript">Untitled Manuscript</span>
                    </div>
                    <div className="sblog-background-border-box-3">
                      <span className="sblog-stored-in-patron-local-storage-2">Stored in Patron Local Storage • 2 min ago</span>
                    </div>
                  </div>
                  <div className="sblog-card-3-saved-drafts-box">
                    <button type="button" onClick={onSaveDraft} className="sblog-card-3-saved-drafts-box-box">SAVE AS PRIVATE DRAFT</button>
                    <Link to="/member/dashboard" className="sblog-card-3-saved-drafts-box-box-2">View all previous drafts in Patron Ledger</Link>
                  </div>
                </div>
                <div className="sblog-colophon-bookplate-stamp">
                  <span className="sblog-colophon-bookplate-stamp-text">নহলী সাময়িকী শাখা</span>
                  <div className="sblog-colophon-bookplate-stamp-box">
                    <div className="sblog-horizontal-divider" />
                  </div>
                  <span className="sblog-colophon-bookplate-stamp-text-2">“মুদ্রণ ও পাণ্ডুলিপির সেতুবন্ধনে গঠিত মুক্ত সাহিত্যকোষ।”</span>
                  <div className="sblog-colophon-bookplate-stamp-box-2">
                    <div className="sblog-colophon-bookplate-stamp-box-2-box">
                      <span className="sblog-colophon-bookplate-stamp-box-2-box-text">NOHOLI PRESS DESK</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="sblog-aside-bottom-action-bar">
            <div className="sblog-aside-bottom-action-bar-box">
              <Link to="/blogs" className="sblog-left-link">
                <img className="sblog-left-link-box" src="/svg/container-1dgel5f.svg" alt="" width="12" height="12" />
                <span className="sblog-left-link-text">CANCEL & RETURN TO BLOGS</span>
              </Link>
              <div className="sblog-right-action-group">
                <Status status={status} />
                <button type="button" onClick={onSaveDraft} className="sblog-right-action-group-box">SAVE DRAFT</button>
                <button type="submit" form="sblog-form" className="sblog-right-action-group-box-2">
                  <div className="sblog-right-action-group-box-2-box">
                    <span className="sblog-right-action-group-box-2-box-text">SUBMIT FOR EDITORIAL REVIEW</span>
                  </div>
                  <div className="sblog-right-action-group-box-2-box">
                    <span className="sblog-right-action-group-box-2-box-text-2">/ জমা দিন</span>
                  </div>
                  <img className="sblog-right-action-group-box-2-box-2" src="/svg/container-kmijix.svg" alt="" width="12" height="12" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
