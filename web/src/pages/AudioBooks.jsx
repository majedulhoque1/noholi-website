import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AudioBooks.css';

// The six catalogue plates drawn in the design (order = card order below); minutes drive "Under 3 hours" and sorting.
const TITLES = [
  { title: 'The River Path', bn: 'নদীর পথ', author: 'K. M. Sirajul Islam', narrator: 'Anisur Rahman', minutes: 258, tags: ['novels'] },
  { title: 'Songs of the Delta', bn: 'বদ্বীপের গান', author: 'Begum Rokeya Sakhawat', narrator: 'Sharmin Sultana', minutes: 165, tags: ['classics', 'poetry'] },
  { title: 'Echoes of the Green Shore', bn: 'সবুজ তীরের প্রতিধ্বনি', author: 'Dr. Niaz Zaman', narrator: 'Farhan Ahmed', minutes: 330, tags: [] },
  { title: 'Quiet Horizons', bn: 'শান্ত দিগন্ত', author: 'Syed Shamsul Haq', narrator: 'Rezwana Chowdhury', minutes: 192, tags: ['classics'] },
  { title: 'Shadows of the Delta', bn: 'বদ্বীপের ছায়া', author: 'Selina Hossain', narrator: 'Tariqul Islam', minutes: 365, tags: ['classics', 'novels'] },
  { title: 'Studies in Regional Craft', bn: 'আঞ্চলিক শিল্পের সমীক্ষা', author: 'Shilpacharya Zainul Abedin Institute', narrator: 'Nusrat Jahan', minutes: 130, tags: [] },
];
const FILTERS = [
  { id: 'all', label: 'ALL NARRATIONS', test: () => true },
  { id: 'classics', label: 'BENGALI CLASSICS', test: (t) => t.tags.includes('classics') },
  { id: 'novels', label: 'NOVELS & FOLIOS', test: (t) => t.tags.includes('novels') },
  { id: 'poetry', label: 'POETRY READINGS', test: (t) => t.tags.includes('poetry') },
  { id: 'short', label: 'UNDER 3 HOURS', test: (t) => t.minutes < 180 },
];
const SORTS = {
  recent: { label: 'Recently Cataloged', by: (a, b) => a.i - b.i }, // the design's own shelf order
  title: { label: 'Title (A–Z)', by: (a, b) => a.title.localeCompare(b.title) },
  shortest: { label: 'Shortest First', by: (a, b) => a.minutes - b.minutes },
  longest: { label: 'Longest First', by: (a, b) => b.minutes - a.minutes },
};
const SPEEDS = [1, 1.25, 1.5];
const TOTAL_SECONDS = 4 * 3600 + 18 * 60 + 22;
const clock = (sec) => [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), Math.floor(sec % 60)].map((n) => String(n).padStart(2, '0')).join(':');
const norm = (v) => v.toString().trim().toLowerCase();

