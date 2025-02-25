import * as React from "react";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "@vis.gl/react-maplibre";
import PanelSupDir from "./painel-sup-dir";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import CustomDrawControl from "./polygon-draw";

export default function App() {
  const [clickedMidpoint, setClickedMidpoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [features, setFeatures] = useState({});
  const drawStyles = [
    {
      id: "gl-draw-polygon-fill", //preenchimento do polígono
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      paint: {
        "fill-color": "#9309c1", // Cor personalizada do polígono
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
        "line-color": "#44ff00", // Cor da borda
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
        "circle-color": "#c5ac21", // Cor dos pontos médios ao editar
      },
    },
  ];
  const handleDrawPolygon = () => {
    setIsDrawing(true);
  };

  const handleUpdate = useCallback((e) => {
    console.log("Polígono atualizado:", e);
    setIsDrawing(false); // Desativa o modo de desenho após o primeiro clique
  }, []);

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

      e.features.forEach((feature) => {
        newFeatures[feature.id] = feature;

        if (feature.geometry.type === "Polygon") {
          console.log(
            "Novo polígono atualizado:",
            feature.geometry.coordinates[0]
          );
        }
      });

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
      <Map
        initialViewState={{
          longitude: -44.989508,
          latitude: -19.881006,
          zoom: 12,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        {isDrawing && (
          <CustomDrawControl
            defaultMode="draw_polygon"
            onCreate={onUpdate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClick={onClick}
            onMouseMove={onMouseMove}
            onClickMidpoint={onClick}
            onMoveMidpoint={onMouseMove}
            features={Object.values(features)}
            styles={drawStyles}
          >
            <strong>TESTE</strong>
            <p></p>
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
