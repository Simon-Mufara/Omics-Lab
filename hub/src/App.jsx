import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { Link, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from './hooks/useCurrentUser.js';
import Onboarding from './pages/Onboarding.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Avatar from './components/Avatar.jsx';

function TopBar({ profile }) {
  return (
    <header className="ol-topbar">
      <Link to="/" className="ol-brand">
        OmicsLab <span className="ol-brand-accent">Hub</span>
      </Link>
      <nav className="ol-nav">
        <a href="/" className="ol-nav-link">
          ← Back to main site
        </a>
        {profile?.username && (
          <Link to="/settings/profile" className="ol-nav-link">
            <Avatar src={profile.avatar_url} name={profile.display_name || profile.name} size="sm" />
            @{profile.username}
          </Link>
        )}
        <UserButton afterSignOutUrl="/hub" />
      </nav>
    </header>
  );
}

function HomePlaceholder({ profile }) {
  return (
    <div className="ol-page">
      <h1 className="ol-title">Welcome, @{profile?.username}</h1>
      <p className="ol-sub">
        The dataset hub, search, and chat build on this identity — this screen is a placeholder for that work.
      </p>
      <Link to="/settings/profile" className="ol-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
        Edit your profile
      </Link>
    </div>
  );
}

function AuthedApp() {
  const { clerkUser, profile, loading, error, needsOnboarding, refetch } = useCurrentUser();

  if (loading) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-error">Couldn't load your profile: {error.message}</div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <Onboarding clerkUser={clerkUser} onComplete={refetch} />;
  }

  return (
    <>
      <TopBar profile={profile} />
      <Routes>
        <Route path="/" element={<HomePlaceholder profile={profile} />} />
        <Route
          path="/settings/profile"
          element={<EditProfile clerkUser={clerkUser} profile={profile} onSaved={refetch} />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <>
      <SignedIn>
        <AuthedApp />
      </SignedIn>
      <SignedOut>
        <div className="ol-page ol-center">
          <SignIn routing="hash" signUpUrl="/hub" afterSignInUrl="/hub" />
        </div>
      </SignedOut>
    </>
  );
}
