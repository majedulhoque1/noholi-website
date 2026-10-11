import { Link } from 'react-router-dom';
import { useArticleActions } from '../articleActions.js';
import './CreativeWriting.css';

// Generated from Figma frame "Noholi Library — Creative Writing: The Scent of Wet Clay at Buriganga (Before login)" (158:1262) by tools/gen.py, then hand-edited.
export default function CreativeWriting() {
  const act = useArticleActions();
  return (
    <div className="writing">
      <section className="writing-main">
        <div className="writing-main-box">
          <div className="writing-archival-broadside-header-band">
            <div className="writing-archival-broadside-header-band-box">
              <nav className="writing-nav-breadcrumb">
                <Link to="/" className="writing-nav-breadcrumb-box">HOME</Link>
                <div className="writing-nav-breadcrumb-box-2">
                  <span className="writing-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/blogs" className="writing-nav-breadcrumb-box">WRITE UPS</Link>
                <div className="writing-nav-breadcrumb-box-2">
                  <span className="writing-nav-breadcrumb-box-2-text">/</span>
                </div>
                <Link to="/creative-writings" className="writing-nav-breadcrumb-box">CREATIVE WRITING</Link>
                <div className="writing-nav-breadcrumb-box-2">
                  <span className="writing-nav-breadcrumb-box-2-text">/</span>
                </div>
                <div className="writing-nav-breadcrumb-box-3">
                  <span className="writing-nav-breadcrumb-box-3-text">THE SCENT OF WET CLAY AT BURIGANGA</span>
                </div>
              </nav>
              <div className="writing-background-border">
                <img className="writing-background-border-box" src="/svg/container-510ph8.svg" alt="" width="13" height="13" />
                <div className="writing-background-border-box-2">
                  <span className="writing-background-border-box-2-text">FOLIO NO. 2026/CW-019 • ACCESSION REGISTERED</span>
                </div>
              </div>
            </div>
          </div>
          <div className="writing-primary-broadside-header-section">
            <div className="writing-primary-broadside-header-section-box">
              <div className="writing-primary-broadside-header-section-box-box">
                <div className="writing-background-border-2">
                  <div className="writing-background-border-2-box">
                    <span className="writing-poetry-regional-literary-folio">POETRY • REGIONAL LITERARY FOLIO (বর্ষার কবিতা)</span>
                  </div>
                </div>
                <h1 className="writing-heading-1">The Scent of Wet Clay at Buriganga</h1>
                <div className="writing-primary-broadside-header-section-box-box-box">
                  <span className="writing-primary-broadside-header-section-box-box-box-text">বুড়িগঙ্গার ভিজে মাটির ঘ্রাণ ও পুরনো নদীর গান</span>
                </div>
                <div className="writing-primary-broadside-header-section-box-box-box-2">
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-text">{"Composed by "}<span className="writing-span">Anwara Begum</span>{" "}<span className="writing-span-2">(Patron Fellow #NL-77104)</span></span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-2">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-2-text">•</span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-3">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-3-text">Gazetted February 18, 2026</span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-4">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-4-text">•</span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-5">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-5-text">3 min read</span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-6">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-6-text">•</span>
                  </div>
                  <div className="writing-primary-broadside-header-section-box-box-box-2-box-7">
                    <span className="writing-primary-broadside-header-section-box-box-box-2-box-7-text">Stanza Count: VI</span>
                  </div>
                </div>
              </div>
              <div className="writing-broadside-print-scholarly-action">
                <button type="button" className="writing-broadside-print-scholarly-action-box" onClick={act.print}>
                  <img className="writing-broadside-print-scholarly-action-box-box" src="/svg/container-mp0vip.svg" alt="" width="14" height="12" />
                  <div className="writing-broadside-print-scholarly-action-box-box-2">
                    <span className="writing-broadside-print-scholarly-action-box-box-2-text">PRINT BROADSIDE</span>
                  </div>
                </button>
                <button type="button" className="writing-broadside-print-scholarly-action-box-2" onClick={act.cite} title="Copy a citation">
                  <img className="writing-broadside-print-scholarly-action-box-2-box" src="/svg/container-1ngv1yq.svg" alt="" width="12" height="8" />
                  <div className="writing-broadside-print-scholarly-action-box-2-box-2">
                    <span className="writing-cite-verses" aria-live="polite">{act.flash === 'cite' ? 'COPIED ✓' : 'CITE VERSES'}</span>
                  </div>
                </button>
                <button type="button" className="writing-broadside-print-scholarly-action-box-2" onClick={act.toggleSave} aria-pressed={act.saved} title={act.saved ? 'Saved to this browser' : 'Save'}>
                  <img className="writing-broadside-print-scholarly-action-box-2-box-3" src="/svg/container-t3syeg.svg" alt="" width="11" height="12" />
                  <div className="writing-broadside-print-scholarly-action-box-2-box-2">
                    <span className="writing-broadside-print-scholarly-action-box-2-box-2-text" aria-live="polite">{act.saved ? 'সংরক্ষিত ✓' : 'সংরক্ষণ'}</span>
                  </div>
                </button>
                <button type="button" className="writing-broadside-print-scholarly-action-box-2" onClick={act.share}>
                  <img className="writing-broadside-print-scholarly-action-box-2-box-4" src="/svg/container-rwpkra.svg" alt="" width="12" height="14" />
                  <div className="writing-broadside-print-scholarly-action-box-2-box-2">
                    <span className="writing-broadside-print-scholarly-action-box-2-box-2-text-2" aria-live="polite">{act.flash === 'share' ? 'LINK COPIED ✓' : 'SHARE FOLIO'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="writing-3-column-archival-layout-left-ma">
            <div className="writing-3-column-archival-layout-left-ma-box">
              <div className="writing-aside-left-marginalia-classifica">
                <div className="writing-background-border-3">
                  <div className="writing-horizontalborder">
                    <div className="writing-horizontalborder-box">
                      <span className="writing-horizontalborder-box-text">FOLIO INDEXING</span>
                    </div>
                    <img className="writing-horizontalborder-box-2" src="/svg/container-rtc7wv.svg" alt="" width="14" height="14" />
                  </div>
                  <div className="writing-background-border-3-box">
                    <div className="writing-background-border-3-box-box">
                      <span className="writing-classification">CLASSIFICATION</span>
                    </div>
                    <div className="writing-background-border-3-box-box">
                      <span className="writing-bd-lit-891-441">BD-LIT / 891.441</span>
                    </div>
                    <div className="writing-background-border-3-box-box">
                      <span className="writing-bengali-poetry-riverine-epics">Bengali Poetry • Riverine Epics</span>
                    </div>
                  </div>
                  <div className="writing-horizontalborder-2">
                    <div className="writing-horizontalborder-2-box">
                      <span className="writing-metric-form">METRIC & FORM</span>
                    </div>
                    <div className="writing-horizontalborder-2-box">
                      <span className="writing-free-verse">Free Verse / আধুনিক মুক্তক ছন্দ</span>
                    </div>
                    <div className="writing-horizontalborder-2-box">
                      <span className="writing-alternating-dual-tongue-parallel">Alternating dual-tongue parallel<br />translation with assonant Bengali end-<br />rhymes.</span>
                    </div>
                  </div>
                  <div className="writing-horizontalborder-2">
                    <div className="writing-horizontalborder-2-box">
                      <span className="writing-thematic-codices">THEMATIC CODICES</span>
                    </div>
                    <div className="writing-horizontalborder-2-box-2">
                      <div className="writing-background-border-4">
                        <span className="writing-background-border-4-text">BURIGANGA</span>
                      </div>
                      <div className="writing-background-border-5">
                        <span className="writing-background-border-5-text">MONSOON DHAKA</span>
                      </div>
                      <div className="writing-background-border-6">
                        <span className="writing-background-border-6-text">SADARGHAT</span>
                      </div>
                      <div className="writing-background-border-7">
                        <span className="writing-background-border-7-text">URBAN SOLITUDE</span>
                      </div>
                    </div>
                  </div>
                  <div className="writing-horizontalborder-3">
                    <div className="writing-horizontalborder-3-box">
                      <span className="writing-curatorial-stem">CURATORIAL STEM</span>
                    </div>
                    <div className="writing-horizontalborder-3-box-2">
                      <span className="writing-horizontalborder-3-box-2-text">{"Curated under the "}</span>
                      <div className="writing-emphasis">
                        <span className="writing-emphasis-text">Monsoon Periodical</span>
                        <span className="writing-emphasis-text-2">Preservation Scheme</span>
                      </div>
                      <span className="writing-horizontalborder-3-box-2-text-2">{" of Noholi Library."}</span>
                      <span className="writing-horizontalborder-3-box-2-text-3">Certified for public scholarly<br />recitation and broadside reprinting.</span>
                    </div>
                  </div>
                  <div className="writing-woodcut-stamp-emblem">
                    <div className="writing-woodcut-stamp-emblem-box">
                      <span className="writing-woodcut-stamp-emblem-box-text">NOHOLI LITERARY REGISTRY</span>
                    </div>
                    <div className="writing-woodcut-stamp-emblem-box">
                      <span className="writing-woodcut-stamp-emblem-box-text-2">Authentic Member Folio • Sealed 2026</span>
                    </div>
                  </div>
                </div>
                <div className="writing-archival-audio-reading-card">
                  <div className="writing-archival-audio-reading-card-box">
                    <img className="writing-archival-audio-reading-card-box-box" src="/svg/container-1jaouhr.svg" alt="" width="14" height="15" />
                    <div className="writing-archival-audio-reading-card-box-box-2">
                      <span className="writing-archival-audio-reading-card-box-box-2-text">SPOKEN BROADSIDE</span>
                    </div>
                  </div>
                  <div className="writing-archival-audio-reading-card-box-2">
                    <span className="writing-recited-by-the-poet-at-the-old-d">Recited by the poet at the Old Dhaka<br />Waterfront Colloquium, Asharh 1432.</span>
                  </div>
                  <div className="writing-background-border-8">
                    <img className="writing-play-recording" src="/svg/button-play-recording-1p0ahkc.svg" alt="" width="32" height="32" />
                    <div className="writing-background-border-8-box">
                      <div className="writing-background-border-8-box-box">
                        <div className="writing-background-border-8-box-box-box" />
                      </div>
                    </div>
                    <div className="writing-background-border-8-box-2">
                      <span className="writing-background-border-8-box-2-text">01:42</span>
                    </div>
                  </div>
                </div>
              </div>
              <article className="writing-article-center-poetry-column-boo">
                <div className="writing-authorial-introductory-note-in-b">
                  <div className="writing-authorial-introductory-note-in-b-box">
                    <span className="writing-these-lines-were-jotted-down-bet">"These lines were jotted down between thunderclaps at the Lalkuthi ghat in June. The<br />water had turned the color of brewed liquor, and the potter-boats from Rayerbazar<br />were unloading fresh terracotta before the tempest broke."</span>
                  </div>
                  <div className="writing-authorial-introductory-note-in-b-box">
                    <span className="writing-a-b-journal-entry-ghat-no-4">— A. B., JOURNAL ENTRY, GHAT NO. 4</span>
                  </div>
                </div>
                <div className="writing-the-poem-container">
                  <section className="writing-stanza-i-with-serif-dropcap">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">I.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">The Loam & Silt</span>
                    </div>
                    <div className="writing-stanza-i-with-serif-dropcap-box">
                      <p className="writing-paragraph">
                        <span className="writing-paragraph-text">T</span>
                        <span className="writing-paragraph-text-2">he river does not weep; it only deepens,<br />carrying down the loam of eastern hills,</span>
                        <span className="writing-paragraph-text-3">past steamers resting on the silted bank,<br />where old tea stalls exhale their morning cloves.</span>
                      </p>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">নদী তো কাঁদে না; কেবল তার নীরবতা ঘনিয়ে আসে,<br />পলিমাটির ভেজা সুবাস মেখে ভেসে যায় পুরনো নাও,<br />স্টিমারের বুকে লেগে থাকা শ্যাওলা আর জং ধরা নোঙরে<br />চা-দোকানের ধোঁয়ায় মেশে লবঙ্গের প্রাচীন ঘ্রাণ।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="writing-ornamental-asterism">
                    <div className="writing-horizontal-divider" />
                    <div className="writing-ornamental-asterism-box">
                      <span className="writing-ornamental-asterism-box-text">❖</span>
                    </div>
                    <div className="writing-horizontal-divider" />
                  </div>
                  <section className="writing-stanza-ii">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">II.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">The Zinc Roofs of Sadarghat</span>
                    </div>
                    <div className="writing-stanza-ii-box">
                      <div className="writing-stanza-ii-box-box">
                        <span className="writing-a-zinc-roof-rattles-under-cloudb">A zinc roof rattles under cloudburst drumming,<br />the boatman winds his coir upon the bollard;<br />all Dhaka turns to water, brick by brick,<br />dissolving centuries into grey ripples.</span>
                      </div>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">টিনের চালে হঠাৎ নামে ঝমঝম বাদল-ধারাপাত,<br />মাঝি তার ভিজে কাছি শক্ত করে বাঁধে ঘাটের খুঁটিতে;<br />ইট-পাথরের এই শহর যেন একটু একটু করে জলে ভেসে যায়,<br />শতাব্দীর ক্লান্ত স্মৃতি মিলিয়ে যায় ধূসর তরঙ্গে।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="writing-ornamental-asterism">
                    <div className="writing-horizontal-divider" />
                    <div className="writing-ornamental-asterism-box">
                      <span className="writing-ornamental-asterism-box-text">✦</span>
                    </div>
                    <div className="writing-horizontal-divider" />
                  </div>
                  <section className="writing-stanza-iii">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">III.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">Paper Boats of Farashganj</span>
                    </div>
                    <div className="writing-stanza-iii-box">
                      <div className="writing-stanza-iii-box-box">
                        <span className="writing-small-boys-fold-yesterday-s-damp">Small boys fold yesterday’s damp gazettes<br />into triangular prows that brave the gutters;<br />ink bleeds headline news of vanished empires<br />into the dark swell under Babubazar.</span>
                      </div>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">ফরাশগঞ্জের গলিতে শিশুরা ভেজা খবরের কাগজে বানায় নাও,<br />ছুটে চলে সে কাগজ-তরী নর্দমার কূল ছাপিয়ে;<br />কালির হরফে লেখা পুরোনো সাম্রাজ্যের খবর<br />মিশে যায় বাবুবাজারের ঘোলা জলের অতলে।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="writing-figure-pull-quote-scholarly-foli">
                    <div className="writing-blockquote">
                      <span className="writing-words-written-on-paper-outlive-t">“Words written on paper outlive the river that<br />gave them birth.”</span>
                    </div>
                    <div className="writing-figcaption">
                      <div className="writing-figcaption-box">
                        <span className="writing-stanza-iv-inscription-noholi-lib">— STANZA IV INSCRIPTION • NOHOLI LIBRARY BROADSIDE</span>
                      </div>
                    </div>
                  </div>
                  <section className="writing-stanza-iv">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">IV.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">The Potter’s Kiln</span>
                    </div>
                    <div className="writing-stanza-iv-box">
                      <div className="writing-stanza-iv-box-box">
                        <span className="writing-the-unbaked-earthen-jugs-upon-th">The unbaked earthen jugs upon the barge<br />drink up the sky before they bake or shatter;<br />their smell is ancient: wet riverbank clay,<br />which remembers footsteps we forgot we left.</span>
                      </div>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">মাটির কাঁচা কলসগুলো নৌকার পাটাতনে শুয়ে<br />পুড়ে শক্ত হওয়ার আগেই শুষে নেয় আকাশের বৃষ্টি;<br />তাদের নিঃশ্বাসে ভেসে আসে ভিজে মাটির অনন্ত ঘ্রাণ—<br />যে মাটি মনে রাখে আমাদের ভুলে যাওয়া সব পদচিহ্ন।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="writing-ornamental-asterism">
                    <div className="writing-horizontal-divider" />
                    <div className="writing-ornamental-asterism-box">
                      <span className="writing-ornamental-asterism-box-text">❖</span>
                    </div>
                    <div className="writing-horizontal-divider" />
                  </div>
                  <section className="writing-stanza-v">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">V.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">The Evening Azan Across Silt</span>
                    </div>
                    <div className="writing-stanza-v-box">
                      <div className="writing-stanza-v-box-box">
                        <span className="writing-dusk-wraps-the-minarets-in-musli">Dusk wraps the minarets in muslin haze;<br />the calls to prayer scatter like grain over water.<br />The rivermen fold their palms against their chests,<br />listening to water strike the blackened hulls.</span>
                      </div>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">মসলিন কুয়াশায় ঢেকে যায় সূর্যাস্তের মিনার,<br />জলের ওপর দানার মতো ছড়িয়ে পড়ে সাঁঝের আজান।<br />মাঝিরা হাত বাঁধে বুকের ওপর,<br />কালো নৌকার গায়ে ঢেউয়ের অবিরাম আঘাত শুনে।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="writing-ornamental-asterism">
                    <div className="writing-horizontal-divider" />
                    <div className="writing-ornamental-asterism-box">
                      <span className="writing-ornamental-asterism-box-text">✦</span>
                    </div>
                    <div className="writing-horizontal-divider" />
                  </div>
                  <section className="writing-stanza-vi">
                    <div className="writing-paragraph-horizontalborder">
                      <span className="writing-paragraph-horizontalborder-text">VI.</span>
                      <span className="writing-paragraph-horizontalborder-text-2">The Eternal Return</span>
                    </div>
                    <div className="writing-stanza-vi-box">
                      <div className="writing-stanza-vi-box-box">
                        <span className="writing-we-shall-come-back-here-when-our">We shall come back here when our names are gone,<br />not as poets, nor as those who built or fled,<br />but as that sharp, sweet odor of rain on silt,<br />when Buriganga rises once again in spring.</span>
                      </div>
                      <div className="writing-verticalborder">
                        <div className="writing-verticalborder-box">
                          <span className="writing-verticalborder-box-text">আমরা ফিরে আসব এই কূলে, যখন মুছে যাবে আমাদের নাম,<br />কবি হয়ে নয়, নগর নির্মাতা কিংবা পলাতক নাগরিক হয়েও নয়—<br />কেবল পলিমাটিতে প্রথম বৃষ্টির সেই তীব্র, সুমধুর সৌরভ হয়ে,<br />যখন বুড়িগঙ্গা নতুন বর্ষায় আবারও দু’কূল ছাপিয়ে জাগবে।</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="writing-archival-colophon-mark">
                  <div className="writing-background-border-9">
                    <div className="writing-background-border-9-box">
                      <span className="writing-background-border-9-box-text">COLOPHON OF THE ORIGINAL BROADSIDE</span>
                    </div>
                    <div className="writing-background-border-9-box-2">
                      <span className="writing-background-border-9-box-2-text">Set in Newsreader and EB Garamond with Bengali typographic alignments in<br />accordance with the 1920s printing presses of Dacca. Printed at the Noholi<br />Press Folio Room for permanent catalog deposit.</span>
                    </div>
                    <div className="writing-background-border-9-box-3">
                      <span className="writing-background-border-9-box-3-text">NL-FOLIO-REG-2026-891-B72</span>
                    </div>
                  </div>
                </div>
              </article>
              <div className="writing-aside-right-column-ledger-detail">
                <div className="writing-archival-ledger-card">
                  <div className="writing-background-horizontalborder">
                    <div className="writing-heading-3">
                      <img className="writing-heading-3-box" src="/svg/container-14512ma.svg" alt="" width="15" height="11" />
                      <div className="writing-heading-3-box-2">
                        <span className="writing-heading-3-box-2-text">FOLIO REGISTRY</span>
                      </div>
                    </div>
                  </div>
                  <div className="writing-archival-ledger-card-box">
                    <div className="writing-archival-ledger-card-box-box">
                      <div className="writing-archival-ledger-card-box-box-box">
                        <span className="writing-archived-in">ARCHIVED IN</span>
                      </div>
                      <div className="writing-archival-ledger-card-box-box-box">
                        <span className="writing-archival-ledger-card-box-box-box-text">বর্ষ ২০২৩/২০২৬ সংকলন</span>
                      </div>
                      <div className="writing-archival-ledger-card-box-box-box">
                        <span className="writing-anthology-of-riverine-works">Anthology of Riverine Works</span>
                      </div>
                    </div>
                    <div className="writing-horizontalborder-4">
                      <div className="writing-horizontalborder-4-box">
                        <span className="writing-folio-medium">FOLIO MEDIUM</span>
                      </div>
                      <div className="writing-horizontalborder-4-box">
                        <span className="writing-dual-bengali-english-script">Dual Bengali & English Script</span>
                      </div>
                      <div className="writing-horizontalborder-4-box">
                        <span className="writing-letterpress-typography-reproduct">Letterpress Typography Reproduction</span>
                      </div>
                    </div>
                    <div className="writing-horizontalborder-4">
                      <div className="writing-horizontalborder-4-box">
                        <span className="writing-access-level">ACCESS LEVEL</span>
                      </div>
                      <div className="writing-horizontalborder-4-box-2">
                        <img className="writing-horizontalborder-4-box-2-box" src="/svg/container-18w4pqb.svg" alt="" width="10" height="13" />
                        <div className="writing-horizontalborder-4-box-2-box-2">
                          <span className="writing-horizontalborder-4-box-2-box-2-text">Public Literary Archive</span>
                        </div>
                      </div>
                    </div>
                    <div className="writing-horizontalborder-5">
                      <div className="writing-horizontalborder-5-box">
                        <span className="writing-physical-stacks-location">PHYSICAL STACKS LOCATION</span>
                      </div>
                      <div className="writing-horizontalborder-5-box">
                        <span className="writing-folio-bay-iv-case-12-shelf-b">Folio Bay IV, Case 12, Shelf B</span>
                      </div>
                      <div className="writing-horizontalborder-5-box">
                        <span className="writing-central-archive-noholi-dhaka">Central Archive, Noholi Dhaka</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="writing-author-biography-monograph-card">
                  <div className="writing-horizontalborder-6">
                    <div className="writing-background-border-10">
                      <img className="writing-ab6axuc-evjrjgnbfruddzagdvvdgcbz" src="/images/1dcdc3cd1a5c.jpg" alt="AB6AXuC_eVjRJGnBfRuDdzAGdvvDGCbzjcpM46GxmjsvKFpVeFjyG68CvNR2e-MKTmxulqp7synAZzg00wSMWEHvK22IUcst1B20pwZ2r-0PRFv06D5yTqtpS001w0zIeBK-kAHdqkaSQL0kpC8vi2-Zwn66TAfbrCRFLRMW4DULhrgXLXs_XmpeRI0VbaBtyO-3ooo7vhrZE6zzSg91aSUj_9-MGuuvWNI7Vtr3TiC2_PdMkdfEBwIgRm8" />
                    </div>
                    <div className="writing-horizontalborder-6-box">
                      <h4 className="writing-heading-4">Anwara Begum</h4>
                      <div className="writing-horizontalborder-6-box-box">
                        <span className="writing-horizontalborder-6-box-box-text">PATRON FELLOW</span>
                      </div>
                      <div className="writing-horizontalborder-6-box-box-2">
                        <span className="writing-horizontalborder-6-box-box-2-text">Member since Nov 2023</span>
                      </div>
                    </div>
                  </div>
                  <div className="writing-author-biography-monograph-card-box">
                    <span className="writing-anwara-begum-is-an-educator-and">Anwara Begum is an educator and<br />poet residing in Sutrapur, Old Dhaka.<br />Her verses explore hydraulic memory,<br />boat-builders of the delta, and the<br />vernacular life of old neighborhoods.</span>
                  </div>
                  <div className="writing-horizontalborder-3">
                    <div className="writing-horizontalborder-3-box-3">
                      <div className="writing-horizontalborder-3-box-3-box">
                        <span className="writing-horizontalborder-3-box-3-box-text">PUBLISHED IN NOHOLI:</span>
                      </div>
                      <div className="writing-horizontalborder-3-box-3-box">
                        <span className="writing-horizontalborder-3-box-3-box-text-2">8 Folios</span>
                      </div>
                    </div>
                    <div className="writing-horizontalborder-3-box-3">
                      <div className="writing-horizontalborder-3-box-3-box">
                        <span className="writing-horizontalborder-3-box-3-box-text">SPECIALTY:</span>
                      </div>
                      <div className="writing-horizontalborder-3-box-3-box">
                        <span className="writing-horizontalborder-3-box-3-box-text-3">Rhythm & Delta Lore</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/creative-writings" className="writing-author-biography-monograph-card-box-2">VIEW AUTHOR'S 8 FOLIOS →</Link>
                </div>
                <div className="writing-archival-preservation-ledger-not">
                  <div className="writing-archival-preservation-ledger-not-box">
                    <img className="writing-archival-preservation-ledger-not-box-box" src="/svg/container-1gywguk.svg" alt="" width="13" height="11" />
                    <div className="writing-archival-preservation-ledger-not-box-box-2">
                      <span className="writing-archival-preservation-ledger-not-box-box-2-text">BROADSIDE PRESERVATION</span>
                    </div>
                  </div>
                  <div className="writing-archival-preservation-ledger-not-box-2">
                    <span className="writing-preserved-on-acid-free-archival">Preserved on acid-free archival card<br />stock. Digital scans calibrated for 600 DPI<br />printing at the Noholi Preservation<br />Department.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section className="writing-patron-engagement-submission-cal">
            <div className="writing-patron-engagement-submission-cal-box">
              <div className="writing-patron-engagement-submission-cal-box-box">
                <Link to="/creative-writings" className="writing-patron-engagement-submission-cal-box-box-box">
                  <img className="writing-patron-engagement-submission-cal-box-box-box-box" src="/svg/container-1eln6qm.svg" alt="" width="11" height="11" />
                  <div className="writing-patron-engagement-submission-cal-box-box-box-box-2">
                    <span className="writing-patron-engagement-submission-cal-box-box-box-box-2-text">BACK TO ALL CREATIVE WRITINGS</span>
                  </div>
                </Link>
                <h3 className="writing-heading-3-2">Have a verse or short story to share with the Library?</h3>
                <div className="writing-patron-engagement-submission-cal-box-box-box-2">
                  <span className="writing-patron-engagement-submission-cal-box-box-box-2-text">Patron Fellows and registered readers are invited to submit seasonal manuscripts for editorial accession.</span>
                </div>
              </div>
              <Link to="/studio/creative-writing" className="writing-patron-engagement-submission-cal-box-box-2">SUBMIT YOUR CREATIVE WRITING →</Link>
            </div>
          </section>
          <section className="writing-related-literary-works-from-the">
            <div className="writing-related-literary-works-from-the-box">
              <div className="writing-horizontalborder-7">
                <p className="writing-paragraph-2">
                  <span className="writing-paragraph-2-text">FROM THE SAME FOLIO & REPOSITORY</span>
                  <span className="writing-heading-3-3">Related Literary Pieces</span>
                </p>
                <Link to="/catalog" className="writing-horizontalborder-7-box">EXPLORE COMPLETE REPOSITORY →</Link>
              </div>
              <div className="writing-related-literary-works-from-the-box-box">
                <div className="writing-related-item-1-short-story">
                  <div className="writing-related-item-1-short-story-box">
                    <div className="writing-horizontalborder">
                      <div className="writing-horizontalborder-box">
                        <span className="writing-horizontalborder-box-text-2">SHORT STORY • FOLIO CW-014</span>
                      </div>
                      <div className="writing-horizontalborder-box">
                        <span className="writing-horizontalborder-box-text-3">8 min read</span>
                      </div>
                    </div>
                    <h4 className="writing-heading-4-2">The Bookseller of Tanti Bazar (তাঁতীবাজারের বইওয়ালা)</h4>
                    <div className="writing-related-item-1-short-story-box-box">
                      <span className="writing-by-kazi-farhan">{"By "}<span className="writing-span-3">Kazi Farhan</span>{" (Visiting Fellow)"}</span>
                    </div>
                    <div className="writing-related-item-1-short-story-box-box-2">
                      <span className="writing-in-an-alleyway-where-silver-fili">In an alleyway where silver filigree was once hammered, an octogenarian<br />preserves three centuries of unprinted manuscripts beneath stacked bolts<br />of muslin cloth and fragrant camphorwood boxes.</span>
                    </div>
                  </div>
                  <div className="writing-related-item-1-short-story-box-2">
                    <div className="writing-horizontalborder-8">
                      <div className="writing-horizontalborder-8-box">
                        <span className="writing-horizontalborder-8-box-text">Archived: January 14, 2026</span>
                      </div>
                      <Link to="/creative-writings/the-bookseller-of-tanti-bazar" className="writing-horizontalborder-8-box-2">
                        <div className="writing-horizontalborder-8-box-2-box">
                          <span className="writing-horizontalborder-8-box-2-box-text">READ WORK</span>
                        </div>
                        <img className="writing-horizontalborder-8-box-2-box-2" src="/svg/container-smycrj.svg" alt="" width="11" height="11" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="writing-related-item-2-poem">
                  <div className="writing-related-item-2-poem-box">
                    <div className="writing-horizontalborder">
                      <div className="writing-horizontalborder-box">
                        <span className="writing-horizontalborder-box-text-2">POETRY • FOLIO CW-017</span>
                      </div>
                      <div className="writing-horizontalborder-box">
                        <span className="writing-horizontalborder-box-text-3">4 min read</span>
                      </div>
                    </div>
                    <h4 className="writing-heading-4-2">Night Lanterns Along the Sitalakhya (শীতলক্ষ্যার বাতি)</h4>
                    <div className="writing-related-item-2-poem-box-box">
                      <span className="writing-by-farhana-zaman">{"By "}<span className="writing-span-3">Farhana Zaman</span>{" (Archival Scholar)"}</span>
                    </div>
                    <div className="writing-related-item-2-poem-box-box-2">
                      <span className="writing-observations-from-the-river-dock">Observations from the river docks of Demra at midnight: the kerosene<br />glints on water, the slow rhythm of the jute barges, and the silence of an<br />industrial waterway between tides.</span>
                    </div>
                  </div>
                  <div className="writing-related-item-2-poem-box-2">
                    <div className="writing-horizontalborder-8">
                      <div className="writing-horizontalborder-8-box">
                        <span className="writing-horizontalborder-8-box-text">Archived: February 02, 2026</span>
                      </div>
                      <Link to="/creative-writings/night-lanterns-along-the-sitalakhya" className="writing-horizontalborder-8-box-2">
                        <div className="writing-horizontalborder-8-box-2-box">
                          <span className="writing-horizontalborder-8-box-2-box-text">READ WORK</span>
                        </div>
                        <img className="writing-horizontalborder-8-box-2-box-2" src="/svg/container-smycrj.svg" alt="" width="11" height="11" />
                      </Link>
                    </div>
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
