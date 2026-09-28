import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import './styles/responsive/home.css';
import './styles/responsive/login.css';
import { lazyPage } from './lazyPage.js';
import ComingSoon from './pages/ComingSoon.jsx';
import { memberRoutes } from './routes/memberRoutes.jsx';
import { fitBoxes } from './fitBoxes.js';

const Catalog = lazyPage(() => import('./pages/Catalog.jsx'), 'catalog');
const BookDetails = lazyPage(() => import('./pages/BookDetails.jsx'), 'book');
const NoholiBooks = lazyPage(() => import('./pages/NoholiBooks.jsx'), 'nbooks');
const BecomeMember = lazyPage(() => import('./pages/BecomeMember.jsx'), 'join');
const Contact = lazyPage(() => import('./pages/Contact.jsx'), 'contact');
const About = lazyPage(() => import('./pages/About.jsx'), 'about');
const Rules = lazyPage(() => import('./pages/Rules.jsx'), 'rules');
const Privacy = lazyPage(() => import('./pages/Privacy.jsx'), 'privacy');
const Gallery = lazyPage(() => import('./pages/Gallery.jsx'), 'gallery');
const EBooks = lazyPage(() => import('./pages/EBooks.jsx'), 'ebooks');
const Reader = lazyPage(() => import('./pages/Reader.jsx'), 'reader');
const AudioBooks = lazyPage(() => import('./pages/AudioBooks.jsx'), 'audio');
const AudioBookDetails = lazyPage(() => import('./pages/AudioBookDetails.jsx'), 'audiobook');
const Blogs = lazyPage(() => import('./pages/Blogs.jsx'), 'blogs');
const BlogPost = lazyPage(() => import('./pages/BlogPost.jsx'), 'blogpost');
const CreativeWritings = lazyPage(() => import('./pages/CreativeWritings.jsx'), 'writings');
const CreativeWriting = lazyPage(() => import('./pages/CreativeWriting.jsx'), 'writing');
const BookReviews = lazyPage(() => import('./pages/BookReviews.jsx'), 'reviews');
const Critique = lazyPage(() => import('./pages/Critique.jsx'), 'critique');

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return undefined; }
    // pages load lazily, so the #anchor may not exist yet — retry for a moment
    let tries = 0;
    const id = setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 40) { clearInterval(id); el?.scrollIntoView({ block: 'start' }); }
    }, 50);
    return () => clearInterval(id);
  }, [pathname, hash]);
  return null;
}

/** Scales fixed-geometry artwork to fit on screens narrower than the 1280px design. */
function FitArtwork() {
  const { pathname } = useLocation();
  useEffect(() => {
    // pages load lazily, so re-fit whenever new content lands in <main> (debounced to one frame)
    let id = 0;
    const run = () => { cancelAnimationFrame(id); id = requestAnimationFrame(() => fitBoxes()); };
    run();
    const main = document.querySelector('main');
    const mo = new MutationObserver(run);
    if (main) mo.observe(main, { childList: true, subtree: true });
    window.addEventListener('resize', run);
    return () => {
      cancelAnimationFrame(id);
      mo.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <FitArtwork />
      <SiteHeader />
      <main>
        <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {memberRoutes()}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/books/:slug" element={<BookDetails />} />
          <Route path="/noholi-books" element={<NoholiBooks />} />
          <Route path="/become-a-member" element={<BecomeMember />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/e-books" element={<EBooks />} />
          <Route path="/read/:slug" element={<Reader />} />
          <Route path="/audio-books" element={<AudioBooks />} />
          <Route path="/audio-books/:slug" element={<AudioBookDetails />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogPost />} />
          <Route path="/creative-writings" element={<CreativeWritings />} />
          <Route path="/creative-writings/:slug" element={<CreativeWriting />} />
          <Route path="/book-reviews" element={<BookReviews />} />
          <Route path="/book-reviews/:slug" element={<Critique />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
