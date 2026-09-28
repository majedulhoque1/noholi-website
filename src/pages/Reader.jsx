import { Link } from 'react-router-dom';
import './Reader.css';

// Generated from Figma frame "Noholi Library — Reader: The River Path (Before Login)" (36:2) by tools/gen.py, then hand-edited.
export default function Reader() {
  return (
    <div className="reader">
      <div className="reader-breadcrumb-reader-status-bar">
        <div className="reader-breadcrumb-reader-status-bar-box">
          <div className="reader-breadcrumb-reader-status-bar-box-box">
            <Link to="/" className="reader-breadcrumb-reader-status-bar-box-box-box">HOME</Link>
            <div className="reader-breadcrumb-reader-status-bar-box-box-box-2">
              <span className="reader-breadcrumb-reader-status-bar-box-box-box-2-text">/</span>
            </div>
            <Link to="/e-books" className="reader-breadcrumb-reader-status-bar-box-box-box">E-BOOKS</Link>
            <div className="reader-breadcrumb-reader-status-bar-box-box-box-2">
              <span className="reader-breadcrumb-reader-status-bar-box-box-box-2-text">/</span>
            </div>
            <div className="reader-breadcrumb-reader-status-bar-box-box-box-3">
              <span className="reader-breadcrumb-reader-status-bar-box-box-box-3-text">THE RIVER PATH</span>
            </div>
          </div>
          <div className="reader-breadcrumb-reader-status-bar-box-box-2">
            <span className="reader-breadcrumb-reader-status-bar-box-box-2-text">Reading Progress: Section 1</span>
          </div>
        </div>
      </div>
      <section className="reader-main-reader-view">
        <section className="reader-main-reader-view-2">
          <div className="reader-title-header">
            <div className="reader-title-header-box">
              <span className="reader-title-header-box-text">ONLINE READER</span>
            </div>
            <h1 className="reader-heading-1">The River Path</h1>
            <div className="reader-title-header-box">
              <span className="reader-title-header-box-text-2">নদীর পথ</span>
            </div>
            <div className="reader-title-header-box-2">
              <span className="reader-title-header-box-2-text">By [Author Name]</span>
            </div>
          </div>
          <div className="reader-reader-text-content-area">
            <div className="reader-reader-text-content-area-box">
              <span className="reader-the-water-shifted-quietly-along">The water shifted quietly along the low bank as morning mist gave way to broad, steady{' '}<br className="soft-br" />daylight. In the early stillness before village commerce gathered near the ghat, only the{' '}<br className="soft-br" />dipping of a solitary oar disturbed the surface. On either side of the waterway, clay{' '}<br className="soft-br" />embankments bore the continuous markings of seasonal tides.</span>
            </div>
            <div className="reader-reader-text-content-area-box">
              <span className="reader-generations-had-traveled-this-ro">Generations had traveled this route between neighboring settlements, carrying earthen{' '}<br className="soft-br" />pots, woven reeds, and modest bundles of dry grain. The river served not merely as a{' '}<br className="soft-br" />boundary or a mode of transit, but as the common measure by which distances, harvests,{' '}<br className="soft-br" />and reunions were recounted across family households.</span>
            </div>
            <div className="reader-reader-text-content-area-box">
              <span className="reader-as-the-afternoon-sun-inclined-we">As the afternoon sun inclined westward, shadows lengthened over the bamboo groves{' '}<br className="soft-br" />lining the bend. Travelers pausing along the stone steps observed the familiar cadence of{' '}<br className="soft-br" />returning boats, their lanterns casting long, trembling reflections across the water until{' '}<br className="soft-br" />night enveloped the shore.</span>
            </div>
          </div>
          <nav className="reader-navigation-controls-with-neutral">
            <button type="button" className="reader-navigation-controls-with-neutral-box">
              <div className="reader-navigation-controls-with-neutral-box-box">
                <span className="reader-navigation-controls-with-neutral-box-box-text">←</span>
              </div>
              <div className="reader-navigation-controls-with-neutral-box-box">
                <span className="reader-navigation-controls-with-neutral-box-box-text-2">PREVIOUS SECTION</span>
              </div>
            </button>
            <div className="reader-navigation-controls-with-neutral-box-2">
              <span className="reader-navigation-controls-with-neutral-box-2-text">PROGRESS: IN PROGRESS</span>
            </div>
            <button type="button" className="reader-navigation-controls-with-neutral-box-3">
              <div className="reader-navigation-controls-with-neutral-box-3-box">
                <span className="reader-navigation-controls-with-neutral-box-3-box-text">NEXT SECTION</span>
              </div>
              <div className="reader-navigation-controls-with-neutral-box-3-box">
                <span className="reader-navigation-controls-with-neutral-box-3-box-text-2">→</span>
              </div>
            </button>
          </nav>
        </section>
      </section>
    </div>
  );
}
