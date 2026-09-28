import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './AudioBookDetails.css';

// Chapter 1 player — no audio file ships with the prototype, so it runs the clock as a preview.
const CHAPTER_SECONDS = 28 * 60 + 45;
const SPEEDS = [1, 1.25, 1.5];
const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

// Generated from Figma frame "Noholi Library — Audio Book Details: The River Path (Before Login)" (71:420) by tools/gen.py, then hand-edited.
export default function AudioBookDetails() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [elapsed, setElapsed] = useState(14 * 60 + 32);
  const player = useRef(null);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setElapsed((e) => Math.min(CHAPTER_SECONDS, e + speed)), 1000);
    return () => clearInterval(id);
  }, [playing, speed]);
  useEffect(() => { if (elapsed >= CHAPTER_SECONDS) setPlaying(false); }, [elapsed]);
  const skip = (d) => setElapsed((e) => Math.max(0, Math.min(CHAPTER_SECONDS, e + d)));
  const toggle = () => { if (elapsed >= CHAPTER_SECONDS) setElapsed(0); setPlaying((p) => !p); };
  const startListening = () => {
    setPlaying(true);
    player.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="audiobook">
      <div className="audiobook-breadcrumb">
        <div className="audiobook-breadcrumb-box">
          <Link to="/" className="audiobook-breadcrumb-box-box">HOME</Link>
          <div className="audiobook-breadcrumb-box-box-2">
            <span className="audiobook-breadcrumb-box-box-2-text">/</span>
          </div>
          <div className="audiobook-breadcrumb-box-box-2">
            <span className="audiobook-resources">Resources</span>
          </div>
          <div className="audiobook-breadcrumb-box-box-2">
            <span className="audiobook-breadcrumb-box-box-2-text">/</span>
          </div>
          <span className="audiobook-audio-books">Audio books</span>
          <div className="audiobook-breadcrumb-box-box-2">
            <span className="audiobook-breadcrumb-box-box-2-text">/</span>
          </div>
          <span className="audiobook-the-river-path">The river path</span>
        </div>
      </div>
      <section className="audiobook-main-content">
        <div className="audiobook-main-content-box">
          <section className="audiobook-archival-dossier-header-strip">
            <section className="audiobook-archival-dossier-header-strip-2">
              <div className="audiobook-archival-dossier-header-strip-2-box">
                <div className="audiobook-archival-dossier-header-strip-2-box-box">
                  <div className="audiobook-archival-dossier-header-strip-2-box-box-box">
                    <span className="audiobook-archival-dossier-header-strip-2-box-box-box-text">CATALOGUE NO. AUD-0104</span>
                  </div>
                  <div className="audiobook-archival-dossier-header-strip-2-box-box-box-2">
                    <span className="audiobook-archival-dossier-header-strip-2-box-box-box-2-text">DIGITAL SPOKEN ARCHIVE • OPEN IN-BROWSER FOLIO</span>
                  </div>
                </div>
                <div className="audiobook-archival-dossier-header-strip-2-box-box-2">
                  <div className="audiobook-archival-dossier-header-strip-2-box-box-2-box">
                    <div className="audiobook-archival-dossier-header-strip-2-box-box-2-box-box" />
                    <span className="audiobook-archival-dossier-header-strip-2-box-box-2-box-text">Lossless FLAC Master Ready</span>
                  </div>
                  <div className="audiobook-archival-dossier-header-strip-2-box-box-2-box-2">
                    <span className="audiobook-archival-dossier-header-strip-2-box-box-2-box-2-text">•</span>
                  </div>
                  <div className="audiobook-archival-dossier-header-strip-2-box-box-2-box-2">
                    <span className="audiobook-archival-dossier-header-strip-2-box-box-2-box-2-text">Accession Year: 2025</span>
                  </div>
                </div>
              </div>
              <div className="audiobook-archival-dossier-header-strip-2-box-2">
                <div className="audiobook-archival-dossier-header-strip-2-box-2-box">
                  <p className="audiobook-paragraph">
                    <span className="audiobook-heading-1">The River Path</span>
                    <span className="audiobook-paragraph-text">নদীর পথ</span>
                  </p>
                  <div className="audiobook-archival-dossier-header-strip-2-box-2-box-box">
                    <span className="audiobook-archival-dossier-header-strip-2-box-2-box-box-text">An unabridged acoustic narrative tracing riparian memories, seasonal alluvial silt, and the{' '}<br className="soft-br" />oral testimonies along the lower Padma basin.</span>
                  </div>
                </div>
                <div className="audiobook-verticalborder">
                  <div className="audiobook-verticalborder-box">
                    <div className="audiobook-verticalborder-box-box">
                      <span className="audiobook-verticalborder-box-box-text">AUTHOR</span>
                    </div>
                    <div className="audiobook-verticalborder-box-box">
                      <span className="audiobook-verticalborder-box-box-text-2">K. M. Sirajul Islam</span>
                    </div>
                    <div className="audiobook-verticalborder-box-box-2">
                      <div className="audiobook-verticalborder-box-box-2-box">
                        <span className="audiobook-verticalborder-box-box-2-box-text">VOICE & NARRATION</span>
                      </div>
                      <div className="audiobook-verticalborder-box-box-2-box">
                        <span className="audiobook-verticalborder-box-box-2-box-text-2">Anisur Rahman</span>
                      </div>
                    </div>
                    <div className="audiobook-verticalborder-box-box-2">
                      <div className="audiobook-verticalborder-box-box-2-box">
                        <span className="audiobook-verticalborder-box-box-2-box-text">PRODUCTION STUDIO</span>
                      </div>
                      <div className="audiobook-verticalborder-box-box-2-box">
                        <span className="audiobook-verticalborder-box-box-2-box-text-3">Noholi Sound Studio & Press, Dhaka</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="audiobook-metadata-ledger-strip">
                <div className="audiobook-metadata-ledger-strip-box">
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-total-run-time">TOTAL RUN TIME</span>
                  </div>
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-4-hours-18-minutes">4 Hours 18 Minutes</span>
                  </div>
                </div>
                <div className="audiobook-metadata-ledger-strip-box">
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-auditory-format">AUDITORY FORMAT</span>
                  </div>
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-unabridged-spoken-folio">Unabridged Spoken Folio</span>
                  </div>
                </div>
                <div className="audiobook-metadata-ledger-strip-box">
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-release-season">RELEASE SEASON</span>
                  </div>
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-autumn-2025">Autumn 2025</span>
                  </div>
                </div>
                <div className="audiobook-metadata-ledger-strip-box">
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-linguistic-register">LINGUISTIC REGISTER</span>
                  </div>
                  <div className="audiobook-metadata-ledger-strip-box-box">
                    <span className="audiobook-metadata-ledger-strip-box-box-text">মান প্রমিত বাংলা (Colloquial)</span>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <section className="audiobook-main-functional-layout-grid">
            <section className="audiobook-main-functional-layout-grid-2">
              <div className="audiobook-left-column-archival-audio-maste">
                <div className="audiobook-archival-plate-graphic-card">
                  <div className="audiobook-background-border">
                    <div className="audiobook-horizontalborder">
                      <div className="audiobook-horizontalborder-box">
                        <span className="audiobook-horizontalborder-box-text">ARCHIVAL PHONO-REGISTER</span>
                      </div>
                      <div className="audiobook-horizontalborder-box">
                        <span className="audiobook-horizontalborder-box-text-2">VOL. IV / ED. 1</span>
                      </div>
                    </div>
                    <div className="audiobook-stylized-bengali-waveform-cartou">
                      <div className="audiobook-stylized-bengali-waveform-cartou-box">
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-2" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-3" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-4" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-5" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-6" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-7" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-8" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-9" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-10" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-11" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-12" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-13" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-14" />
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-box-15" />
                      </div>
                      <div className="audiobook-stylized-bengali-waveform-cartou-box-2">
                        <div className="audiobook-stylized-bengali-waveform-cartou-box-2-box">
                          <span className="audiobook-stylized-bengali-waveform-cartou-box-2-box-text">শব্দচিত্র ও কথামালা • অখণ্ড প্রামাণ্য স্বরলিপি</span>
                        </div>
                      </div>
                    </div>
                    <div className="audiobook-master-specification-list">
                      <div className="audiobook-master-specification-list-box">
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text">Acoustic Capture:</span>
                        </div>
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text-2">96kHz / 24-bit Lossless Studio Master</span>
                        </div>
                      </div>
                      <div className="audiobook-master-specification-list-box">
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text">Master Location:</span>
                        </div>
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text-2">Dhanmondi Sound Chamber, Dhaka</span>
                        </div>
                      </div>
                      <div className="audiobook-master-specification-list-box">
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text">Microphone Array:</span>
                        </div>
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text-2">Matched Pair Ribbon & Tube Condenser</span>
                        </div>
                      </div>
                      <div className="audiobook-master-specification-list-box">
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text">Streaming Codec:</span>
                        </div>
                        <div className="audiobook-master-specification-list-box-box">
                          <span className="audiobook-master-specification-list-box-box-text-2">Adaptive AAC (192 kbps) & WebFLAC</span>
                        </div>
                      </div>
                    </div>
                    <div className="audiobook-background-border-box">
                      <div className="audiobook-background-border-box-box">
                        <span className="audiobook-background-border-box-box-text">Serial: NH-AUD-2025-PADMA</span>
                      </div>
                      <div className="audiobook-background-border-box-box">
                        <span className="audiobook-background-border-box-box-text-2">AUTHENTICATED MASTER</span>
                      </div>
                    </div>
                    <div className="audiobook-inner-decorative-bookplate-corne" />
                    <div className="audiobook-border" />
                    <div className="audiobook-border-2" />
                    <div className="audiobook-border-3" />
                  </div>
                </div>
                <div className="audiobook-folio-control-actions">
                  <button type="button" className="audiobook-folio-control-actions-box" onClick={startListening}>
                    <img className="audiobook-folio-control-actions-box-box" src="/svg/container-hqmhd4.svg" alt="" width="8" height="10" />
                    <span className="audiobook-folio-control-actions-box-text">START LISTENING • PLAY FOLIO</span>
                  </button>
                  <div className="audiobook-folio-control-actions-box-2">
                    <Link to="/wishlist/audio-books" className="audiobook-folio-control-actions-box-2-box">+ LISTENING SHELF</Link>
                    <a aria-disabled="true" title="Available soon" className="audiobook-folio-control-actions-box-2-box-2">DOWNLOAD PDF TRANSCRIPT</a>
                  </div>
                </div>
                <div className="audiobook-archival-guarantee-statement">
                  <img className="audiobook-archival-guarantee-statement-box" src="/svg/icon-182rqmi.svg" alt="" width="11" height="16" />
                  <div className="audiobook-archival-guarantee-statement-box-2">
                    <span className="audiobook-archival-guarantee-statement-box-2-text">Digital streaming is permanently unmetered for registered patrons. Transcripts match{' '}<br className="soft-br" />the 1978 original typescript preserved in Noholi Rare Manuscripts Reserve.</span>
                  </div>
                </div>
              </div>
              <div className="audiobook-right-column-interactive-in-brow">
                <div className="audiobook-interactive-in-browser-audio-pla">
                  <div className="audiobook-horizontalborder">
                    <div className="audiobook-horizontalborder-box-2">
                      <div className="audiobook-horizontalborder-box-2-box" />
                      <div className="audiobook-horizontalborder-box-2-box-2">
                        <span className="audiobook-horizontalborder-box-2-box-2-text">ACTIVE CONSOLE • STREAMING CHAMBER</span>
                      </div>
                    </div>
                    <div className="audiobook-horizontalborder-box">
                      <span className="audiobook-horizontalborder-box-text-3" aria-live="polite">{playing ? 'NOW PLAYING' : elapsed > 14 * 60 + 32 ? 'PAUSED' : 'READY TO PLAY'}</span>
                    </div>
                  </div>
                  <div className="audiobook-current-chapter-indicator" ref={player}>
                    <div className="audiobook-current-chapter-indicator-box">
                      <span className="audiobook-now-loaded">NOW LOADED</span>
                    </div>
                    <h2 className="audiobook-heading-2">
                      <span className="audiobook-heading-2-text">{"Chapter 1: The First Embankment "}</span>
                      <span className="audiobook-heading-2-text-2">(প্রথম বাঁধ)</span>
                    </h2>
                    <div className="audiobook-current-chapter-indicator-box">
                      <span className="audiobook-narrated-by-anisur-rahman-monogr">Narrated by Anisur Rahman • Monograph Edition Reference: § 1.1–1.14</span>
                    </div>
                  </div>
                  <div className="audiobook-scrubber-and-timeline">
                    <div className="audiobook-overlay">
                      <div className="audiobook-overlay-box" style={{ width: `${(elapsed / CHAPTER_SECONDS) * 100}%` }} />
                    </div>
                    <div className="audiobook-scrubber-and-timeline-box">
                      <div className="audiobook-scrubber-and-timeline-box-box">
                        <span className="audiobook-scrubber-and-timeline-box-box-text">{mmss(elapsed)}</span>
                      </div>
                      <div className="audiobook-scrubber-and-timeline-box-box">
                        <span className="audiobook-scrubber-and-timeline-box-box-text-2">পদ্মা নদীর উপাখ্যান</span>
                      </div>
                      <div className="audiobook-scrubber-and-timeline-box-box">
                        <span className="audiobook-scrubber-and-timeline-box-box-text">28:45</span>
                      </div>
                    </div>
                  </div>
                  <div className="audiobook-primary-transport-controls">
                    <div className="audiobook-primary-transport-controls-box">
                      <button type="button" className="audiobook-skip" onClick={() => skip(-15)} aria-label="Back 15 seconds"><img className="audiobook-rewind-15-seconds" src="/svg/button-rewind-15-seconds-vxt7v1.svg" alt="" width="32" height="41" /></button>
                      <button type="button" className="audiobook-toggle-play-pause" aria-pressed={playing} onClick={toggle}>
                        {playing ? <span className="audiobook-pause-glyph" aria-hidden="true">❚❚</span> : <img className="audiobook-toggle-play-pause-box" src="/svg/container-4iz0ls.svg" alt="" width="9" height="11" />}
                        <div className="audiobook-toggle-play-pause-box-2">
                          <span className="audiobook-toggle-play-pause-box-2-text">{playing ? 'PAUSE' : 'PLAY'}</span>
                        </div>
                      </button>
                      <button type="button" className="audiobook-skip" onClick={() => skip(30)} aria-label="Forward 30 seconds"><img className="audiobook-forward-30-seconds" src="/svg/button-forward-30-seconds-9wcyfx.svg" alt="" width="32" height="41" /></button>
                    </div>
                    <div className="audiobook-speed-volume-controls">
                      <div className="audiobook-speed-volume-controls-box">
                        <div className="audiobook-speed-volume-controls-box-box">
                          <span className="audiobook-speed-volume-controls-box-box-text">PACE:</span>
                        </div>
                        {SPEEDS.map((sp) => (
                          <button key={sp} type="button" aria-pressed={speed === sp} className={speed === sp ? 'audiobook-speed-volume-controls-box-box-2' : 'audiobook-speed-volume-controls-box-box-3'} onClick={() => setSpeed(sp)}>{sp === 1 ? '1.0' : sp}×</button>
                        ))}
                      </div>
                      <div className="audiobook-verticalborder-2">
                        <img className="audiobook-verticalborder-2-box" src="/svg/container-133xqih.svg" alt="" width="12" height="12" />
                        <div className="audiobook-input-audio-volume">
                          <div className="audiobook-input-audio-volume-box">
                            <div className="audiobook-input-audio-volume-box-box" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="audiobook-chapter-folio-timestamps-table-a" id="chapters">
                  <div className="audiobook-background-horizontalborder">
                    <div className="audiobook-background-horizontalborder-box">
                      <h3 className="audiobook-heading-3">Folio Chapters & Voice Marks</h3>
                      <div className="audiobook-background-horizontalborder-box-box">
                        <span className="audiobook-background-horizontalborder-box-box-text">Complete chronological indices for in-browser scholarly listening</span>
                      </div>
                    </div>
                    <div className="audiobook-background-horizontalborder-box">
                      <span className="audiobook-background-horizontalborder-box-text">5 REGISTERED PARTS</span>
                    </div>
                  </div>
                  <div className="audiobook-chapter-folio-timestamps-table-a-box">
                    <div className="audiobook-chapter-1">
                      <div className="audiobook-chapter-1-box">
                        <div className="audiobook-chapter-1-box-box">
                          <span className="audiobook-chapter-1-box-box-text">01</span>
                        </div>
                        <div className="audiobook-chapter-1-box-box-2">
                          <div className="audiobook-chapter-1-box-box-2-box">
                            <h4 className="audiobook-heading-4">The First Embankment</h4>
                            <div className="audiobook-chapter-1-box-box-2-box-box">
                              <span className="audiobook-chapter-1-box-box-2-box-box-text">প্রথম বাঁধ</span>
                            </div>
                            <div className="audiobook-chapter-1-box-box-2-box-box-2">
                              <span className="audiobook-chapter-1-box-box-2-box-box-2-text">PLAYING</span>
                            </div>
                          </div>
                          <div className="audiobook-chapter-1-box-box-2-box-2">
                            <span className="audiobook-chapter-1-box-box-2-box-2-text">Opening acoustic study; the erosion of the western silt walls before the monsoons.</span>
                          </div>
                        </div>
                      </div>
                      <div className="audiobook-chapter-1-box-2">
                        <div className="audiobook-chapter-1-box-2-box">
                          <span className="audiobook-chapter-1-box-2-box-text">28:45</span>
                        </div>
                        <img className="audiobook-chapter-1-box-2-box-2" src="/svg/button-mh1qa8.svg" alt="" width="21" height="33" />
                      </div>
                    </div>
                    <div className="audiobook-chapter-2">
                      <div className="audiobook-chapter-2-box">
                        <div className="audiobook-border-4">
                          <span className="audiobook-border-4-text">02</span>
                        </div>
                        <div className="audiobook-chapter-2-box-box">
                          <div className="audiobook-chapter-2-box-box-box">
                            <h4 className="audiobook-heading-4">Monsoon Lowlands</h4>
                            <div className="audiobook-chapter-2-box-box-box-box">
                              <span className="audiobook-chapter-2-box-box-box-box-text">বর্ষার জলতল</span>
                            </div>
                          </div>
                          <div className="audiobook-chapter-2-box-box-box-2">
                            <span className="audiobook-chapter-2-box-box-box-2-text">The submergence of seasonal paddy beds; archival field interviews with boatmen.</span>
                          </div>
                        </div>
                      </div>
                      <div className="audiobook-chapter-2-box-2">
                        <div className="audiobook-chapter-2-box-2-box">
                          <span className="audiobook-chapter-2-box-2-box-text">34:10</span>
                        </div>
                        <img className="audiobook-chapter-2-box-2-box-2" src="/svg/button-9lcela.svg" alt="" width="21" height="33" />
                      </div>
                    </div>
                    <div className="audiobook-chapter-3">
                      <div className="audiobook-chapter-3-box">
                        <div className="audiobook-border-4">
                          <span className="audiobook-border-4-text">03</span>
                        </div>
                        <div className="audiobook-chapter-3-box-box">
                          <div className="audiobook-chapter-3-box-box-box">
                            <h4 className="audiobook-heading-4">Night at the Ferry Landing</h4>
                            <div className="audiobook-chapter-3-box-box-box-box">
                              <span className="audiobook-chapter-3-box-box-box-box-text">ঘাটমাঝি ও সন্ধ্যা</span>
                            </div>
                          </div>
                          <div className="audiobook-chapter-3-box-box-box-2">
                            <span className="audiobook-chapter-3-box-box-box-2-text">Nocturnal river songs, hurricane lamp light, and historical transit logs from 1952.</span>
                          </div>
                        </div>
                      </div>
                      <div className="audiobook-chapter-3-box-2">
                        <div className="audiobook-chapter-3-box-2-box">
                          <span className="audiobook-chapter-3-box-2-box-text">41:15</span>
                        </div>
                        <img className="audiobook-chapter-3-box-2-box-2" src="/svg/button-9lcela.svg" alt="" width="21" height="33" />
                      </div>
                    </div>
                    <div className="audiobook-chapter-4">
                      <div className="audiobook-chapter-4-box">
                        <div className="audiobook-border-4">
                          <span className="audiobook-border-4-text">04</span>
                        </div>
                        <div className="audiobook-chapter-4-box-box">
                          <div className="audiobook-chapter-4-box-box-box">
                            <h4 className="audiobook-heading-4">Silt and Memory</h4>
                            <div className="audiobook-chapter-4-box-box-box-box">
                              <span className="audiobook-chapter-4-box-box-box-box-text">পলিমাটির স্মৃতি</span>
                            </div>
                          </div>
                          <div className="audiobook-chapter-4-box-box-box-2">
                            <span className="audiobook-chapter-4-box-box-box-2-text">Genealogies carved in alluvial deposits; dispute records between riverine parishes.</span>
                          </div>
                        </div>
                      </div>
                      <div className="audiobook-chapter-4-box-2">
                        <div className="audiobook-chapter-4-box-2-box">
                          <span className="audiobook-chapter-4-box-2-box-text">38:20</span>
                        </div>
                        <img className="audiobook-chapter-4-box-2-box-2" src="/svg/button-9lcela.svg" alt="" width="21" height="33" />
                      </div>
                    </div>
                    <div className="audiobook-chapter-5">
                      <div className="audiobook-chapter-5-box">
                        <div className="audiobook-border-4">
                          <span className="audiobook-border-4-text">05</span>
                        </div>
                        <div className="audiobook-chapter-5-box-box">
                          <div className="audiobook-chapter-5-box-box-box">
                            <h4 className="audiobook-heading-4">Echoes of the Outflow</h4>
                            <div className="audiobook-chapter-5-box-box-box-box">
                              <span className="audiobook-chapter-5-box-box-box-box-text">ভাটির তান</span>
                            </div>
                          </div>
                          <div className="audiobook-chapter-5-box-box-box-2">
                            <span className="audiobook-chapter-5-box-box-box-2-text">The concluding suite: confluence with the Bay of Bengal and final benediction.</span>
                          </div>
                        </div>
                      </div>
                      <div className="audiobook-chapter-5-box-2">
                        <div className="audiobook-chapter-5-box-2-box">
                          <span className="audiobook-chapter-5-box-2-box-text">45:00</span>
                        </div>
                        <img className="audiobook-chapter-5-box-2-box-2" src="/svg/button-9lcela.svg" alt="" width="21" height="33" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <section className="audiobook-editorial-synopsis-archival-prod">
            <section className="audiobook-editorial-synopsis-archival-prod-2">
              <div className="audiobook-editorial-synopsis-archival-prod-2-box">
                <div className="audiobook-synopsis-left-column">
                  <div className="audiobook-synopsis-left-column-box">
                    <div className="audiobook-synopsis-left-column-box-box">
                      <span className="audiobook-literary-colophon-context">LITERARY COLOPHON & CONTEXT</span>
                    </div>
                    <h3 className="audiobook-heading-3-2">Synopsis & The Oral Architecture of the Delta</h3>
                  </div>
                  <div className="audiobook-synopsis-left-column-box-2">
                    <div className="audiobook-synopsis-left-column-box-2-box">
                      <span className="audiobook-first-transcribed-in-manuscript">First transcribed in manuscript notebooks during the monsoon expeditions of{' '}<br className="soft-br" />{"1974\u20131976, "}<span className="audiobook-span">The River Path (নদীর পথ)</span>{" remains one of the most distinctive"}{' '}<br className="soft-br" />documents of riverine topography in post-independence Bengal. K. M. Sirajul{' '}<br className="soft-br" />Islam bypassed dry bureaucratic hydrologic surveys to build an intimate{' '}<br className="soft-br" />geography: charting how changes in water currents dictated ancestral{' '}<br className="soft-br" />boundaries, migration, dialect shifts, and communal remembrance.</span>
                    </div>
                    <div className="audiobook-synopsis-left-column-box-2-box">
                      <span className="audiobook-in-this-unabridged-spoken-word-p">In this unabridged spoken-word production, the text is treated not simply as{' '}<br className="soft-br" />prose, but as a deliberate cadence of breath and tidal rhythm. The reader{' '}<br className="soft-br" />encounters the slow drift of cargo boats, the sudden crumbling of steep earthen{' '}<br className="soft-br" />banks at midnight, and the enduring philosophical quietude of those whose lives{' '}<br className="soft-br" />were governed by water.</span>
                    </div>
                    <div className="audiobook-blockquote">
                      <span className="audiobook-blockquote-text">"নদী কেবল জলধারা নয়, নদী আমাদের জিহ্বার স্বর—ভাটির টানে যে কথা হারিয়ে যায়, আবার জোয়ারের{' '}<br className="soft-br" />জলে তা ঘরে ফিরে আসে।"</span>
                      <div className="audiobook-blockquote-box">
                        <span className="audiobook-blockquote-box-text">— ক. ম. সিরাজুল ইসলাম, ভূমিকাংশ</span>
                      </div>
                    </div>
                    <div className="audiobook-synopsis-left-column-box-2-box">
                      <span className="audiobook-this-audio-folio-was-produced-un">This audio folio was produced under the strict archival editorial standard of{' '}<br className="soft-br" />Noholi Library, ensuring that archaic maritime terminology, regional idiom, and{' '}<br className="soft-br" />geographical references are voiced with philological precision.</span>
                    </div>
                  </div>
                </div>
                <div className="audiobook-about-production-voice-artist-ri">
                  <div className="audiobook-background-border-2">
                    <div className="audiobook-background-border-2-box">
                      <span className="audiobook-production-ledger">PRODUCTION LEDGER</span>
                    </div>
                    <h4 className="audiobook-heading-4-2">Acoustic Preservation & Narration</h4>
                    <div className="audiobook-background-border-2-box-2">
                      <div className="audiobook-background-border-2-box-2-box">
                        <span className="audiobook-the-voice-of-anisur-rahman-veter">The Voice of Anisur Rahman:<span className="audiobook-span-2">{" Veteran broadcaster and literary reciter"}{' '}<br className="soft-br" />Anisur Rahman was chosen for his rare command of standard colloquial{' '}<br className="soft-br" />Bengali infused with subtle riverine pacing. His narration preserves the{' '}<br className="soft-br" />natural pause structures demanded by traditional recitation halls.</span></span>
                      </div>
                      <div className="audiobook-background-border-2-box-2-box">
                        <span className="audiobook-studio-environment-recorded-acro">Studio Environment:<span className="audiobook-span-2">{" Recorded across fourteen dawn sessions at the"}{' '}<br className="soft-br" />Noholi Sound Studio in Dhaka. Ambient acoustics were managed using{' '}<br className="soft-br" />untreated raw jute baffles and timber diffuser panels, eliminating synthetic{' '}<br className="soft-br" />reverb in favor of intimate room presence.</span></span>
                      </div>
                      <div className="audiobook-background-border-2-box-2-box">
                        <span className="audiobook-dialectical-fidelity-linguistic">Dialectical Fidelity:<span className="audiobook-span-2">{" Linguistic consultation was provided by the Institute of"}{' '}<br className="soft-br" />Folk Heritage, ensuring that localized terminology for boat rigging, water{' '}<br className="soft-br" />depths, and soil consistencies was faithfully enunciated without modern{' '}<br className="soft-br" />urban distortion.</span></span>
                      </div>
                    </div>
                    <div className="audiobook-horizontalborder-2">
                      <div className="audiobook-horizontalborder-2-box">
                        <span className="audiobook-horizontalborder-2-box-text">Mastered: October 2025</span>
                      </div>
                      <div className="audiobook-horizontalborder-2-box">
                        <span className="audiobook-horizontalborder-2-box-text-2">NOHOLI SOUND ARCHIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <div className="audiobook-related-audio-editions-section">
            <div className="audiobook-related-audio-editions-section-box">
              <div className="audiobook-related-audio-editions-section-box-box">
                <div className="audiobook-related-audio-editions-section-box-box-box">
                  <span className="audiobook-related-audio-editions-section-box-box-box-text">ARCHIVAL SERIES: VOICES OF BENGAL</span>
                </div>
                <h3 className="audiobook-heading-3-3">Complementary Spoken Editions</h3>
              </div>
              <Link to="/audio-books" className="audiobook-related-audio-editions-section-box-box-2">EXPLORE COMPLETE AUDIO ARCHIVE →</Link>
            </div>
            <div className="audiobook-3-card-grid">
              <div className="audiobook-related-item-1">
                <div className="audiobook-related-item-1-box">
                  <div className="audiobook-horizontalborder-3">
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text">ACC. AUD-0089</span>
                    </div>
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text-2">2h 45m</span>
                    </div>
                  </div>
                  <h4 className="audiobook-heading-4-3">Songs of the Delta</h4>
                  <div className="audiobook-related-item-1-box-box">
                    <span className="audiobook-related-item-1-box-box-text">ব-দ্বীপের গান</span>
                  </div>
                  <div className="audiobook-related-item-1-box-box-2">
                    <span className="audiobook-begum-rokeya-sakhawat-archival-n">Begum Rokeya Sakhawat • Archival narration of feminine folk{' '}<br className="soft-br" />verses and nocturnal work songs from rural Rangpur.</span>
                  </div>
                </div>
                <div className="audiobook-horizontalborder-4">
                  <div className="audiobook-horizontalborder-4-box">
                    <span className="audiobook-horizontalborder-4-box-text">8 Chapters</span>
                  </div>
                  <Link to="/audio-books/songs-of-the-delta" className="audiobook-horizontalborder-4-text">LISTEN NOW →</Link>
                </div>
              </div>
              <div className="audiobook-related-item-2">
                <div className="audiobook-related-item-2-box">
                  <div className="audiobook-horizontalborder-3">
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text">ACC. AUD-0094</span>
                    </div>
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text-2">5h 30m</span>
                    </div>
                  </div>
                  <h4 className="audiobook-heading-4-3">Echoes of the Green Shore</h4>
                  <div className="audiobook-related-item-2-box-box">
                    <span className="audiobook-related-item-2-box-box-text">সবুজ কূলের প্রতিধ্বনি</span>
                  </div>
                  <div className="audiobook-related-item-2-box-box-2">
                    <span className="audiobook-dr-niaz-zaman-a-multi-vocal-spok">Dr. Niaz Zaman • A multi-vocal spoken performance reconstructing{' '}<br className="soft-br" />historical accounts of coastal mangrove settlements.</span>
                  </div>
                </div>
                <div className="audiobook-horizontalborder-4">
                  <div className="audiobook-horizontalborder-4-box">
                    <span className="audiobook-horizontalborder-4-box-text">14 Chapters</span>
                  </div>
                  <Link to="/audio-books/echoes-of-the-green-shore" className="audiobook-horizontalborder-4-text">LISTEN NOW →</Link>
                </div>
              </div>
              <div className="audiobook-related-item-3">
                <div className="audiobook-related-item-3-box">
                  <div className="audiobook-horizontalborder-3">
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text">ACC. AUD-0072</span>
                    </div>
                    <div className="audiobook-horizontalborder-3-box">
                      <span className="audiobook-horizontalborder-3-box-text-2">3h 12m</span>
                    </div>
                  </div>
                  <h4 className="audiobook-heading-4-3">Quiet Horizons</h4>
                  <div className="audiobook-related-item-3-box-box">
                    <span className="audiobook-related-item-3-box-box-text">স্তব্ধ দিগন্তের রেখা</span>
                  </div>
                  <div className="audiobook-related-item-3-box-box-2">
                    <span className="audiobook-syed-shamsul-haq-lyrical-monolog">Syed Shamsul Haq • Lyrical monologues and field recollections{' '}<br className="soft-br" />capturing the northern pastoral transformation during 1968.</span>
                  </div>
                </div>
                <div className="audiobook-horizontalborder-4">
                  <div className="audiobook-horizontalborder-4-box">
                    <span className="audiobook-horizontalborder-4-box-text">9 Chapters</span>
                  </div>
                  <Link to="/audio-books/quiet-horizons" className="audiobook-horizontalborder-4-text">LISTEN NOW →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
