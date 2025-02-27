import * as React from "react";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import {
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawCircleMode,
} from "terra-draw";

export default function PageTest() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawControlRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [-44.989508, -19.881006],
      zoom: 12,
    });

    mapRef.current = map;

    map.on("load", () => {
      const drawControl = new MaplibreTerradrawControl({
        modes: ["select", "delete-selection", "polygon", "rectangle", "circle"],
        open: true,
        modeOptions: {
          polygon: new TerraDrawPolygonMode({
            styles: {
              fillColor: "#FF0000", // Cor do preenchimento (vermelho)
              fillOpacity: 0.7, // Transparência
              outlineColor: "#000000", // Cor da borda (preto)
              outlineWidth: 2, // Espessura da borda
              closingPointColor: "#FFFFFF", // Ponto final branco
              closingPointWidth: 3,
              closingPointOutlineColor: "#FF0000",
              closingPointOutlineWidth: 1,
            },
          }),
        },
      });

      map.addControl(drawControl, "top-left");
      drawControlRef.current = drawControl;

      // Obtém a instância do TerraDraw para capturar o geoJSON do polígono selecionado
      const drawInstance = drawControl.getTerraDrawInstance();
      if (drawInstance) {
        drawInstance.on("select", (id) => {
          const snapshot = drawInstance.getSnapshot();
          const selectedFeature = snapshot?.find(
            (feature) => feature.id === id
          );
          const coordinates = selectedFeature.geometry.coordinates[0];
          console.log("Coordenadas do polígono selecionado:", coordinates);
          console.log("GeoJSON do polígono selecionado:", selectedFeature);
        });
      }
    });

    return () => {
      if (mapRef.current) {
        if (drawControlRef.current) {
          mapRef.current.removeControl(drawControlRef.current);
        }
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    />
  );
}

export function renderToDom(container) {
  createRoot(container).render(<PageTest />);
}
