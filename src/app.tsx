import * as React from "react";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "@vis.gl/react-maplibre";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import CustomDrawControl from "./polygon-draw";

export default function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [square, setSquare] = useState<number[][] | null>(null);
  const [features, setFeatures] = useState<any>({});
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null
  ); // Para armazenar o ID do polígono selecionado

  const drawStyles = [
    {
      id: "gl-draw-polygon-fill",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      paint: {
        "fill-color": "#9309c1",
        "fill-opacity": 0.5,
      },
    },
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#44ff00",
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-vertex-active",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
      paint: {
        "circle-radius": 6,
        "circle-color": "#00ffb3",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
      },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#c5ac21",
      },
    },
  ];

  const handleDrawPolygon = () => {
    setIsDrawing(true);
  };

  const handleUpdate = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };

      e.features.forEach((feature) => {
        newFeatures[feature.id] = feature;
      });

      return newFeatures;
    });
  }, []);

  const onClick = (e) => {
    if (!square) {
      setSquare([[e.lngLat.lng, e.lngLat.lat]]);
    }
  };

  const onMouseMove = (e) => {
    if (square) {
      const [x1, y1] = square[0];
      const x2 = e.lngLat.lng;
      const y2 = e.lngLat.lat;

      setSquare([
        [x1, y1],
        [x1, y2],
        [x2, y2],
        [x2, y1],
        [x1, y1],
      ]);
    }
  };

  const onDelete = useCallback(() => {
    if (selectedFeatureId) {
      setFeatures((currFeatures) => {
        const newFeatures = { ...currFeatures };
        delete newFeatures[selectedFeatureId]; // Remove o polígono selecionado
        setSelectedFeatureId(null); // Limpa a seleção
        return newFeatures;
      });
    }
  }, [selectedFeatureId]);

  const handleFeatureClick = (e) => {
    const clickedFeature = e.features;
    if (clickedFeature && clickedFeature.id) {
      setSelectedFeatureId(clickedFeature.id); // Armazena o ID do polígono clicado
      console.log("Polígono selecionado:", clickedFeature);
    }
  };

  return (
    <>
      <Map
        initialViewState={{
          longitude: -44.989508,
          latitude: -19.881006,
          zoom: 12,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleFeatureClick} // Configura o clique no mapa para selecionar um polígono
      >
        {isDrawing && (
          <CustomDrawControl
            displayControlsDefault={false}
            defaultMode="draw_polygon"
            onCreate={handleUpdate}
            onUpdate={handleUpdate}
            onDelete={onDelete}
            onClick={onClick}
            onMouseMove={onMouseMove}
            features={Object.values(features)}
            styles={drawStyles}
          >
            <strong>Coordenadas do polígono</strong>
            <p>
              {JSON.stringify(
                Object.values(features)[0]?.geometry?.coordinates[0]
              )}
            </p>
          </CustomDrawControl>
        )}
      </Map>
      <button
        onClick={handleDrawPolygon}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "#9309c1",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Desenhar Polígono
      </button>
      {/* <PanelSupDir polygons={Object.values(features)} /> */}
    </>
  );
}

export function renderToDom(container) {
  createRoot(container).render(<App />);
}
