import * as React from "react";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "@vis.gl/react-maplibre";
import PanelSupDir from "./painel-sup-dir";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import CustomDrawControl from "./polygon-draw";

export default function App() {
  const [clickedMidpoint, setClickedMidpoint] = useState(null);
  const [features, setFeatures] = useState({});
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

  const onClick = (e) => {
    if (e.features.length) {
      const feature = e.features[0];

      // Se o usuário clicou em um midpoint, armazenamos seu ID
      if (feature.properties && feature.properties.meta === "midpoint") {
        setClickedMidpoint(feature.id);
      }
    }
  };

  const onMouseMove = (e) => {
    if (e.features.length) {
      const feature = e.features[0];

      // Se um midpoint foi movido, marcar ele como alterado
      if (feature.properties && feature.properties.meta === "midpoint") {
        feature.properties.moved = true;
      }
    }
  };

  const onUpdate = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      e.features.forEach((f) => {
        // Se for um midpoint que foi apenas clicado, não permitir a conversão
        if (clickedMidpoint === f.id && !f.properties?.moved) {
          return currFeatures;
        }
        newFeatures[f.id] = f;
      });
      return newFeatures;
    });
    setClickedMidpoint(null);
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
      <Map
        initialViewState={{
          longitude: -44.989508,
          latitude: -19.881006,
          zoom: 12,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        <CustomDrawControl
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
          onClick={onClick}
          onMouseMove={onMouseMove}
          onClickMidpoint={onClick}
          onMoveMidpoint={onMouseMove}
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
