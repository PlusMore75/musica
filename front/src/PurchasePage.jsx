import { useState } from "react";
import { purchase } from "./api";

export default function PurchasePage({ selectedTracks = [], removeTrack }) {

  const [customerId, setCustomerId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = selectedTracks.reduce(
    (sum, track) => sum + Number(track.UnitPrice || 0),
    0
  );

  const handlePurchase = async () => {

    if (!customerId) {
      setError("Debe ingresar Customer ID");
      return;
    }

    if (selectedTracks.length === 0) {
      setError("Debe seleccionar al menos una canción");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {

      for (const track of selectedTracks) {
        await purchase({
          customer_id: Number(customerId),
        });
      }

      setMessage("Compra realizada correctamente");

    } catch (e) {
      setError(e.message || "Error en la compra");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Carrito de Compra</h2>

      <input
        placeholder="Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      />

      <h3>Canciones seleccionadas</h3>

      {selectedTracks.length === 0 && (
        <p>No hay canciones en el carrito.</p>
      )}

      {selectedTracks.length > 0 && (
        <ul>
          {selectedTracks.map((track) => (
            <li key={track.TrackId}>
              {track.Name} - {track.Artist} - ${track.UnitPrice}

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => removeTrack(track.TrackId)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3>Total: ${total.toFixed(2)}</h3>

      <button onClick={handlePurchase} disabled={loading}>
        {loading ? "Procesando..." : "Comprar"}
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
