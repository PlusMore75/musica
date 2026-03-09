import { searchTracks, purchase } from "../api";
export const API_URL = process.env.REACT_APP_API_URL;

global.fetch = jest.fn();

describe("API Service", () => {

  beforeEach(() => {
    fetch.mockClear();
  });

  describe("searchTracks", () => {

    test("debe llamar al endpoint con los parámetros correctos", async () => {
      const mockResponse = { results: [] };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const params = { artist: "Coldplay", limit: 5 };

      const result = await searchTracks(params);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/tracks/search?artist=Coldplay&limit=5`
      );

      expect(result).toEqual(mockResponse);
    });

    test("debe lanzar error si la respuesta no es ok", async () => {
      fetch.mockResolvedValue({
        ok: false,
      });

      await expect(searchTracks({ artist: "Coldplay" }))
        .rejects
        .toThrow("Error en búsqueda");
    });

  });

  describe("purchase", () => {

    test("debe enviar un POST con los datos correctos", async () => {
      const mockResponse = { status: "success" };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const data = { track_id: 1, user: "test" };

      const result = await purchase(data);

      expect(fetch).toHaveBeenCalledWith(
       `${API_URL}/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test("debe lanzar error cuando el backend devuelve error", async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Compra inválida" }),
      });

      await expect(purchase({ track_id: 1 }))
        .rejects
        .toThrow("Compra inválida");
    });

  });

});
