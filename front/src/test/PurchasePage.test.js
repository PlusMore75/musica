import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PurchasePage from "../PurchasePage";
import { purchase } from "../api";

jest.mock("../api");

describe("PurchasePage", () => {

  const tracks = [
    { TrackId: 1, Name: "Song A", Artist: "Artist A", UnitPrice: 1.5 },
    { TrackId: 2, Name: "Song B", Artist: "Artist B", UnitPrice: 2.0 }
  ];

  test("renderiza canciones en el carrito", () => {

    render(
      <PurchasePage
        selectedTracks={tracks}
        removeTrack={jest.fn()}
      />
    );

    expect(screen.getByText("Song A - Artist A - $1.5")).toBeInTheDocument();
    expect(screen.getByText("Song B - Artist B - $2")).toBeInTheDocument();
  });

  test("muestra total correcto", () => {

    render(
      <PurchasePage
        selectedTracks={tracks}
        removeTrack={jest.fn()}
      />
    );

    expect(screen.getByText("Total: $3.50")).toBeInTheDocument();
  });

  test("muestra error si no hay Customer ID", () => {

    render(
      <PurchasePage
        selectedTracks={tracks}
        removeTrack={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Comprar"));

    expect(
      screen.getByText("Debe ingresar Customer ID")
    ).toBeInTheDocument();
  });

  test("realiza compra de múltiples canciones", async () => {

    purchase.mockResolvedValue({ message: "ok" });

    render(
      <PurchasePage
        selectedTracks={tracks}
        removeTrack={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Customer ID"), {
      target: { value: "1" }
    });

    fireEvent.click(screen.getByText("Comprar"));

    await waitFor(() => {
      expect(purchase).toHaveBeenCalledTimes(2);
    });

    expect(purchase).toHaveBeenCalledWith({
      customer_id: 1,
      track_id: 1
    });

    expect(purchase).toHaveBeenCalledWith({
      customer_id: 1,
      track_id: 2
    });
  });

});
