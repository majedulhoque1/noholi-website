import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import './Contact.css';

const SUBJECTS = ['General Inquiry', 'Study & Reading Room Reservation', 'Membership Question', 'Manuscript & Publication Submission'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generated from Figma frame "Noholi Library — Contact (Before Login)" (36:1382) by tools/gen.py, then hand-edited.
export default function Contact() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [status, setStatus] = useState(null);   // { ok, text }
  const [copied, setCopied] = useState('');

  const [sending, setSending] = useState(false);

  // Sends to the `public-intake` edge function (type 'contact'); the message lands in the
  // library's Messages inbox in Noholi OS, where staff reply by email.
  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const message = data.get('message')?.toString().trim();
    if (!name || !email || !message) return setStatus({ ok: false, text: 'Please fill in your name, email address and inquiry statement.' });
    if (!EMAIL_RE.test(email)) return setStatus({ ok: false, text: 'Please enter a valid email address.' });
    setSending(true);
    setStatus(null);
    try {
      const { data: res, error } = await supabase.functions.invoke('public-intake', {
        body: { type: 'contact', name, email, subject, message, website: data.get('website')?.toString() ?? '' },
      });
      if (error) {
        // Non-2xx: the function answers { error: { code, message } } with a reader-facing message.
        let msg = '';
        try { msg = (await error.context?.json())?.error?.message || ''; } catch { /* not JSON */ }
        throw new Error(msg || 'Your message could not be sent. Please check your connection and try again.');
      }
      if (!res?.ok) throw new Error('Your message could not be sent. Please try again.');
      setStatus({ ok: true, text: `Thank you, ${name}. Your message has reached the library team, who will reply to ${email}.` });
      form.reset();
      setSubject(SUBJECTS[0]);
    } catch (err) {
      setStatus({ ok: false, text: err?.message || 'Your message could not be sent. Please try again.' });
    } finally {
      setSending(false);
    }
  };
  const copy = (key, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };
  // The design only has "[Email]" / "[Phone]" placeholders, so these take the visitor to the form.
  const toForm = (e) => {
    e.preventDefault();
    document.getElementById('contact-name')?.focus();
  };

  return (
    <div className="contact">
      <section className="contact-main">
        <div className="contact-main-box">
          <section className="contact-archival-header-rule-breadcrumb">
            <div className="contact-archival-header-rule-breadcrumb-box">
              <nav className="contact-nav-breadcrumb">
                <Link to="/" className="contact-nav-breadcrumb-box">HOME</Link>
                <div className="contact-nav-breadcrumb-box-2">
                  <span className="contact-nav-breadcrumb-box-2-text">/</span>
                </div>
                <div className="contact-nav-breadcrumb-box-2">
                  <span className="contact-nav-breadcrumb-box-2-text-2">CONTACT</span>
                </div>
              </nav>
            </div>
          </section>
          <section className="contact-title-context-block">
            <div className="contact-title-context-block-box">
              <p className="contact-paragraph">
                <span className="contact-heading-1">Contact Us</span>
                <span className="contact-paragraph-text">যোগাযোগ</span>
              </p>
              <div className="contact-horizontal-divider" />
              <div className="contact-title-context-block-box-box">
                <span className="contact-for-inquiries-study-reservations">For inquiries, study reservations, membership questions, or manuscript and publication submissions,{' '}<br className="soft-br" />please get in touch using the details or form below. We will respond to your message as soon as{' '}<br className="soft-br" />possible.</span>
              </div>
            </div>
          </section>
          <section className="contact-main-body-two-column-ledger-layo">
            <div className="contact-main-body-two-column-ledger-layo-box">
              <div className="contact-aside-left-column-direct-registe">
                <div className="contact-background-border">
                  <div className="contact-horizontalborder">
                    <div className="contact-horizontalborder-box">
                      <span className="contact-direct-channels">DIRECT CHANNELS / সরাসরি যোগাযোগ</span>
                    </div>
                    <img className="contact-horizontalborder-box-2" src="/svg/container-cxd2hl.svg" alt="" width="18" height="15" />
                  </div>
                  <div className="contact-background-border-box">
                    <div className="contact-item-email">
                      <div className="contact-item-email-box">
                        <div className="contact-item-email-box-box">
                          <span className="contact-item-email-box-box-text">ELECTRONIC MAIL</span>
                        </div>
                        <div className="contact-item-email-box-box-2">
                          <span className="contact-item-email-box-box-2-text">Primary Desk</span>
                        </div>
                      </div>
                      <div className="contact-item-email-box-2">
                        <span className="contact-email">[Email]</span>
                      </div>
                      <div className="contact-item-email-box-3">
                        <a href="#contact-form" onClick={toForm} className="contact-item-email-box-3-box">
                          <img className="contact-item-email-box-3-box-box" src="/svg/container-1ojnpl6.svg" alt="" width="13" height="11" />
                          <div className="contact-item-email-box-3-box-box-2">
                            <span className="contact-item-email-box-3-box-box-2-text">WRITE MAIL</span>
                          </div>
                        </a>
                        <button type="button" className="contact-item-email-box-3-box-2" onClick={() => copy('email', '[Email]')}>
                          <img className="contact-item-email-box-3-box-2-box" src="/svg/container-t1wa3w.svg" alt="" width="11" height="13" />
                          <div className="contact-item-email-box-3-box-2-box-2">
                            <span className="contact-item-email-box-3-box-2-box-2-text">{copied === 'email' ? 'COPIED' : 'COPY'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="contact-item-phone">
                      <div className="contact-item-phone-box">
                        <div className="contact-item-phone-box-box">
                          <span className="contact-item-phone-box-box-text">TELEPHONE DESK</span>
                        </div>
                        <div className="contact-item-phone-box-box-2">
                          <span className="contact-item-phone-box-box-2-text">Enquiries</span>
                        </div>
                      </div>
                      <div className="contact-item-phone-box-2">
                        <span className="contact-phone">[Phone]</span>
                      </div>
                      <div className="contact-item-phone-box-3">
                        <a href="#contact-form" onClick={toForm} className="contact-item-phone-box-3-box">
                          <img className="contact-item-phone-box-3-box-box" src="/svg/container-oeeavl.svg" alt="" width="12" height="12" />
                          <div className="contact-item-phone-box-3-box-box-2">
                            <span className="contact-item-phone-box-3-box-box-2-text">DIAL DESK</span>
                          </div>
                        </a>
                        <button type="button" className="contact-item-phone-box-3-box-2" onClick={() => copy('phone', '[Phone]')}>
                          <img className="contact-item-phone-box-3-box-2-box" src="/svg/container-t1wa3w.svg" alt="" width="11" height="13" />
                          <div className="contact-item-phone-box-3-box-2-box-2">
                            <span className="contact-item-phone-box-3-box-2-box-2-text">{copied === 'phone' ? 'COPIED' : 'COPY'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="contact-item-physical-location">
                      <div className="contact-item-physical-location-box">
                        <div className="contact-item-physical-location-box-box">
                          <span className="contact-item-physical-location-box-box-text">PHYSICAL LOCATION</span>
                        </div>
                        <img className="contact-item-physical-location-box-box-2" src="/svg/container-s7cj1v.svg" alt="" width="11" height="14" />
                      </div>
                      <div className="contact-item-physical-location-box-2">
                        <span className="contact-address">[Address]</span>
                      </div>
                      <div className="contact-item-physical-location-box-3">
                        <span className="contact-visitors-are-welcome-during-open">Visitors are welcome during open hours. Special collection access can be{' '}<br className="soft-br" />requested in advance.</span>
                      </div>
                    </div>
                    <div className="contact-item-reading-room-hours">
                      <div className="contact-item-reading-room-hours-box">
                        <div className="contact-item-reading-room-hours-box-box">
                          <span className="contact-item-reading-room-hours-box-box-text">READING ROOM & ARCHIVES</span>
                        </div>
                        <img className="contact-item-reading-room-hours-box-box-2" src="/svg/container-1f2jvch.svg" alt="" width="14" height="14" />
                      </div>
                      <div className="contact-item-reading-room-hours-box-2">
                        <span className="contact-hours-to-confirm">[Hours — to confirm]</span>
                      </div>
                      <div className="contact-item-reading-room-hours-box-3">
                        <span className="contact-closed-on-gazetted-holidays">CLOSED ON GAZETTED HOLIDAYS</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="contact-scholarly-note-marginalia-callou">
                  <div className="contact-scholarly-note-marginalia-callou-box">
                    <span className="contact-scholarly-note-marginalia-callou-box-text">§</span>
                    <div className="contact-scholarly-note-marginalia-callou-box-box">
                      <h4 className="contact-heading-4">Noholi Press Manuscripts</h4>
                      <div className="contact-scholarly-note-marginalia-callou-box-box-box">
                        <span className="contact-scholarly-note-marginalia-callou-box-box-box-text">For publishing inquiries, translation drafts, or manuscript proposals, please{' '}<br className="soft-br" />reach out via email with an accompanying abstract and biographical note.</span>
                      </div>
                    </div>
                  </div>
                  <div className="contact-scholarly-note-marginalia-callou-box-2" />
                </div>
              </div>
              <div className="contact-right-column-clean-archival-inqu">
                <div className="contact-horizontalborder-2">
                  <div className="contact-horizontalborder-2-box">
                    <div className="contact-horizontalborder-2-box-box">
                      <span className="contact-send-a-message">SEND A MESSAGE / বার্তা প্রেরণ</span>
                    </div>
                  </div>
                  <h2 className="contact-heading-2">Send Us a Message</h2>
                </div>
                <form id="contact-form" className="contact-form" onSubmit={onSubmit} noValidate>
                  {/* honeypot: people never see or fill this; bots that do are quietly ignored */}
                  <div className="contact-hp" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                  <div className="contact-row-name-email">
                    <div className="contact-row-name-email-box">
                      <div className="contact-label">
                        <div className="contact-label-box">
                          <label htmlFor="contact-name" className="contact-full-name">FULL NAME / পূর্ণ নাম</label>
                        </div>
                        <div className="contact-label-box">
                          <span className="contact-label-box-text">*</span>
                        </div>
                      </div>
                      <input className="contact-input" id="contact-name" name="name" autoComplete="name" required placeholder="e.g. S. Rahman" />
                    </div>
                    <div className="contact-row-name-email-box">
                      <div className="contact-label">
                        <div className="contact-label-box">
                          <label htmlFor="contact-email" className="contact-email-address">EMAIL ADDRESS / ইমেইল</label>
                        </div>
                        <div className="contact-label-box">
                          <span className="contact-label-box-text">*</span>
                        </div>
                      </div>
                      <input className="contact-input-2" id="contact-email" name="email" type="email" autoComplete="email" required placeholder="reader@noholi.org" />
                    </div>
                  </div>
                  <div className="contact-subject-select">
                    <label className="contact-label-2" htmlFor="contact-subject">SUBJECT / বিষয়</label>
                    <div className="contact-subject-select-box">
                      <div className="contact-options">
                        <div className="contact-options-box">
                          <span className="contact-general-inquiry">{subject}</span>
                        </div>
                      </div>
                      <img className="contact-subject-select-box-box" src="/svg/container-ue9qx1.svg" alt="" width="10" height="20" />
                      <select id="contact-subject" name="subject" className="contact-native-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                        {SUBJECTS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="contact-message-body">
                    <div className="contact-label">
                      <div className="contact-label-box">
                        <label htmlFor="contact-message" className="contact-inquiry-statement">INQUIRY STATEMENT / বিবরণ</label>
                      </div>
                      <div className="contact-label-box">
                        <span className="contact-label-box-text">*</span>
                      </div>
                    </div>
                    <textarea className="contact-textarea" id="contact-message" name="message" required placeholder="Please state call numbers, research topic, accession details, or publishing questions..." />
                  </div>
                  <div className="contact-fine-print-dispatch-button">
                    <div className="contact-fine-print-dispatch-button-box">
                      <span className="contact-fine-print-dispatch-button-box-text">Messages are answered in the order received. For urgent reference{' '}<br className="soft-br" />assistance, please reach out by telephone.</span>
                    </div>
                    <button type="submit" className="contact-fine-print-dispatch-button-box-2" disabled={sending} aria-busy={sending}>{sending ? 'SENDING…' : 'SEND INQUIRY'}</button>
                  </div>
                  {status && <p className={status.ok ? 'contact-form-status is-ok' : 'contact-form-status'} role={status.ok ? 'status' : 'alert'}>{status.text}</p>}
                </form>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
