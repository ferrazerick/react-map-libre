import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Map, useControl } from "@vis.gl/react-maplibre";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Feature, Polygon } from "geojson";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const DrawControl: React.FC<{
  onCreate: (features: Feature<Polygon>[]) => void;
  onUpdate: (features: Feature<Polygon>[]) => void;
  onDelete: (features: Feature<Polygon>[]) => void;
}> = ({ onCreate, onUpdate, onDelete }) => {
  useControl<MapboxDraw>(
    () => new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true } }),
    ({ map }) => {
      map.on("draw.create", (e) => onCreate(e.features));
      map.on("draw.update", (e) => onUpdate(e.features));
      map.on("draw.delete", (e) => onDelete(e.features));
    },
    ({ map }) => {
      map.off("draw.create", (e) => onCreate(e.features));
      map.off("draw.update", (e) => onUpdate(e.features));
      map.off("draw.delete", (e) => onDelete(e.features));
    }
  );
  return <>Teste</>;
};

const App: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Record<string, number[][]>>({});

  const handleUpdate = useCallback((updatedFeatures: Feature<Polygon>[]) => {
    setCoordinates((prev) => {
      const newCoords = { ...prev };
      updatedFeatures.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          newCoords[feature.id as string] = feature.geometry.coordinates[0];
        }
      });
      console.log("Coordenadas atualizadas:", newCoords); // Exibir coordenadas no console
      return newCoords;
    });
  }, []);

  const handleDelete = useCallback((deletedFeatures: Feature<Polygon>[]) => {
    setCoordinates((prev) => {
      const newCoords = { ...prev };
      deletedFeatures.forEach((feature) => delete newCoords[feature.id as string]);
      console.log("Coordenadas após remoção:", newCoords);
      return newCoords;
    });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Map initialViewState={{ longitude: -91.874, latitude: 42.76, zoom: 12 }} mapStyle={MAP_STYLE}>
        <DrawControl onCreate={handleUpdate} onUpdate={handleUpdate} onDelete={handleDelete} />
      </Map>

      <div style={{ position: "absolute", top: 10, right: 10, background: "white", padding: 10, borderRadius: 5 }}>
        <h3>Coordenadas Armazenadas</h3>
        <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap", maxWidth: "300px" }}>
          {JSON.stringify(coordinates, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
