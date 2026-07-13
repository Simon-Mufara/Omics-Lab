import { Suspense, lazy } from 'react';
import { SignIn, UserButton } from '@clerk/clerk-react';
import { Link, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from './hooks/useCurrentUser.js';
import Onboarding from './pages/Onboarding.jsx';
import EditProfile from './pages/EditProfile.jsx';
import DatasetHub from './pages/DatasetHub.jsx';
import Avatar from './components/Avatar.jsx';

/* Lazy-loaded: DatasetDetail pulls in Recharts for the Columns/Activity
   charts, which is a meaningful download on its own — most visits are
   to the Dataset Hub grid, not a specific dataset's detail page, so
   that cost shouldn't be paid on every page load (Africa-first /
   low-bandwidth constraint applies to the Hub too, not just the main
   static site). */
const DatasetDetail = lazy(() => import('./pages/DatasetDetail.jsx'));

function PageLoading() {
  return (
    <div className="ol-page ol-center">
      <div className="ol-spinner" aria-label="Loading" />
    </div>
  );
}

function TopBar({ profile, isSignedIn }) {
  return (
    <header className="ol-topbar">
      <Link to="/" className="ol-brand">
        OmicsLab <span className="ol-brand-accent">Hub</span>
      </Link>
      <nav className="ol-nav">
        <Link to="/datasets" className="ol-nav-link">
          Datasets
        </Link>
        <a href="/" className="ol-nav-link">
          ← Back to main site
        </a>
        {isSignedIn ? (
          <>
            {profile?.username && (
              <Link to="/settings/profile" className="ol-nav-link">
                <Avatar src={profile.avatar_url} name={profile.display_name || profile.name} size="sm" />
                @{profile.username}
              </Link>
            )}
            <UserButton afterSignOutUrl="/hub" />
          </>
        ) : (
          <Link to="/sign-in" className="ol-nav-link ol-nav-link-cta">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

function HomePlaceholder({ profile }) {
  return (
    <div className="ol-page">
      <h1 className="ol-title">Welcome, @{profile?.username}</h1>
      <p className="ol-sub">Browse practice datasets, or head to your profile.</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/datasets" className="ol-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Browse datasets
        </Link>
        <Link to="/settings/profile" className="ol-btn-ghost" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Edit your profile
        </Link>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="ol-page ol-center">
      <SignIn routing="hash" signUpUrl="/hub" afterSignInUrl="/hub" />
    </div>
  );
}

function RequireAuth({ isSignedIn, children }) {
  if (!isSignedIn) return <SignInPage />;
  return children;
}

export default function App() {
  const { clerkUser, profile, loading, error, needsOnboarding, refetch, isSignedIn } = useCurrentUser();

  /* Onboarding is a hard gate for SIGNED-IN users only — anonymous
     visitors must still be able to browse public datasets (Kaggle-
     style browsing needs no account), so this can't wrap the whole
     app the way it did in Prompt 0. */
  if (isSignedIn && loading) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-spinner" aria-label="Loading" />
      </div>
    );
  }
  if (isSignedIn && error) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-error">Couldn't load your profile: {error.message}</div>
      </div>
    );
  }
  if (isSignedIn && needsOnboarding) {
    return <Onboarding clerkUser={clerkUser} onComplete={refetch} />;
  }

  return (
    <>
      <TopBar profile={profile} isSignedIn={isSignedIn} />
      <Routes>
        <Route path="/" element={isSignedIn ? <HomePlaceholder profile={profile} /> : <DatasetHub />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/datasets" element={<DatasetHub />} />
        <Route
          path="/datasets/:slug"
          element={
            <Suspense fallback={<PageLoading />}>
              <DatasetDetail profile={profile} isSignedIn={isSignedIn} />
            </Suspense>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <RequireAuth isSignedIn={isSignedIn}>
              <EditProfile clerkUser={clerkUser} profile={profile} onSaved={refetch} />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}
