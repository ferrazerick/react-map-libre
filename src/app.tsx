import * as React from "react";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "@vis.gl/react-maplibre";

import DrawControl from "./draw-control";
import PanelSupDir from "./painel-sup-dir";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import PolygonDraw from "./polygon-draw";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

export default function App() {
  const drawStyles = [
    {
      id: "gl-draw-polygon-fill", //preenchimento do polígono
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      paint: {
        "fill-color": "#FF5733", // Cor personalizada do polígono
        "fill-opacity": 0.5, // Opacidade do preenchimento
      },
    },
    {
      id: "gl-draw-polygon-stroke-active", // borda do polígono
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#000000", // Cor da borda
        "line-width": 2, // Espessura da linha
      },
    },
    {
      id: "gl-draw-vertex-active", // pontos originais
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
      paint: {
        "circle-radius": 6,
        "circle-color": "#00ffb3", // Cor dos pontos originais
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
      },
    },
    {
      id: "gl-draw-polygon-midpoint", // pontos médios
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#FF0000", // Cor dos pontos médios ao editar
      },
    },
  ];

  const [features, setFeatures] = useState({});

  const onUpdate = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      console.log("teste", newFeatures);
      return newFeatures;
    });
  }, []);

  return (
    <>
      {/* <PolygonDraw /> */}
      <Map
        initialViewState={{
          longitude: -44.989508,
          latitude: -19.881006,
          zoom: 12,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        <DrawControl
          position="top-left"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true,
          }}
          defaultMode="draw_polygon"
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          styles={drawStyles}
        />
      </Map>
      <PanelSupDir polygons={Object.values(features)} />
    </>
  );
}

export function renderToDom(container) {
  createRoot(container).render(<App />);
}
