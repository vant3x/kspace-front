# Space Romance Website

A visually stunning 3D interstellar experience built with React, Three.js, and Framer Motion.

## Features

- **Interactive 3D Scene**: Navigable starfield with a black hole/nebula visualization.
- **Password Protection**: Futuristic "Mission Control" login screen (Code: `cosmos`).
- **Music Player**: Floating player with playlist support and visualizer animation.
- **Content Overlay**: Smooth animated sections for messages and memories.

## Quick Start

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Customization

### Adding Music

1.  Place your `.mp3` files in the `public/music/` directory.
2.  Update `src/store.js` with the file names and song details:

    ```javascript
    tracks: [
      { title: "Your Song", src: "/music/your-song.mp3", artist: "Artist Name" },
      // ...
    ],
    ```

### Changing Content

- **Password**: Edit `PASSCODE` in `src/components/ProtectionLayer.jsx`.
- **Text/Message**: Edit `src/components/ContentOverlay.jsx`.
- **Memories**: Add more timeline items in `src/components/ContentOverlay.jsx`.

## Tech Stack

- React + Vite
- Three.js + @react-three/fiber + @react-three/drei
- Framer Motion
- Zustand
- Lucide React (Icons)
