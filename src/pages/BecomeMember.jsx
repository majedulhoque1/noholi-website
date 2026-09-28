import { useState } from 'react';
import { Link } from 'react-router-dom';
import './BecomeMember.css';

// Generated from Figma frame "Noholi Library — Become a Member (Before Login)" (36:1002) by tools/gen.py, then hand-edited.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = { name: 'full name', email: 'email address', phone: 'phone number', street: 'street address', city: 'city / area', district: 'district', postal: 'postal code' };

export default function BecomeMember() {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState(null);   // { ok, text }

  const onPhoto = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && (!/^image\/(jpeg|png)$/.test(file.type) || file.size > 2 * 1024 * 1024)) {
      setStatus({ ok: false, text: 'The photograph must be a JPG or PNG file of 2MB or less.' });
      e.target.value = '';
      setPhoto(null);
      return;
    }
    setPhoto(file);
    setStatus(null);
  };

  // No backend yet: validate, confirm, and clear the form.
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const missing = Object.entries(REQUIRED).filter(([k]) => !data.get(k)?.toString().trim()).map(([, label]) => label);
    if (!photo) missing.push('applicant photo');
    if (missing.length) return setStatus({ ok: false, text: `Please complete: ${missing.join(', ')}.` });
    if (!EMAIL_RE.test(data.get('email').toString().trim())) return setStatus({ ok: false, text: 'Please enter a valid email address.' });
    setStatus({ ok: true, text: `Thank you, ${data.get('name').toString().trim()}. Your application has been received. Please visit the circulation desk with your guarantor to complete verification.` });
    form.reset();
    setPhoto(null);
  };

  return (
    <div className="join">
      <div className="join-breadcrumb">
        <div className="join-breadcrumb-box">
          <Link to="/" className="join-breadcrumb-box-box">HOME</Link>
          <div className="join-breadcrumb-box-box-2">
            <span className="join-breadcrumb-box-box-2-text">/</span>
          </div>
          <div className="join-breadcrumb-box-box-2">
            <span className="join-breadcrumb-box-box-2-text-2">BECOME A MEMBER</span>
          </div>
        </div>
      </div>
      <section className="join-main">
        <div className="join-main-box">
          <div className="join-title-area">
            <span className="join-title-area-text">READER REGISTRATION</span>
            <h1 className="join-heading-1">
              <span className="join-heading-1-text">{"Become a Member "}</span>
              <span className="join-heading-1-text-2">সদস্যপদ গ্রহণ</span>
            </h1>
            <div className="join-title-area-box">
              <span className="join-title-area-box-text">Noholi Library is a community reading sanctuary and independent press. Membership is granted via{' '}<br className="soft-br" />guarantor endorsement to preserve our collection for shared public inquiry.</span>
            </div>
          </div>
          <div className="join-the-3-steps">
            <div className="join-horizontalborder">
              <h2 className="join-heading-2">The Membership Process</h2>
              <div className="join-horizontalborder-box">
                <span className="join-horizontalborder-box-text">3-STAGE SEQUENCE</span>
              </div>
            </div>
            <div className="join-the-3-steps-box">
              <div className="join-step-1">
                <div className="join-step-1-box">
                  <div className="join-step-1-box-box">
                    <div className="join-step-1-box-box-box">
                      <span className="join-step-1-box-box-box-text">01</span>
                    </div>
                    <div className="join-step-1-box-box-box">
                      <span className="join-step-1-box-box-box-text-2">STEP I</span>
                    </div>
                  </div>
                  <h3 className="join-heading-3"><span>Registration & Guarantor<br />Endorsement</span></h3>
                  <div className="join-step-1-box-box-2">
                    <span className="join-step-1-box-box-2-text">নিবন্ধন ও জামিনদার সুপারিশ</span>
                  </div>
                  <div className="join-step-1-box-box-3">
                    <span className="join-submit-your-application-with-end">Submit your application with endorsement from an{' '}<br className="soft-br" />active library member or recognized local institutional{' '}<br className="soft-br" />head.</span>
                  </div>
                </div>
                <div className="join-step-1-box-2">
                  <div className="join-horizontalborder-2">
                    <a href="#join-form" className="join-horizontalborder-2-text">Complete form below</a>
                  </div>
                </div>
              </div>
              <div className="join-step-2">
                <div className="join-step-2-box">
                  <div className="join-step-2-box-box">
                    <div className="join-step-2-box-box-box">
                      <span className="join-step-2-box-box-box-text">02</span>
                    </div>
                    <div className="join-step-2-box-box-box">
                      <span className="join-step-2-box-box-box-text-2">STEP II</span>
                    </div>
                  </div>
                  <h3 className="join-heading-3-2">Reader Card Issuance</h3>
                  <div className="join-step-2-box-box-2">
                    <span className="join-step-2-box-box-2-text">পাঠক কার্ড প্রদান</span>
                  </div>
                  <div className="join-step-2-box-box-3">
                    <span className="join-upon-desk-verification-your-indi">Upon desk verification, your individualized physical{' '}<br className="soft-br" />reader credential and accession ledger record are{' '}<br className="soft-br" />prepared.</span>
                  </div>
                </div>
                <div className="join-step-2-box-2">
                  <div className="join-horizontalborder-2">
                    <span className="join-horizontalborder-2-text">Physical card collected at desk</span>
                  </div>
                </div>
              </div>
              <div className="join-step-3">
                <div className="join-step-3-box">
                  <div className="join-step-3-box-box">
                    <div className="join-step-3-box-box-box">
                      <span className="join-step-3-box-box-box-text">03</span>
                    </div>
                    <div className="join-step-3-box-box-box">
                      <span className="join-step-3-box-box-box-text-2">STEP III</span>
                    </div>
                  </div>
                  <h3 className="join-heading-3-2">Borrowing & Circulation</h3>
                  <div className="join-step-3-box-box-2">
                    <span className="join-step-3-box-box-2-text">বই গ্রহণ ও ব্যবহার</span>
                  </div>
                  <div className="join-step-3-box-box-3">
                    <span className="join-borrow-circulating-volumes-or-re">Borrow circulating volumes or request rare editions for{' '}<br className="soft-br" />reading room study under standard loan terms.</span>
                  </div>
                </div>
                <div className="join-step-3-box-2">
                  <div className="join-horizontalborder-2">
                    <span className="join-horizontalborder-2-text">Standard loan terms apply</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="join-application-form-container">
            <div className="join-background-border">
              <div className="join-horizontalborder-3">
                <h2 className="join-heading-2-2">Membership Application</h2>
                <div className="join-horizontalborder-3-box">
                  <span className="join-please-provide-your-contact-info">Please provide your contact information and guarantor details. No fees or payment required.</span>
                </div>
              </div>
              <form id="join-form" className="join-form" onSubmit={onSubmit} noValidate>
                <div className="join-applicant-information">
                  <div className="join-applicant-information-box">
                    <span className="join-applicant-information-2">APPLICANT INFORMATION</span>
                  </div>
                  <div className="join-applicant-information-box-2">
                    <div className="join-applicant-information-box-2-box">
                      <label className="join-label" htmlFor="join-name"><span>{"FULL NAME / \u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09be\u09ae "}<span className="join-span">*</span></span></label>
                      <input className="join-input" id="join-name" name="name" autoComplete="name" required placeholder="e.g. S. Rahman" />
                    </div>
                    <div className="join-applicant-information-box-2-box">
                      <label className="join-label" htmlFor="join-email"><span>{"EMAIL ADDRESS / \u0987\u09ae\u09c7\u0987\u09b2 "}<span className="join-span">*</span></span></label>
                      <input className="join-input-2" id="join-email" name="email" type="email" autoComplete="email" required placeholder="reader@noholi.org" />
                    </div>
                  </div>
                  <div className="join-applicant-information-box-2">
                    <div className="join-applicant-information-box-2-box">
                      <label className="join-label" htmlFor="join-phone"><span>{"PHONE NUMBER / \u09ab\u09cb\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0 "}<span className="join-span">*</span></span></label>
                      <input className="join-input-3" id="join-phone" name="phone" type="tel" autoComplete="tel" required placeholder="+880 1XXX-XXXXXX" />
                    </div>
                    <div className="join-applicant-information-box-2-box">
                      <label className="join-label" htmlFor="join-phone-alt">ALTERNATIVE NUMBER / বিকল্প ফোন নম্বর</label>
                      <input className="join-input-4" id="join-phone-alt" name="phoneAlt" type="tel" placeholder="+880 1XXX-XXXXXX" />
                    </div>
                  </div>
                  <div className="join-applicant-information-box-3">
                    <label className="join-label" htmlFor="join-photo"><span>{"APPLICANT PHOTO / \u0986\u09ac\u09c7\u09a6\u09a8\u0995\u09be\u09b0\u09c0\u09b0 \u099b\u09ac\u09bf "}<span className="join-span">*</span></span></label>
                    <div className="join-background-border-2">
                      <div className="join-background-border-2-box">
                        <img className="join-background-border-3" src="/svg/background-border-1w1l4rm.svg" alt="" width="48" height="48" />
                        <div className="join-background-border-2-box-box">
                          <p className="join-paragraph">
                            <span className="join-paragraph-text">{"Passport Size Photograph "}</span>
                            <span className="join-paragraph-text-2">(পাসপোর্ট সাইজ ছবি)</span>
                          </p>
                          <div className="join-background-border-2-box-box-box">
                            <span className="join-background-border-2-box-box-box-text">{photo ? `Selected: ${photo.name}` : 'JPG, PNG up to 2MB. Clear front-facing view required.'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="join-background-border-2-box-2">
                        <label className="join-label-2" htmlFor="join-photo">BROWSE FILES</label>
                        <input className="visually-hidden" id="join-photo" name="photo" type="file" accept="image/jpeg,image/png" onChange={onPhoto} />
                      </div>
                    </div>
                  </div>
                  <div className="join-applicant-information-box-4">
                    <div className="join-applicant-information-box-4-box">
                      <label className="join-label" htmlFor="join-street"><span>{"STREET ADDRESS / \u09b8\u09dc\u0995\u09c7\u09b0 \u09a0\u09bf\u0995\u09be\u09a8\u09be "}<span className="join-span">*</span></span></label>
                      <input className="join-input-5" id="join-street" name="street" autoComplete="street-address" required placeholder="e.g. House 14, Road 5, Dhanmondi" />
                    </div>
                    <div className="join-applicant-information-box-4-box-2">
                      <div className="join-applicant-information-box-4-box-2-box">
                        <label className="join-label" htmlFor="join-city"><span>{"CITY / AREA / \u09b6\u09b9\u09b0 / \u098f\u09b2\u09be\u0995\u09be "}<span className="join-span">*</span></span></label>
                        <input className="join-input-6" id="join-city" name="city" autoComplete="address-level2" required placeholder="Dhaka" />
                      </div>
                      <div className="join-applicant-information-box-4-box-2-box">
                        <label className="join-label" htmlFor="join-district"><span>{"DISTRICT / \u099c\u09c7\u09b2\u09be "}<span className="join-span">*</span></span></label>
                        <input className="join-input-7" id="join-district" name="district" required placeholder="Dhaka" />
                      </div>
                      <div className="join-applicant-information-box-4-box-2-box">
                        <label className="join-label" htmlFor="join-postal"><span>{"POSTAL CODE / \u09aa\u09cb\u09b8\u09cd\u099f \u0995\u09cb\u09a1 "}<span className="join-span">*</span></span></label>
                        <input className="join-input-8" id="join-postal" name="postal" autoComplete="postal-code" inputMode="numeric" required placeholder="1205" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="join-notice-policy">
                  <span className="join-notice-policy-text">Note:<span className="join-span-2">{" Noholi Library functions on mutual accountability. There are no subscription tiers or membership purchase fees. See"}</span>{' '}<br className="soft-br" /><span className="join-span-2">circulation desk for current policy details.</span></span>
                </div>
                <div className="join-submit-button">
                  <button type="submit" className="join-submit-button-box">SUBMIT APPLICATION</button>
                  {status && <p className={status.ok ? 'join-form-status is-ok' : 'join-form-status'} role={status.ok ? 'status' : 'alert'}>{status.text}</p>}
                </div>
              </form>
            </div>
            <div className="join-information-guidelines-column">
              <div className="join-background-border-4">
                <h3 className="join-heading-3-3">Guarantor Requirements</h3>
                <div className="join-background-border-4-box">
                  <span className="join-a-guarantor-must-be-an-existing">A guarantor must be an existing Noholi reader in good{' '}<br className="soft-br" />standing or a recognized head of a local educational or{' '}<br className="soft-br" />cultural institution.</span>
                </div>
                <div className="join-horizontalborder-4">
                  <span className="join-horizontalborder-4-text">{"Questions? "}<Link to="/contact" className="join-span-3">Inquire at circulation desk</Link>.</span>
                </div>
              </div>
              <div className="join-background-border-4">
                <h3 className="join-heading-3-3">Reader Card Notice</h3>
                <div className="join-background-border-4-box-2">
                  <span className="join-reader-cards-are-non-transferabl">Reader cards are non-transferable and must be{' '}<br className="soft-br" />presented when borrowing volumes or reserving quiet{' '}<br className="soft-br" />study desks.</span>
                </div>
                <div className="join-background-border-4-box-3">
                  <span className="join-see-circulation-desk-for-current">See circulation desk for current policy details.</span>
                </div>
              </div>
              <div className="join-background-border-5">
                <div className="join-background-border-5-box">
                  <span className="join-already-registered">ALREADY REGISTERED?</span>
                </div>
                <div className="join-background-border-5-box-2">
                  <span className="join-access-member-portal">Access Member Portal</span>
                </div>
                <Link to="/login" className="join-background-border-5-box-3">MEMBER LOG IN</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
