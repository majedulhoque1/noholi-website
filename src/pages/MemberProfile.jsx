import { Link } from 'react-router-dom';
import './MemberProfile.css';

// Generated from Figma frame "Noholi Library — Member Profile" (49:2) by tools/gen_member.py, then hand-edited.
export default function MemberProfile() {
  return (
    <div className="mprofile">
      <section className="mprofile-main-main-content--root">
        <section className="mprofile-main-main-content-2">
          <nav className="mprofile-nav-breadcrumb">
            <nav className="mprofile-nav-breadcrumb-2">
              <Link to="/" className="mprofile-nav-breadcrumb-2-text">{"HOME "}</Link>
              <span className="mprofile-nav-breadcrumb-2-text-2">/</span>
              <Link to="/member/dashboard" className="mprofile-nav-breadcrumb-2-text">{"MY DASHBOARD "}</Link>
              <span className="mprofile-nav-breadcrumb-2-text-2">/</span>
              <span className="mprofile-nav-breadcrumb-2-text-3">PROFILE</span>
            </nav>
          </nav>
          <div className="mprofile-page-header">
            <div className="mprofile-page-header-2">
              <div className="mprofile-page-header-2-box">
                <div className="mprofile-page-header-2-box-box" />
                <div className="mprofile-page-header-2-box-box-2">
                  <span className="mprofile-page-header-2-box-box-2-text">PATRON ARCHIVAL REGISTRY</span>
                </div>
              </div>
              <h1 className="mprofile-heading-1">My Profile</h1>
              <div className="mprofile-page-header-2-box-2">
                <span className="mprofile-manage-your-member-account-detai">Manage your member account details and security settings.</span>
              </div>
            </div>
          </div>
          <div className="mprofile-stacked-form-view-sections">
            <section className="mprofile-section-1-personal-information">
              <div className="mprofile-card-header">
                <p className="mprofile-paragraph">
                  <span className="mprofile-heading-2">Personal Information</span>
                  <span className="mprofile-paragraph-text">SECTION 01</span>
                </p>
                <Link to="/member/edit" className="mprofile-edit-trigger">
                  <img className="mprofile-edit-trigger-box" src="/svg/svg-fa2kdq.svg" alt="" width="14" height="14" />
                  <div className="mprofile-edit-trigger-box-2">
                    <span className="mprofile-edit-trigger-box-2-text">EDIT</span>
                  </div>
                </Link>
              </div>
              <div className="mprofile-view-mode">
                <div className="mprofile-horizontalborder">
                  <div className="mprofile-horizontalborder-box">
                    <div className="mprofile-background-border">
                      <div className="mprofile-background-border-2">
                        <img className="mprofile-background-border-2-box" src="/svg/svg-qxgr0e.svg" alt="" width="32" height="36" />
                        <div className="mprofile-background-border-2-box-2">
                          <span className="mprofile-background-border-2-box-2-text">PATRON PHOTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mprofile-horizontalborder-box-2">
                    <div className="mprofile-horizontalborder-box-2-box">
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-full-name">FULL NAME</span>
                      </div>
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-member-name">[Member Name]</span>
                      </div>
                    </div>
                    <div className="mprofile-horizontalborder-box-2-box">
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-membership-number">MEMBERSHIP NUMBER</span>
                      </div>
                      <div className="mprofile-horizontalborder-box-2-box-box-2">
                        <div className="mprofile-horizontalborder-box-2-box-box-2-box">
                          <span className="mprofile-horizontalborder-box-2-box-box-2-box-text">[NL - READER -<br />XXXX]</span>
                        </div>
                        <div className="mprofile-background-border-3">
                          <span className="mprofile-background-border-3-text">PERMANENT<br />ID</span>
                        </div>
                      </div>
                    </div>
                    <div className="mprofile-horizontalborder-box-2-box">
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-email-address">EMAIL ADDRESS</span>
                      </div>
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-email-address-2">[Email Address]</span>
                      </div>
                    </div>
                    <div className="mprofile-horizontalborder-box-2-box">
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-phone-number">PHONE NUMBER</span>
                      </div>
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-phone-number-2">[Phone Number]</span>
                      </div>
                    </div>
                    <div className="mprofile-horizontalborder-box-2-box">
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-alternative-number">ALTERNATIVE NUMBER</span>
                      </div>
                      <div className="mprofile-horizontalborder-box-2-box-box">
                        <span className="mprofile-alternative-number-2">[Alternative Number]</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mprofile-view-mode-box">
                  <div className="mprofile-view-mode-box-box">
                    <span className="mprofile-registered-address">REGISTERED ADDRESS</span>
                  </div>
                  <div className="mprofile-view-mode-box-box-2">
                    <div className="mprofile-view-mode-box-box-2-box">
                      <div className="mprofile-view-mode-box-box-2-box-box">
                        <span className="mprofile-street-address">STREET ADDRESS</span>
                      </div>
                      <span className="mprofile-view-mode-box-box-2-box-text">[Street Address]</span>
                    </div>
                    <div className="mprofile-view-mode-box-box-2-box">
                      <div className="mprofile-view-mode-box-box-2-box-box">
                        <span className="mprofile-city-area">CITY / AREA</span>
                      </div>
                      <span className="mprofile-view-mode-box-box-2-box-text">[City / Area]</span>
                    </div>
                    <div className="mprofile-view-mode-box-box-2-box">
                      <div className="mprofile-view-mode-box-box-2-box-box">
                        <span className="mprofile-district">DISTRICT</span>
                      </div>
                      <span className="mprofile-view-mode-box-box-2-box-text">[District]</span>
                    </div>
                    <div className="mprofile-view-mode-box-box-2-box-2">
                      <div className="mprofile-view-mode-box-box-2-box-2-box">
                        <span className="mprofile-postal-code">POSTAL CODE</span>
                      </div>
                      <span className="mprofile-view-mode-box-box-2-box-2-text">[Postal Code]</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="mprofile-section-3-change-password">
              <div className="mprofile-card-header-2">
                <p className="mprofile-paragraph">
                  <span className="mprofile-heading-2">Change Password</span>
                  <span className="mprofile-paragraph-text">SECTION 03</span>
                </p>
              </div>
              <div className="mprofile-view-state">
                <div className="mprofile-view-state-box">
                  <span className="mprofile-update-your-password-to-maintain">Update your password to maintain account security.</span>
                </div>
                <div className="mprofile-view-state-box">
                  <Link to="/member/password" className="mprofile-view-state-box-box">CHANGE PASSWORD</Link>
                </div>
              </div>
            </section>
          </div>
          <div className="mprofile-footer-desk-assistance-notice">
            <div className="mprofile-footer-desk-assistance-notice-2">
              <div className="mprofile-footer-desk-assistance-notice-2-box">
                <span className="mprofile-footer-desk-assistance-notice-2-box-text">Contact the circulation desk with questions.</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
