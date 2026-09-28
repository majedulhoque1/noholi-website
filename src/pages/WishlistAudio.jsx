import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Status, useSubmission } from './memberStudio.jsx';
import './WishlistAudio.css';

const SORTS = [
  { label: 'ACCESSION DATE', order: [1, 2, 3, 4] },
  { label: 'TITLE (A–Z)', order: [4, 3, 1, 2] },
];
const REQUIRED = [
  ['book-title', 'book title'],
  ['original-author', 'original author'],
];

// Generated from Figma frame "Noholi Library — Audio Books Wishlist & Studio Requests (After login)" (126:6298) by tools/gen_member.py, then hand-edited.
export default function WishlistAudio() {
  const navigate = useNavigate();
  const [sort, setSort] = useState(0);
  const [removed, setRemoved] = useState([]);
  const [notify, setNotify] = useState(false);
  const remove = (n) => setRemoved((r) => [...r, n]);
  const { status, submit } = useSubmission(REQUIRED, 'Thank you — your request has been sent to the Noholi Sound & Literature Board.');
  const onSubmit = (e) => {
    if (submit(e)) e.currentTarget.reset();
  };

  // wishlist entries, keyed by their position in the design
  const cards = {};
  cards[1] = (
    <article className="wlaudio-article-entry-1-the-river-path">
    <div className="wlaudio-background-horizontalborder">
      <div className="wlaudio-background-horizontalborder-box">
        <div className="wlaudio-background-horizontalborder-box-box" />
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">FOLIO CALL: NL-REC-0419</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text-2">|</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">STUDIO MASTER</span>
        </div>
      </div>
      <div className="wlaudio-background-horizontalborder-box-2">
        <img className="wlaudio-background-horizontalborder-box-2-box" src="/svg/container-ffvyjj.svg" alt="" width="12" height="14" />
        <div className="wlaudio-background-horizontalborder-box-2-box-2">
          <span className="wlaudio-background-horizontalborder-box-2-box-2-text">AVAILABLE FOR STREAMING</span>
        </div>
      </div>
    </div>
    <div className="wlaudio-article-entry-1-the-river-path-box">
      <div className="wlaudio-article-entry-1-the-river-path-box-box">
        <div className="wlaudio-background-border-2">
          <img className="wlaudio-ab6axuakxf7eu1thxm13mvkqw2viebki" src="/images/03788ba19a9c.jpg" alt="AB6AXuAKxF7EU1THXm13MVkQw2viEBKiwcI258rbKjVb1J2jlpJ4Hbkm6UHaLKyqhYNDXRzceY42-OlwXY7W7ZWBGquNiK554_w2mlC2IL-gq93q_eQblG2KQTaFUX6LMdNy8pEajgT7vtPl1gRUi47L0VeQSx43Seygnqsvn8WsA4wSNGosg9IfcWbAhMW33rQ_96AugjYKBLosiUFdhMMRQj6OvGf9n8ndFB5i6477uYhf1FELlCKmuPM" />
        </div>
      </div>
      <div className="wlaudio-article-entry-1-the-river-path-box-box-2">
        <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box">
          <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-box">
            <span className="wlaudio-heading-3">{"The River Path "}<span className="wlaudio-span">(নদীর পথ)</span></span>
            <div className="wlaudio-background-border-3">
              <span className="wlaudio-background-border-3-text">AUDIOBOOK</span>
            </div>
          </div>
          <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-box-2">
            <span className="wlaudio-by-kazi-farhan-complete-spoken-e">{"By "}<span className="wlaudio-span-2">Kazi Farhan</span>{" \u2022 Complete Spoken Edition"}</span>
          </div>
          <div className="wlaudio-border">
            <div className="wlaudio-border-box">
              <div className="wlaudio-border-box-box">
                <span className="wlaudio-narrator">NARRATOR</span>
              </div>
              <span className="wlaudio-border-box-text">Asaduzzaman Noor</span>
            </div>
            <div className="wlaudio-border-box-2">
              <div className="wlaudio-border-box-2-box">
                <span className="wlaudio-duration">DURATION</span>
              </div>
              <span className="wlaudio-border-box-2-text">4 hrs 15 mins</span>
            </div>
            <div className="wlaudio-border-box-3">
              <div className="wlaudio-border-box-3-box">
                <span className="wlaudio-studio">STUDIO</span>
              </div>
              <div className="wlaudio-border-box-3-box-2">
                <span className="wlaudio-border-box-3-box-2-text">Noholi Spoken Studio</span>
              </div>
            </div>
          </div>
        </div>
        <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2">
          <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box">
            <button type="button" onClick={() => navigate('/audio-books/the-river-path')} className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-box">
              <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-box-box">
                <span className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-box-box-text">LISTEN NOW / শুনুন</span>
              </div>
              <img className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </button>
            <button type="button" onClick={() => navigate('/audio-books/the-river-path')} className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-box-2">DOWNLOAD FOLIO PDF</button>
          </div>
          <button type="button" onClick={() => remove(1)} className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-2">
            <img className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-2-box" src="/svg/container-cc6ysq.svg" alt="" width="10" height="11" />
            <div className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-2-box-2">
              <span className="wlaudio-article-entry-1-the-river-path-box-box-2-box-2-box-2-box-2-text">REMOVE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </article>
  );
  cards[2] = (
    <article className="wlaudio-article-entry-2-titash-ekti-nadi">
    <div className="wlaudio-background-horizontalborder-2">
      <div className="wlaudio-background-horizontalborder-2-box">
        <div className="wlaudio-background-horizontalborder-2-box-box" />
        <div className="wlaudio-background-horizontalborder-2-box-box-2">
          <span className="wlaudio-background-horizontalborder-2-box-box-2-text">FOLIO CALL: NL-REC-0891</span>
        </div>
        <div className="wlaudio-background-horizontalborder-2-box-box-2">
          <span className="wlaudio-background-horizontalborder-2-box-box-2-text-2">|</span>
        </div>
        <div className="wlaudio-background-horizontalborder-2-box-box-2">
          <span className="wlaudio-background-horizontalborder-2-box-box-2-text">UNABRIDGED RECORDING</span>
        </div>
      </div>
      <div className="wlaudio-background-horizontalborder-2-box-2">
        <img className="wlaudio-background-horizontalborder-2-box-2-box" src="/svg/container-1ywh1pa.svg" alt="" width="14" height="14" />
        <div className="wlaudio-background-horizontalborder-2-box-2-box-2">
          <span className="wlaudio-background-horizontalborder-2-box-2-box-2-text">IN PRODUCTION / RELEASING NEXT MONTH</span>
        </div>
      </div>
    </div>
    <div className="wlaudio-article-entry-2-titash-ekti-nadi-box">
      <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box">
        <div className="wlaudio-background-border-4">
          <img className="wlaudio-ab6axudiyelfjzluw1ix-bh49bs2rsdb" src="/images/cd71333ef618.jpg" alt="AB6AXuDIyelFJzLUw1Ix_BH49bs2RSDBfkEZjmDR17tyj88IE9nCQuugyMOvxnNd9twA8UMgdx9veGTpGZuYNzAWAwSKi2yvk-Q0eMftj7OfJdf_h1IyTjmy8RckRgUXyKUlbBkIm4z-M7cIGgVlncpxbyJKBlCsqmAaBm0iKV9_QFfB-GSsIuque3nHfgWa6Yq7Y7cq9qYCZiJYNeOAcQI16gmNhHE0VVq-lP-4W2PKC1aIetwgMWYRJb4" />
          <div className="wlaudio-background-border-4-box">
            <span className="wlaudio-background-border-4-box-text">STUDIO PREP</span>
          </div>
        </div>
      </div>
      <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2">
        <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box">
          <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-box">
            <h3 className="wlaudio-heading-3-2">
              <span className="wlaudio-heading-3-2-text">{"Titash Ekti Nadir Naam "}<span className="wlaudio-span">(তিতাস</span><br /><span className="wlaudio-span">একটি নদীর নাম)</span></span>
            </h3>
            <div className="wlaudio-background-border-3">
              <span className="wlaudio-background-border-3-text">CLASSICS SERIES</span>
            </div>
          </div>
          <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-box-2">
            <span className="wlaudio-by-advaita-mallabarman-complete">{"By "}<span className="wlaudio-span-2">Advaita Mallabarman</span>{" \u2022 Complete Unabridged"}</span>
          </div>
          <div className="wlaudio-border-2">
            <div className="wlaudio-border-2-box">
              <div className="wlaudio-border-2-box-box">
                <span className="wlaudio-narrator">NARRATOR</span>
              </div>
              <span className="wlaudio-border-2-box-text">Jayanta<br />Chattopadhyay</span>
            </div>
            <div className="wlaudio-border-2-box-2">
              <div className="wlaudio-border-2-box-2-box">
                <span className="wlaudio-estimated-duration">ESTIMATED DURATION</span>
              </div>
              <span className="wlaudio-border-2-box-2-text">7 hrs 40 mins</span>
            </div>
            <div className="wlaudio-border-2-box-2">
              <div className="wlaudio-border-2-box-2-box">
                <span className="wlaudio-status">STATUS</span>
              </div>
              <span className="wlaudio-border-2-box-2-text-2">Sound Editing</span>
            </div>
          </div>
        </div>
        <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2">
          <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box">
            <button type="button" aria-pressed={notify} onClick={() => setNotify((v) => !v)} className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box">
              <img className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box-box" src="/svg/container-jfe5kq.svg" alt="" width="14" height="14" />
              <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box-box-2">
                <span className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box-box-2-text">{notify ? 'NOTIFICATION SET ✓' : 'NOTIFY ON RELEASE'}</span>
              </div>
            </button>
            <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box-2">
              <span className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-box-2-text">Est. Launch: May 1, 2026</span>
            </div>
          </div>
          <button type="button" onClick={() => remove(2)} className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-2">
            <img className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-2-box" src="/svg/container-cc6ysq.svg" alt="" width="10" height="11" />
            <div className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-2-box-2">
              <span className="wlaudio-article-entry-2-titash-ekti-nadi-box-box-2-box-2-box-2-box-2-text">REMOVE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </article>
  );
  cards[3] = (
    <article className="wlaudio-article-entry-3-padma-nadir-majh">
    <div className="wlaudio-background-horizontalborder">
      <div className="wlaudio-background-horizontalborder-box">
        <div className="wlaudio-background-horizontalborder-box-box" />
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">FOLIO CALL: NL-REC-0104</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text-2">|</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">AUDIO ARCHIVAL STACK</span>
        </div>
      </div>
      <div className="wlaudio-background-horizontalborder-box-2">
        <img className="wlaudio-background-horizontalborder-box-2-box-3" src="/svg/container-1kurbyn.svg" alt="" width="14" height="14" />
        <div className="wlaudio-background-horizontalborder-box-2-box-2">
          <span className="wlaudio-background-horizontalborder-box-2-box-2-text">AVAILABLE IN ARCHIVES</span>
        </div>
      </div>
    </div>
    <div className="wlaudio-article-entry-3-padma-nadir-majh-box">
      <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box">
        <div className="wlaudio-background-border-2">
          <img className="wlaudio-ab6axubptcgc-oxwokwrovz5kogwyg-w" src="/images/5bac86763352.jpg" alt="AB6AXuBptcGC-OXwOkWROVz5koGWYg-WBBY3kJySR57fa-MN9lhX2rlONevX48LbtMzHaAwJ43hiLar7twfJHMQVpkE7EIvvrwuOS3t6qLsjmtyaavLhI--Zk7auAHIBrLzkN-5InvunzMoaBHjxU-lK5NsHmcgLrkM5ISrKzCq2fEZLs-_Yq_io59QCUpEi8W6fqWFV-RkLQVR365Gnvfy2CRKlQBXXrfKiimu68iu5dRQ4fCUjttVQKic" />
        </div>
      </div>
      <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2">
        <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box">
          <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-box">
            <span className="wlaudio-heading-3">{"Padma Nadir Majhi "}<span className="wlaudio-span">(পদ্মা নদীর মাঝি)</span></span>
            <div className="wlaudio-background-border-3">
              <span className="wlaudio-background-border-3-text">RESTORED AUDIO</span>
            </div>
          </div>
          <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-box-2">
            <span className="wlaudio-by-manik-bandopadhyay-archival-d">{"By "}<span className="wlaudio-span-2">Manik Bandopadhyay</span>{" \u2022 Archival Depository Track"}</span>
          </div>
          <div className="wlaudio-border">
            <div className="wlaudio-border-box">
              <div className="wlaudio-border-box-box">
                <span className="wlaudio-narrator">NARRATOR</span>
              </div>
              <span className="wlaudio-border-box-text">Golam Sarwar</span>
            </div>
            <div className="wlaudio-border-box-2">
              <div className="wlaudio-border-box-2-box">
                <span className="wlaudio-duration">DURATION</span>
              </div>
              <span className="wlaudio-border-box-2-text">5 hrs 50 mins</span>
            </div>
            <div className="wlaudio-border-box-2">
              <div className="wlaudio-border-box-2-box">
                <span className="wlaudio-acoustic-medium">ACOUSTIC MEDIUM</span>
              </div>
              <span className="wlaudio-border-box-2-text">Digital Remaster</span>
            </div>
          </div>
        </div>
        <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2">
          <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box">
            <button type="button" onClick={() => navigate('/audio-books/padma-nadir-majhi')} className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-box">
              <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-box-box">
                <span className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-box-box-text">LISTEN NOW / শুনুন</span>
              </div>
              <img className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </button>
            <button type="button" onClick={() => navigate('/audio-books/padma-nadir-majhi')} className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-box-2">CHAPTER INDEX</button>
          </div>
          <button type="button" onClick={() => remove(3)} className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-2">
            <img className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-2-box" src="/svg/container-cc6ysq.svg" alt="" width="10" height="11" />
            <div className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-2-box-2">
              <span className="wlaudio-article-entry-3-padma-nadir-majh-box-box-2-box-2-box-2-box-2-text">REMOVE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </article>
  );
  cards[4] = (
    <article className="wlaudio-article-entry-4-hansuli-banker-u">
    <div className="wlaudio-background-horizontalborder">
      <div className="wlaudio-background-horizontalborder-box">
        <div className="wlaudio-background-horizontalborder-box-box" />
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">FOLIO CALL: NL-REC-0027-TAPE</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text-2">|</span>
        </div>
        <div className="wlaudio-background-horizontalborder-box-box-2">
          <span className="wlaudio-background-horizontalborder-box-box-2-text">RARE TAPE RESTORATION</span>
        </div>
      </div>
      <div className="wlaudio-background-horizontalborder-box-2">
        <img className="wlaudio-background-horizontalborder-box-2-box-4" src="/svg/container-17mr416.svg" alt="" width="15" height="14" />
        <div className="wlaudio-background-horizontalborder-box-2-box-2">
          <span className="wlaudio-background-horizontalborder-box-2-box-2-text">RESTORED EDITION AVAILABLE</span>
        </div>
      </div>
    </div>
    <div className="wlaudio-article-entry-4-hansuli-banker-u-box">
      <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box">
        <div className="wlaudio-background-border-2">
          <img className="wlaudio-ab6axudkzx6n8aoyh-jafs9fdvwpi4eg" src="/images/3cb3e85f9278.jpg" alt="AB6AXuDKzX6n8AoyH_jAFS9fdVwPi4EgaQE7XMga5dka8EH518K0aqaiqspm3L64RzR65qV6tOaS8T2LJHBAnGJ-B1DYj94ocXuQWV1565DOUpQGbtBscpZAKGgo049Vu9WKpFJchcgTujXpPG-QqUmG1sPh8bAvKufgYl0pYWvgyvNXCRhCw5Ez0d-EBmHe0XI2FsnsR6BKoSxOKfWdMHQf3IYPJwqeaLRYM778N3Cr0PUa3D5A99Cf-Dc" />
        </div>
      </div>
      <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2">
        <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box">
          <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-box">
            <h3 className="wlaudio-heading-3-3">
              <span className="wlaudio-heading-3-3-text">{"Hansuli Banker Upakatha "}<span className="wlaudio-span">(হাঁসুলী</span>{' '}<br className="soft-br" /><span className="wlaudio-span">বাঁকের উপকথা)</span></span>
            </h3>
            <div className="wlaudio-background-border-3">
              <span className="wlaudio-background-border-3-text">HERITAGE TAPE</span>
            </div>
          </div>
          <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-box-2">
            <span className="wlaudio-by-tarashankar-bandopadhyay-rest">{"By "}<span className="wlaudio-span-2">Tarashankar Bandopadhyay</span>{" \u2022 Restored 1978 Reel-to-Reel Master"}</span>
          </div>
          <div className="wlaudio-border-2">
            <div className="wlaudio-border-2-box">
              <div className="wlaudio-border-2-box-box">
                <span className="wlaudio-narrator">NARRATOR</span>
              </div>
              <span className="wlaudio-border-2-box-text">Aly Zaker (Tape<br />Restoration)</span>
            </div>
            <div className="wlaudio-border-2-box-2">
              <div className="wlaudio-border-2-box-2-box">
                <span className="wlaudio-duration">DURATION</span>
              </div>
              <span className="wlaudio-border-2-box-2-text">8 hrs 20 mins</span>
            </div>
            <div className="wlaudio-border-2-box-3">
              <div className="wlaudio-border-2-box-3-box">
                <span className="wlaudio-acoustics">ACOUSTICS</span>
              </div>
              <span className="wlaudio-border-2-box-3-text">De-noised Archival<br />Mono</span>
            </div>
          </div>
        </div>
        <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2">
          <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box">
            <button type="button" onClick={() => navigate('/audio-books/hansuli-banker-upakatha')} className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-box">
              <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-box-box">
                <span className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-box-box-text">LISTEN NOW / শুনুন</span>
              </div>
              <img className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-box-box-2" src="/svg/container-s8x64t.svg" alt="" width="11" height="11" />
            </button>
            <button type="button" onClick={() => navigate('/audio-books/hansuli-banker-upakatha')} className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-box-2">TAPE NOTES</button>
          </div>
          <button type="button" onClick={() => remove(4)} className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-2">
            <img className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-2-box" src="/svg/container-cc6ysq.svg" alt="" width="10" height="11" />
            <div className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-2-box-2">
              <span className="wlaudio-article-entry-4-hansuli-banker-u-box-box-2-box-2-box-2-box-2-text">REMOVE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </article>
  );

  return (
    <div className="wlaudio">
      <section className="wlaudio-main">
        <div className="wlaudio-main-box">
          <section className="wlaudio-folio-header-breadcrumbs-strip">
            <div className="wlaudio-folio-header-breadcrumbs-strip-box">
              <nav className="wlaudio-nav">
                <Link to="/" className="wlaudio-nav-box">HOME</Link>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text">/</span>
                </div>
                <Link to="/wishlist/books" className="wlaudio-nav-box">WISHLIST</Link>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text">/</span>
                </div>
                <div className="wlaudio-nav-box-2">
                  <span className="wlaudio-nav-box-2-text-2">AUDIO BOOKS WISHLIST (অডিও বুকের উইশলিস্ট)</span>
                </div>
              </nav>
              <div className="wlaudio-folio-header-breadcrumbs-strip-box-box">
                <div className="wlaudio-folio-header-breadcrumbs-strip-box-box-box" />
                <div className="wlaudio-folio-header-breadcrumbs-strip-box-box-box-2">
                  <span className="wlaudio-folio-header-breadcrumbs-strip-box-box-box-2-text">ARCHIVAL SOUND DEPOSITORY • DIVISION IV</span>
                </div>
              </div>
            </div>
          </section>
          <section className="wlaudio-title-scholarly-foreword">
            <div className="wlaudio-title-scholarly-foreword-box">
              <div className="wlaudio-title-scholarly-foreword-box-box">
                <div className="wlaudio-title-scholarly-foreword-box-box-box">
                  <div className="wlaudio-title-scholarly-foreword-box-box-box-box">
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text">PATRON LISTENING REGISTER & STUDIO DESK</span>
                    </div>
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text-2">•</span>
                    </div>
                    <div className="wlaudio-title-scholarly-foreword-box-box-box-box-box">
                      <span className="wlaudio-title-scholarly-foreword-box-box-box-box-box-text-3">Foliated Audio Dossier #AB-2026</span>
                    </div>
                  </div>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-2">
                  <h1 className="wlaudio-heading-1">Patron Audio Books Wishlist & Production{' '}<br className="soft-br" />Requests</h1>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-3">
                  <div className="wlaudio-title-scholarly-foreword-box-box-box-3-box">
                    <span className="wlaudio-title-scholarly-foreword-box-box-box-3-box-text">অডিও বুক উইশলিস্ট ও নতুন রেকর্ডিং প্রস্তাবনা</span>
                  </div>
                </div>
                <div className="wlaudio-title-scholarly-foreword-box-box-box-4">
                  <span className="wlaudio-title-scholarly-foreword-box-box-box-4-text">Curate your preserved spoken-word manuscripts, listen to master analog tape restorations, and submit{' '}<br className="soft-br" />literary titles to the Noholi Spoken Audio Studio for archival production or preservation remastering.</span>
                </div>
              </div>
              <div className="wlaudio-title-scholarly-foreword-box-box-2">
                <div className="wlaudio-background-border">
                  <div className="wlaudio-horizontalborder">
                    <div className="wlaudio-horizontalborder-box">
                      <span className="wlaudio-horizontalborder-box-text">STUDIO MASTER REGISTER</span>
                    </div>
                    <div className="wlaudio-horizontalborder-box">
                      <span className="wlaudio-horizontalborder-box-text-2">4 ACTIVE ENTRIES</span>
                    </div>
                  </div>
                  <div className="wlaudio-background-border-box">
                    <div className="wlaudio-background-border-box-box">
                      <div className="wlaudio-background-border-box-box-box">
                        <span className="wlaudio-archive-code">ARCHIVE CODE</span>
                      </div>
                      <span className="wlaudio-background-border-box-box-text">Dhaka-Studio-A</span>
                    </div>
                    <div className="wlaudio-background-border-box-box">
                      <div className="wlaudio-background-border-box-box-box">
                        <span className="wlaudio-master-format">MASTER FORMAT</span>
                      </div>
                      <span className="wlaudio-background-border-box-box-text">96kHz / 24-bit PCM</span>
                    </div>
                    <div className="wlaudio-horizontalborder-2">
                      <div className="wlaudio-horizontalborder-2-box">
                        <span className="wlaudio-unrestricted-listening-privilege">Unrestricted listening privileges active for Patron #NL-{' '}<br className="soft-br" />88204.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="wlaudio-main-content-grid">
            <div className="wlaudio-main-content-grid-box">
              <div className="wlaudio-left-column-wishlist-entries">
                <div className="wlaudio-left-column-wishlist-entries-box">
                  <div className="wlaudio-horizontalborder-3">
                    <p className="wlaudio-paragraph">
                      <span className="wlaudio-heading-2">In My Audio Wishlist</span>
                      <span className="wlaudio-paragraph-text">সংরক্ষিত অডিও গ্রন্থতালিকা</span>
                    </p>
                    <div className="wlaudio-horizontalborder-3-box">
                      <div className="wlaudio-horizontalborder-3-box-box">
                        <span className="wlaudio-horizontalborder-3-box-box-text">SORT BY:</span>
                      </div>
                      <div className="wlaudio-horizontalborder-3-box-box">
                        <button type="button" aria-label="Change sort order" onClick={() => setSort((v) => (v + 1) % SORTS.length)} className="wlaudio-horizontalborder-3-box-box-text-2">{SORTS[sort].label}</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="wlaudio-entries-container">
                  {SORTS[sort].order.filter((n) => !removed.includes(n)).map((n) => <Fragment key={n}>{cards[n]}</Fragment>)}
                </div>
                <div className="wlaudio-bottom-archival-note">
                  <div className="wlaudio-bottom-archival-note-2">
                    <img className="wlaudio-bottom-archival-note-2-box" src="/svg/icon-kc958c.svg" alt="" width="20" height="22" />
                    <p className="wlaudio-paragraph-2">
                      <span className="wlaudio-paragraph-2-text">PATRON ARCHIVAL LISTENING NOTICE</span>
                      <span className="wlaudio-paragraph-2-text-2">All audiobooks streamed via Noholi Library are digitized from original letterpress{' '}<br className="soft-br" />editions and historic spoken archives. Recordings marked as "Restored Edition" preserve{' '}<br className="soft-br" />the original room reverberance and vocal tone of historical narrators.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="wlaudio-right-column-recommend-for-produ">
                <div className="wlaudio-recommendation-form-panel">
                  <div className="wlaudio-horizontalborder-4">
                    <div className="wlaudio-horizontalborder-4-box">
                      <span className="wlaudio-noholi-spoken-audio-studio-desk">NOHOLI SPOKEN AUDIO STUDIO DESK</span>
                    </div>
                    <h2 className="wlaudio-heading-2-2">Recommend an Audio Book for<br />Production or Acquisition</h2>
                    <div className="wlaudio-horizontalborder-4-box-2">
                      <span className="wlaudio-horizontalborder-4-box-2-text">নতুন অডিও বুক রেকর্ডিংয়ের প্রস্তাবনা জমা দিন</span>
                    </div>
                  </div>
                  <div className="wlaudio-recommendation-form-panel-box">
                    <span className="wlaudio-help-determine-the-next-titles-p">Help determine the next titles preserved by our recording{' '}<br className="soft-br" />press. Propose critical Bengali novels, poetry collections, or{' '}<br className="soft-br" />research tracts for studio narration.</span>
                  </div>
                  <form className="wlaudio-form" onSubmit={onSubmit} noValidate>
                    <div className="wlaudio-field-book-title">
                      <label className="wlaudio-label" htmlFor="wlaudio-book-title"><span>{"BOOK TITLE (LATIN OR BENGALI) "}<span className="wlaudio-span-3">*</span></span></label>
                      <input id="wlaudio-book-title" name="book-title" required className="wlaudio-input" placeholder="e.g. চাঁদের পাহাড় (Chander Pahar) or Gora" />
                    </div>
                    <div className="wlaudio-field-original-author">
                      <label className="wlaudio-label" htmlFor="wlaudio-original-author"><span>{"ORIGINAL AUTHOR "}<span className="wlaudio-span-3">*</span></span></label>
                      <input id="wlaudio-original-author" name="original-author" required className="wlaudio-input-2" placeholder="e.g. Bibhutibhushan Bandopadhyay or Rabindranath Tagore" />
                    </div>
                    <div className="wlaudio-field-desired-narrator">
                      <label className="wlaudio-label" htmlFor="wlaudio-desired-narrator-voice-artist"><span>{"DESIRED NARRATOR / VOICE ARTIST "}<span className="wlaudio-span-4">(OPTIONAL)</span></span></label>
                      <input id="wlaudio-desired-narrator-voice-artist" name="desired-narrator-voice-artist" className="wlaudio-input-3" placeholder="Prefer dramatic voice / কথাসাহিত্য কণ্ঠশিল্পী" />
                      <div className="wlaudio-field-desired-narrator-box">
                        <span className="wlaudio-specify-preferred-cadence">Specify preferred cadence (e.g. baritone, classical elocutionist,{' '}<br className="soft-br" />theatrical).</span>
                      </div>
                    </div>
                    <div className="wlaudio-field-publication-year-source-ed">
                      <label className="wlaudio-label" htmlFor="wlaudio-publication-year-or-source-editi"><span>{"PUBLICATION YEAR OR SOURCE EDITION "}<span className="wlaudio-span-4">(OPTIONAL)</span></span></label>
                      <input id="wlaudio-publication-year-or-source-editi" name="publication-year-or-source-editi" className="wlaudio-input-4" placeholder="e.g. 1937 Mitra & Ghosh First Edition" />
                    </div>
                    <div className="wlaudio-field-justification">
                      <label className="wlaudio-label" htmlFor="wlaudio-why-should-the-library-produce-o">WHY SHOULD THE LIBRARY PRODUCE OR ACQUIRE THIS{' '}<br className="soft-br" />AUDIOBOOK?</label>
                      <textarea id="wlaudio-why-should-the-library-produce-o" name="why-should-the-library-produce-o" className="wlaudio-textarea" placeholder={"Note scholarly significance, linguistic value, or oral \nhistory accessibility needs..."} />
                    </div>
                    <button type="submit" className="wlaudio-submit-button-in-brand-sealing-w">
                      <div className="wlaudio-submit-button-in-brand-sealing-w-box">
                        <span className="wlaudio-submit-button-in-brand-sealing-w-box-text">SUBMIT AUDIO BOOK REQUEST / অডিও বুক প্রস্তাব{' '}<br className="soft-br" />জমা দিন</span>
                      </div>
                      <img className="wlaudio-submit-button-in-brand-sealing-w-box-2" src="/svg/container-1ffsp6i.svg" alt="" width="13" height="11" />
                    </button>
                    <div className="wlaudio-paragraph-horizontalborder">
                      <span className="wlaudio-paragraph-horizontalborder-text">Proposals are adjudicated every month by the Noholi Sound &</span>
                      <span className="wlaudio-paragraph-horizontalborder-text">Literature Board.</span>
                    </div>
                    <Status status={status} />
                  </form>
                </div>
                <div className="wlaudio-my-audio-recording-proposals-led">
                  <div className="wlaudio-horizontalborder-5">
                    <p className="wlaudio-paragraph">
                      <span className="wlaudio-heading-3-4">My Audio Recording Proposals</span>
                      <span className="wlaudio-paragraph-text">আমার পূর্বের প্রস্তাবনাসমূহ</span>
                    </p>
                    <div className="wlaudio-background-border-5">
                      <span className="wlaudio-background-border-5-text">2 Tracked</span>
                    </div>
                  </div>
                  <div className="wlaudio-my-audio-recording-proposals-led-box">
                    <div className="wlaudio-proposal-1">
                      <div className="wlaudio-proposal-1-box">
                        <h4 className="wlaudio-heading-4">
                          <span className="wlaudio-heading-4-text">{"Aranyak "}</span>
                          <span className="wlaudio-heading-4-text-2">(আরণ্যক)</span>
                        </h4>
                        <div className="wlaudio-proposal-1-box-box">
                          <span className="wlaudio-proposal-1-box-box-text">APPROVED</span>
                        </div>
                      </div>
                      <div className="wlaudio-proposal-1-box-2">
                        <span className="wlaudio-author-bibhutibhushan-bandopadhy">Author: Bibhutibhushan Bandopadhyay</span>
                      </div>
                      <div className="wlaudio-horizontalborder-6">
                        <div className="wlaudio-horizontalborder-6-box">
                          <span className="wlaudio-horizontalborder-6-box-text">Studio Recording Scheduled: Winter 2026</span>
                        </div>
                        <div className="wlaudio-horizontalborder-6-box">
                          <span className="wlaudio-horizontalborder-6-box-text-2">Ref #PR-2025-91</span>
                        </div>
                      </div>
                    </div>
                    <div className="wlaudio-proposal-2">
                      <div className="wlaudio-proposal-2-box">
                        <h4 className="wlaudio-heading-4-2">
                          <span className="wlaudio-heading-4-2-text">{"Lalshalu "}</span>
                          <span className="wlaudio-heading-4-2-text-2">(লালসালু)</span>
                        </h4>
                        <div className="wlaudio-proposal-2-box-box">
                          <span className="wlaudio-proposal-2-box-box-text">IN REVIEW</span>
                        </div>
                      </div>
                      <div className="wlaudio-proposal-2-box-2">
                        <span className="wlaudio-author-syed-waliullah">Author: Syed Waliullah</span>
                      </div>
                      <div className="wlaudio-horizontalborder-6">
                        <div className="wlaudio-horizontalborder-6-box">
                          <span className="wlaudio-horizontalborder-6-box-text-3">Under Curatorial Script Review</span>
                        </div>
                        <div className="wlaudio-horizontalborder-6-box">
                          <span className="wlaudio-horizontalborder-6-box-text-2">Ref #PR-2026-14</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="wlaudio-archival-folio-footer-in-sidebar">
                    <Link to="/rules" className="wlaudio-archival-folio-footer-in-sidebar-box">
                      <div className="wlaudio-archival-folio-footer-in-sidebar-box-box">
                        <span className="wlaudio-archival-folio-footer-in-sidebar-box-box-text">VIEW FULL PRODUCTION GUIDELINES</span>
                      </div>
                      <img className="wlaudio-archival-folio-footer-in-sidebar-box-box-2" src="/svg/container-yovyrz.svg" alt="" width="9" height="9" />
                    </Link>
                  </div>
                </div>
                <div className="wlaudio-studio-equipment-quality-seal">
                  <div className="wlaudio-studio-equipment-quality-seal-box">
                    <img className="wlaudio-studio-equipment-quality-seal-box-box" src="/svg/background-mq7vyh.svg" alt="" width="40" height="40" />
                    <div className="wlaudio-studio-equipment-quality-seal-box-box-2">
                      <div className="wlaudio-studio-equipment-quality-seal-box-box-2-box">
                        <span className="wlaudio-studio-equipment-quality-seal-box-box-2-box-text">NOHOLI SPOKEN AUDIO MASTER SEAL</span>
                      </div>
                      <div className="wlaudio-studio-equipment-quality-seal-box-box-2-box">
                        <span className="wlaudio-studio-equipment-quality-seal-box-box-2-box-text-2">Calibrated with Neumann U87 microphones & Studer analog{' '}<br className="soft-br" />preamps.</span>
                      </div>
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
