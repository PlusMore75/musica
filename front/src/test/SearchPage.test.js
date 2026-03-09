import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchPage from "../SearchPage";
import { searchTracks } from "../api";
import '@testing-library/jest-dom';

jest.mock("../api");

describe("SearchPage", () => {

  test("renderiza el formulario de búsqueda", () => {
    render(<SearchPage onSelectTrack={jest.fn()} />);

    expect(screen.getByText("Buscar Canciones")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre de canción")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Artista")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Género")).toBeInTheDocument();
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });

  test("muestra error si no se ingresan criterios", () => {
    render(<SearchPage onSelectTrack={jest.fn()} />);

    fireEvent.click(screen.getByText("Buscar"));

    expect(
      screen.getByText("Ingrese al menos un criterio de búsqueda")
    ).toBeInTheDocument();
  });

  test("realiza búsqueda y muestra resultados", async () => {
    const mockTracks = [
      { TrackId: 1, Name: "Song A", Artist: "Artist A", UnitPrice: 1.5 },
      { TrackId: 2, Name: "Song B", Artist: "Artist B", UnitPrice: 2.0 }
    ];

    searchTracks.mockResolvedValue(mockTracks);

    render(<SearchPage onSelectTrack={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Nombre de canción"), {
      target: { value: "Song" }
    });

    fireEvent.click(screen.getByText("Buscar"));

    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalled();
    });
    await screen.findByText("Song A - Artist A - $1.5");
    expect(screen.getByText("Song A - Artist A - $1.5")).toBeInTheDocument();
    expect(screen.getByText("Song B - Artist B - $2")).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay resultados", async () => {
    searchTracks.mockResolvedValue([]);

    render(<SearchPage onSelectTrack={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Artista"), {
      target: { value: "Unknown" }
    });

    fireEvent.click(screen.getByText("Buscar"));

    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalled();
    });

    await screen.findByText("No se encontraron canciones.");

    expect(
      screen.getByText("No se encontraron canciones.")
    ).toBeInTheDocument();
  });

  test("muestra error si falla la búsqueda", async () => {
    searchTracks.mockRejectedValue(new Error("API error"));

    render(<SearchPage onSelectTrack={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Artista"), {
      target: { value: "Coldplay" }
    });

    fireEvent.click(screen.getByText("Buscar"));

    await waitFor(() => {
      expect(
        screen.getByText("Error en la búsqueda")
      ).toBeInTheDocument();
    });
  });

  test("ejecuta onSelectTrack al seleccionar una canción", async () => {
    const mockTracks = [
      { TrackId: 1, Name: "Song A", Artist: "Artist A", UnitPrice: 1.5 }
    ];

    searchTracks.mockResolvedValue(mockTracks);

    const mockSelect = jest.fn();

    render(<SearchPage onSelectTrack={mockSelect} />);

    fireEvent.change(screen.getByPlaceholderText("Nombre de canción"), {
      target: { value: "Song" }
    });

    fireEvent.click(screen.getByText("Buscar"));

    await screen.findByText("Song A - Artist A - $1.5");

    fireEvent.click(screen.getByText("Seleccionar"));

    expect(mockSelect).toHaveBeenCalledWith(mockTracks[0]);
  });

});
