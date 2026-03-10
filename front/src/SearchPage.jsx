import { useState } from "react";
import { searchTracks } from "./api";

export default function SearchPage({ onSelectTrack }) {

  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {

    if (!name && !artist && !genre) {
      setError("Ingrese al menos un criterio de búsqueda");
      return;
    }

    try {
      const data = await searchTracks({
        name,
        artist,
        genre
      });

      setResults(data);
      setError("");
      setSearched(true);

    } catch (e) {
      setError("Error en la búsqueda");
      setSearched(true);
    }
  };

  return (
    <div>
      <h2>Buscar Canciones</h2>

      <div>
        <input
          placeholder="Nombre de canción"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="Artista"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="Género"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
      </div>

      <button onClick={handleSearch}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {searched && results.length === 0 && !error && (
        <p>No se encontraron canciones.</p>
      )}

      <ul>
        {results.map((track) => (
          <li key={track.TrackId}>
            {track.Name} - {track.Artist} - ${track.UnitPrice}

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => onSelectTrack(track)}
            >
              Seleccionar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
