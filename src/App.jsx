import { useState } from "react";
import SearchPage from "./SearchPage";
import PurchasePage from "./PurchasePage";
import "./styles.css";

export default function App() {

  const [selectedTracks, setSelectedTracks] = useState([]);

  const addTrack = (track) => {

    const exists = selectedTracks.find(
      t => t.TrackId === track.TrackId
    );

    if (!exists) {
      setSelectedTracks(prev => [...prev, track]);
    }
  };

  const removeTrack = (trackId) => {
    setSelectedTracks(prev =>
      prev.filter(t => t.TrackId !== trackId)
    );
  };

  return (
    <div className="container">
      <h1>Chinook Music Store</h1>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        <div className="section" style={{ flex: 1 }}>
          <SearchPage onSelectTrack={addTrack} />
        </div>

        <div className="section" style={{ flex: 1 }}>
          <PurchasePage
          selectedTracks={selectedTracks}
          removeTrack={removeTrack}
          />
        </div>
      </div>
    </div>
  );
}
