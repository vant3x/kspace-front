import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store';
import ProtectionLayer from './components/ProtectionLayer';
import StarBackground from './components/StarBackground';
import ContentOverlay from './components/ContentOverlay';
import MusicPlayer from './components/MusicPlayer';
import IntroAudio from './components/IntroAudio';
import CursorEffect from './components/CursorEffect';
import Admin from './pages/Admin';
import './index.css';

function MainApp() {
  const { isUnlocked } = useStore();

  return (
    <>
      <StarBackground />
      {/* Intro audio plays when unlocked */}
      {isUnlocked && <IntroAudio />}

      <ProtectionLayer />

      {isUnlocked && (
        <>
          <ContentOverlay />
          <MusicPlayer />
        </>
      )}

      {/* Cursor Effect on top of everything to be visible on lock screen too */}
      <CursorEffect />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