// Generated from Figma frame "Noholi Library — Audio Books (Before Login)" (71:2) by tools/gen.py, then hand-edited.
export default function AudioBooks() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  // featured player — no audio file ships with the prototype, so it runs the clock as a preview
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [elapsed, setElapsed] = useState(1 * 3600 + 12 * 60 + 44);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setElapsed((e) => Math.min(TOTAL_SECONDS, e + speed)), 1000);
    return () => clearInterval(id);
  }, [playing, speed]);
  useEffect(() => { if (elapsed >= TOTAL_SECONDS) setPlaying(false); }, [elapsed]);
  const skip = (d) => setElapsed((e) => Math.max(0, Math.min(TOTAL_SECONDS, e + d)));
  const togglePlay = () => { if (elapsed >= TOTAL_SECONDS) setElapsed(0); setPlaying((p) => !p); };

  const q = norm(query);
  const test = FILTERS.find((f) => f.id === filter).test;
  const ranked = TITLES.map((t, i) => ({ ...t, i }))
    .filter((t) => test(t) && (!q || [t.title, t.bn, t.author, t.narrator].some((v) => norm(v).includes(q))))
    .sort(SORTS[sort].by);
  const orderOf = (i) => ranked.findIndex((t) => t.i === i);
  const card = (i) => ({ hidden: orderOf(i) < 0, style: { order: orderOf(i) } });

  return (
    <div className="audio">
      <div className="audio-breadcrumb" />
      <div className="audio-audio-box">
        <Link to="/" className="audio-audio-box-box">HOME</Link>
        <div className="audio-audio-box-box-2">
          <span className="audio-audio-box-box-2-text">/</span>
        </div>
        <div className="audio-audio-box-box-2">
          <span className="audio-resources">Resources</span>
        </div>
        <div className="audio-audio-box-box-2">
          <span className="audio-audio-box-box-2-text">/</span>
        </div>
        <div className="audio-audio-box-box-2">
          <span className="audio-audio-books">Audio Books</span>
        </div>
      </div>
      <section className="audio-main-content">
        <div className="audio-main-content-box">
          <section className="audio-section-eyebrow-bilingual-titles">
            <section className="audio-section-eyebrow-bilingual-titles-2">
              <div className="audio-section-eyebrow-bilingual-titles-2-box">
                <div className="audio-section-eyebrow-bilingual-titles-2-box-box">
                  <div className="audio-section-eyebrow-bilingual-titles-2-box-box-box">
                    <div className="audio-section-eyebrow-bilingual-titles-2-box-box-box-box" />
                    <div className="audio-section-eyebrow-bilingual-titles-2-box-box-box-box-2">
                      <span className="audio-section-eyebrow-bilingual-titles-2-box-box-box-box-2-text">DIGITAL SPOKEN ARCHIVE • AUDIO EDITIONS</span>
                    </div>
                  </div>
                  <h1 className="audio-heading-1">
                    <span className="audio-heading-1-text">{"Audio Books "}</span>
                    <span className="audio-heading-1-text-2">শ্রুত গ্রন্থমালা</span>
                  </h1>
                  <div className="audio-section-eyebrow-bilingual-titles-2-box-box-box-2">
                    <span className="audio-section-eyebrow-bilingual-titles-2-box-box-box-2-text">Listen to unabridged archival readings, Bengali literary classics, and narrated{' '}<br className="soft-br" />editions produced by Noholi Library & Press directly in your browser.</span>
                  </div>
                </div>
                <div className="audio-verticalborder">
                  <div className="audio-verticalborder-box">
                    <div className="audio-verticalborder-box-box">
                      <span className="audio-verticalborder-box-box-text">48 Works</span>
                    </div>
                    <span className="audio-verticalborder-box-text">ORAL REPOSITORY</span>
                  </div>
                  <div className="audio-vertical-divider" />
                  <div className="audio-verticalborder-box">
                    <div className="audio-verticalborder-box-box">
                      <span className="audio-verticalborder-box-box-text">Unabridged</span>
                    </div>
                    <span className="audio-verticalborder-box-text">PRESERVATION AUDIO</span>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <section className="audio-featured-audio-edition-banner-ar">
            <section className="audio-featured-audio-edition-banner-ar-2">
              <div className="audio-featured-audio-edition-banner-ar-2-box">
                <span className="audio-featured-audio-edition-banner-ar-2-box-text">ARCHIVAL SPOTLIGHT</span>
              </div>
              <div className="audio-featured-audio-edition-banner-ar-2-box-2">
                <div className="audio-folio-cover-display">
                  <div className="audio-background-border">
                    <div className="audio-border">
                      <div className="audio-border-box">
                        <div className="audio-border-box-box">
                          <span className="audio-noholi-audio-folio-no-01">NOHOLI AUDIO FOLIO • NO. 01</span>
                        </div>
                        <h2 className="audio-heading-2">The River Path</h2>
                        <div className="audio-border-box-box">
                          <span className="audio-border-box-box-text">নদীর পথ</span>
                        </div>
                      </div>
                      <div className="audio-archival-waveform-graphic">
                        <div className="audio-archival-waveform-graphic-2">
                          <div className="audio-archival-waveform-graphic-2-box" />
                          <div className="audio-archival-waveform-graphic-2-box-2" />
                          <div className="audio-archival-waveform-graphic-2-box-3" />
                          <div className="audio-archival-waveform-graphic-2-box-4" />
                          <div className="audio-archival-waveform-graphic-2-box-5" />
                          <div className="audio-archival-waveform-graphic-2-box-6" />
                          <div className="audio-archival-waveform-graphic-2-box-7" />
                          <div className="audio-archival-waveform-graphic-2-box-8" />
                          <div className="audio-archival-waveform-graphic-2-box-9" />
                          <div className="audio-archival-waveform-graphic-2-box-10" />
                          <div className="audio-archival-waveform-graphic-2-box" />
                          <div className="audio-archival-waveform-graphic-2-box-11" />
                          <div className="audio-archival-waveform-graphic-2-box-3" />
                        </div>
                      </div>
                      <div className="audio-border-box">
                        <div className="audio-border-box-box">
                          <span className="audio-voice-anisur-rahman">{"VOICE: "}<span className="audio-span">ANISUR RAHMAN</span></span>
                        </div>
                        <div className="audio-border-box-box">
                          <span className="audio-master-96khz-24-bit-flac">MASTER: 96KHZ / 24-BIT FLAC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="audio-player-controls-details">
                  <div className="audio-player-controls-details-box">
                    <div className="audio-player-controls-details-box-box">
                      <div className="audio-player-controls-details-box-box-box">
                        <div className="audio-player-controls-details-box-box-box-box">
                          <span className="audio-player-controls-details-box-box-box-box-text">FEATURED MASTER READING</span>
                        </div>
                        <div className="audio-player-controls-details-box-box-box-box">
                          <span className="audio-player-controls-details-box-box-box-box-text-2">•</span>
                        </div>
                        <div className="audio-player-controls-details-box-box-box-box">
                          <span className="audio-player-controls-details-box-box-box-box-text-2">RECORDED AT NOHOLI SOUND STUDIO</span>
                        </div>
                        <div className="audio-player-controls-details-box-box-box-box">
                          <span className="audio-player-controls-details-box-box-box-box-text-2">•</span>
                        </div>
                        <div className="audio-player-controls-details-box-box-box-box">
                          <span className="audio-player-controls-details-box-box-box-box-text-2">UNABRIDGED • 4H 18M</span>
                        </div>
                      </div>
                      <h3 className="audio-heading-3">
                        <span className="audio-heading-3-text">{"The River Path "}</span>
                        <span className="audio-heading-3-text-2">নদীর পথ</span>
                      </h3>
                      <div className="audio-player-controls-details-box-box-box-2">
                        <span className="audio-authored-by-k-m-sirajul-islam-na">Authored by K. M. Sirajul Islam — Narrated in literary Standard Bengali by Anisur Rahman.</span>
                      </div>
                      <div className="audio-player-controls-details-box-box-box-3">
                        <span className="audio-player-controls-details-box-box-box-3-text">A luminous chronicle of life on the deltaic tributaries, captured with meticulous sound design{' '}<br className="soft-br" />replicating seasonal rain, riverside bells, and oral folk cadences.</span>
                      </div>
                    </div>
                  </div>
                  <div className="audio-archival-styled-browser-player">
                    <div className="audio-horizontalborder">
                      <div className="audio-horizontalborder-box">
                        <img className="audio-horizontalborder-box-box" src="/svg/container-14oc45w.svg" alt="" width="12" height="12" />
                        <div className="audio-horizontalborder-box-box-2">
                          <span className="audio-horizontalborder-box-box-2-text">CHAPTER 1: THE FIRST EMBANKMENT (প্রথম বাঁধ)</span>
                        </div>
                      </div>
                      <div className="audio-horizontalborder-box">
                        <div className="audio-horizontalborder-box-box-2">
                          <span className="audio-horizontalborder-box-box-2-text-2">Speed:</span>
                        </div>
                        {SPEEDS.map((sp) => (
                          <button key={sp} type="button" className={`audio-horizontalborder-box-box-3${speed === sp ? ' is-active' : ''}`} aria-pressed={speed === sp} onClick={() => setSpeed(sp)}>{sp === 1 ? '1.0' : sp}x</button>
                        ))}
                      </div>
                    </div>
                    <div className="audio-progress-bar-timestamps">
                      <div className="audio-progress-bar-timestamps-box">
                        <div className="audio-progress-bar-timestamps-box-box" style={{ width: `${(elapsed / TOTAL_SECONDS) * 100}%` }} />
                      </div>
                      <div className="audio-progress-bar-timestamps-box-2">
                        <div className="audio-progress-bar-timestamps-box-2-box">
                          <span className="audio-progress-bar-timestamps-box-2-box-text">{clock(elapsed)}</span>
                        </div>
                        <div className="audio-progress-bar-timestamps-box-2-box">
                          <span className="audio-progress-bar-timestamps-box-2-box-text">04:18:22</span>
                        </div>
                      </div>
                    </div>
                    <div className="audio-transport-buttons">
                      <div className="audio-transport-buttons-box">
                        <button type="button" className="audio-transport-skip" onClick={() => skip(-15)} aria-label="Back 15 seconds"><img className="audio-transport-buttons-box-box" src="/svg/button-1ygboxk.svg" alt="" width="36" height="36" /></button>
                        <button type="button" className="audio-transport-buttons-box-box-2" aria-pressed={playing} onClick={togglePlay}>
                          {playing ? <img className="audio-transport-buttons-box-box-2-box" src="/svg/container-y6wbzs.svg" alt="" width="10" height="10" /> : <span className="audio-play-glyph" aria-hidden="true">▶</span>}
                          <div className="audio-transport-buttons-box-box-2-box-2">
                            <span className="audio-transport-buttons-box-box-2-box-2-text">{playing ? 'PAUSE PLAYBACK' : 'RESUME PLAYBACK'}</span>
                          </div>
                        </button>
                        <button type="button" className="audio-transport-skip" onClick={() => skip(30)} aria-label="Forward 30 seconds"><img className="audio-transport-buttons-box-box" src="/svg/button-3vmd3u.svg" alt="" width="36" height="36" /></button>
                      </div>
                      <Link to="/audio-books/the-river-path#chapters" className="audio-transport-buttons-box-2">
                        <img className="audio-transport-buttons-box-2-box" src="/svg/container-1kedpog.svg" alt="" width="11" height="14" />
                        <div className="audio-transport-buttons-box-2-box-2">
                          <span className="audio-transport-buttons-box-2-box-2-text">Index</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <div className="audio-functional-filter-search-bar">
            <div className="audio-functional-filter-search-bar-2">
              <div className="audio-functional-filter-search-bar-2-box">
                <div className="audio-search-input">
                  <input className="audio-input" type="search" aria-label="Search audio books" placeholder="Search narrators, authors, or titles..." value={query} onChange={(e) => setQuery(e.target.value)} />
                  <img className="audio-search-input-box" src="/svg/container-kxns67.svg" alt="" width="15" height="20" />
                </div>
                <div className="audio-filter-buttons-sort-selection">
                  {FILTERS.map((f) => (
                    <button key={f.id} type="button" aria-pressed={filter === f.id} className={filter === f.id ? 'audio-filter-buttons-sort-selection-box' : 'audio-filter-buttons-sort-selection-box-2'} onClick={() => setFilter(f.id)}>{f.label}</button>
                  ))}
                  <div className="audio-filter-buttons-sort-selection-box-3">
                    <div className="audio-vertical-divider-2" />
                  </div>
                  <div className="audio-filter-buttons-sort-selection-box-4">
                    <div className="audio-filter-buttons-sort-selection-box-4-box">
                      <span className="audio-filter-buttons-sort-selection-box-4-box-text">SORT:</span>
                    </div>
                    <div className="audio-options">
                      <div className="audio-options-box">
                        <span className="audio-options-box-text">{SORTS[sort].label}</span>
                      </div>
                      <select className="audio-sort-select" aria-label="Sort audio books" value={sort} onChange={(e) => setSort(e.target.value)}>
                        {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="audio-audio-book-catalog-grid">
            <div className="audio-audio-book-catalog-grid-2">
              <article className="audio-article-plate-1" {...card(0)}>
                <div className="audio-article-plate-1-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0104</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">4H 18M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-1-box-box">
                    <div className="audio-article-plate-1-box-box-box">
                      <span className="audio-fiction-river-lore">FICTION & RIVER LORE</span>
                    </div>
                    <h4 className="audio-heading-4">The River Path</h4>
                    <div className="audio-article-plate-1-box-box-box-2">
                      <span className="audio-article-plate-1-box-box-box-2-text">নদীর পথ</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" K. M. Sirajul Islam"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Anisur Rahman"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Reflective, Melodic Dialect"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-4">
                  <Link to="/audio-books/the-river-path" className="audio-horizontalborder-4-box">
                    <img className="audio-horizontalborder-4-box-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-4-box-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/the-river-path" className="audio-horizontalborder-4-box-2">View Details →</Link>
                </div>
              </article>
              <article className="audio-article-plate-2" {...card(1)}>
                <div className="audio-article-plate-2-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0108</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">2H 45M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-2-box-box">
                    <div className="audio-article-plate-2-box-box-box">
                      <span className="audio-poetry-oral-verse">POETRY & ORAL VERSE</span>
                    </div>
                    <h4 className="audio-heading-4">Songs of the Delta</h4>
                    <div className="audio-article-plate-2-box-box-box-2">
                      <span className="audio-article-plate-2-box-box-box-2-text">বদ্বীপের গান</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" Begum Rokeya Sakhawat"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Sharmin Sultana"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Lyrical Recitation & Ektara"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-4">
                  <Link to="/audio-books/songs-of-the-delta" className="audio-horizontalborder-4-box-3">
                    <img className="audio-horizontalborder-4-box-3-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-4-box-3-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/songs-of-the-delta" className="audio-horizontalborder-4-box-2">View Details →</Link>
                </div>
              </article>
              <article className="audio-article-plate-3" {...card(2)}>
                <div className="audio-article-plate-3-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0112</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">5H 30M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-3-box-box">
                    <div className="audio-article-plate-3-box-box-box">
                      <span className="audio-history-folk-chronicles">HISTORY & FOLK CHRONICLES</span>
                    </div>
                    <h4 className="audio-heading-4">Echoes of the Green Shore</h4>
                    <div className="audio-article-plate-3-box-box-box-2">
                      <span className="audio-article-plate-3-box-box-box-2-text">সবুজ তীরের প্রতিধ্বনি</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" Dr. Niaz Zaman"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Farhan Ahmed"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Scholarly Orality, Archival Ambience"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-5">
                  <Link to="/audio-books/echoes-of-the-green-shore" className="audio-horizontalborder-5-box">
                    <img className="audio-horizontalborder-5-box-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-5-box-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/echoes-of-the-green-shore" className="audio-horizontalborder-5-box-2">View Details →</Link>
                </div>
              </article>
              <article className="audio-article-plate-4" {...card(3)}>
                <div className="audio-article-plate-4-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0119</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">3H 12M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-4-box-box">
                    <div className="audio-article-plate-4-box-box-box">
                      <span className="audio-essays-personal-memoir">ESSAYS & PERSONAL MEMOIR</span>
                    </div>
                    <h4 className="audio-heading-4">Quiet Horizons</h4>
                    <div className="audio-article-plate-4-box-box-box-2">
                      <span className="audio-article-plate-4-box-box-box-2-text">শান্ত দিগন্ত</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" Syed Shamsul Haq"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Rezwana Chowdhury"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Intimate Monologue"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-4">
                  <Link to="/audio-books/quiet-horizons" className="audio-horizontalborder-4-box">
                    <img className="audio-horizontalborder-4-box-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-4-box-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/quiet-horizons" className="audio-horizontalborder-4-box-2">View Details →</Link>
                </div>
              </article>
              <article className="audio-article-plate-5" {...card(4)}>
                <div className="audio-article-plate-5-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0125</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">6H 05M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-5-box-box">
                    <div className="audio-article-plate-5-box-box-box">
                      <span className="audio-historical-fiction">HISTORICAL FICTION</span>
                    </div>
                    <h4 className="audio-heading-4">Shadows of the Delta</h4>
                    <div className="audio-article-plate-5-box-box-box-2">
                      <span className="audio-article-plate-5-box-box-box-2-text">বদ্বীপের ছায়া</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" Selina Hossain"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Tariqul Islam"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Deep Resonance, Ensemble Voices"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-4">
                  <Link to="/audio-books/shadows-of-the-delta" className="audio-horizontalborder-4-box-3">
                    <img className="audio-horizontalborder-4-box-3-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-4-box-3-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/shadows-of-the-delta" className="audio-horizontalborder-4-box-2">View Details →</Link>
                </div>
              </article>
              <article className="audio-article-plate-6" {...card(5)}>
                <div className="audio-article-plate-6-box">
                  <div className="audio-horizontalborder-2">
                    <div className="audio-horizontalborder-2-box">
                      <span className="audio-horizontalborder-2-box-text">NO. AUD-0131</span>
                    </div>
                    <div className="audio-horizontalborder-2-box-2">
                      <img className="audio-horizontalborder-2-box-2-box" src="/svg/container-14ucvrj.svg" alt="" width="11" height="11" />
                      <span className="audio-horizontalborder-2-box-2-text">2H 10M</span>
                    </div>
                  </div>
                  <div className="audio-article-plate-6-box-box">
                    <div className="audio-article-plate-6-box-box-box">
                      <span className="audio-non-fiction-monograph">NON-FICTION & MONOGRAPH</span>
                    </div>
                    <h4 className="audio-heading-4">Studies in Regional Craft</h4>
                    <div className="audio-article-plate-6-box-box-box-2">
                      <span className="audio-article-plate-6-box-box-box-2-text">আঞ্চলিক শিল্পের সমীক্ষা</span>
                    </div>
                    <div className="audio-horizontalborder-3">
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">AUTHOR:</span>
                        <span className="audio-paragraph-text-2">{" Shilpacharya Zainul Abedin Institute"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">NARRATOR:</span>
                        <span className="audio-paragraph-text-2">{" Nusrat Jahan"}</span>
                      </p>
                      <p className="audio-paragraph">
                        <span className="audio-paragraph-text">TONE:</span>
                        <span className="audio-paragraph-text-2">{" Methodical, Archival Field Notes"}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="audio-horizontalborder-5">
                  <Link to="/audio-books/studies-in-regional-craft" className="audio-horizontalborder-5-box">
                    <img className="audio-horizontalborder-5-box-box" src="/svg/container-hs2njx.svg" alt="" width="7" height="9" />
                    <span className="audio-horizontalborder-5-box-text">LISTEN NOW</span>
                  </Link>
                  <Link to="/audio-books/studies-in-regional-craft" className="audio-horizontalborder-5-box-2">View Details →</Link>
                </div>
              </article>
              {!ranked.length && (
                <p className="audio-empty">No narrations match. <button type="button" onClick={() => { setFilter('all'); setQuery(''); }}>Show all audio books</button></p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
