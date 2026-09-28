import { Navigate, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { lazyPage } from '../lazyPage.js';
import '../pages/memberOverrides.css';

const MemberDashboard = lazyPage(() => import('../pages/MemberDashboard.jsx'), 'mdash');
const MemberProfile = lazyPage(() => import('../pages/MemberProfile.jsx'), 'mprofile');
const MemberEdit = lazyPage(() => import('../pages/MemberEdit.jsx'), 'medit');
const ChangePassword = lazyPage(() => import('../pages/ChangePassword.jsx'), 'mpass');
const BorrowRequest = lazyPage(() => import('../pages/BorrowRequest.jsx'), 'borrow');
const StudioBlog = lazyPage(() => import('../pages/StudioBlog.jsx'), 'sblog');
const StudioWriting = lazyPage(() => import('../pages/StudioWriting.jsx'), 'swriting');
const StudioReview = lazyPage(() => import('../pages/StudioReview.jsx'), 'sreview');
const WishlistBooks = lazyPage(() => import('../pages/WishlistBooks.jsx'), 'wlbooks');
const WishlistEBooks = lazyPage(() => import('../pages/WishlistEBooks.jsx'), 'wlebooks');
const WishlistAudio = lazyPage(() => import('../pages/WishlistAudio.jsx'), 'wlaudio');

// Member-only (after-login) pages. Kept in their own file so they can be built
// independently of the public pages registered in App.jsx.

/** Sends logged-out visitors to /login. */
export function RequireMember({ children }) {
  const { member } = useAuth();
  const location = useLocation();
  if (!member) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function memberRoutes() {
  return [
    <Route key="/member/dashboard" path="/member/dashboard" element={<RequireMember><MemberDashboard /></RequireMember>} />,
    <Route key="/member/profile" path="/member/profile" element={<RequireMember><MemberProfile /></RequireMember>} />,
    <Route key="/member/edit" path="/member/edit" element={<RequireMember><MemberEdit /></RequireMember>} />,
    <Route key="/member/password" path="/member/password" element={<RequireMember><ChangePassword /></RequireMember>} />,
    <Route key="/borrow/:slug" path="/borrow/:slug" element={<RequireMember><BorrowRequest /></RequireMember>} />,
    <Route key="/studio/blog" path="/studio/blog" element={<RequireMember><StudioBlog /></RequireMember>} />,
    <Route key="/studio/creative-writing" path="/studio/creative-writing" element={<RequireMember><StudioWriting /></RequireMember>} />,
    <Route key="/studio/book-review" path="/studio/book-review" element={<RequireMember><StudioReview /></RequireMember>} />,
    <Route key="/wishlist/books" path="/wishlist/books" element={<RequireMember><WishlistBooks /></RequireMember>} />,
    <Route key="/wishlist/e-books" path="/wishlist/e-books" element={<RequireMember><WishlistEBooks /></RequireMember>} />,
    <Route key="/wishlist/audio-books" path="/wishlist/audio-books" element={<RequireMember><WishlistAudio /></RequireMember>} />,
  ];
}

// keep Route referenced for when entries are added
export { Route };
