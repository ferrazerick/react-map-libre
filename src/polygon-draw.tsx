import React, { useEffect, useRef, useState } from "react";
import DrawControl from "./draw-control";
import { Marker } from "@vis.gl/react-maplibre";

interface CustomDrawControlProps {
  onClickMidpoint?: (midpoint: any) => void;
  onMoveMidpoint?: (midpoint: any) => void;
  features?: any; // Receberá os polígonos desenhados
  [key: string]: any;
  children?: React.ReactNode;
}

const CustomDrawControl: React.FC<CustomDrawControlProps> = ({
  children,
  ...props
}) => {
  const mapRef = useRef<any>(null);
  const [clickedMidpoint, setClickedMidpoint] = useState<string | null>(null);
  const [polygonCenter, setPolygonCenter] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    map.on("click", (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["gl-draw-polygon-midpoint"],
      });

      if (features.length) {
        const midpoint = features[0];
        setClickedMidpoint(midpoint.id);

        if (props.onClickMidpoint) {
          props.onClickMidpoint(midpoint);
        }
      }
    });

    map.on("mousemove", (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["gl-draw-polygon-midpoint"],
      });

      if (features.length && clickedMidpoint === features[0].id) {
        features[0].properties.moved = true;

        if (props.onMoveMidpoint) {
          props.onMoveMidpoint(features[0]);
        }
      }
    });

    return () => {
      map.off("click");
      map.off("mousemove");
    };
  }, [clickedMidpoint, props.onClickMidpoint, props.onMoveMidpoint]);

  // Calcula o centro do polígono para posicionar o conteúdo corretamente
  useEffect(() => {
    if (props.features && props.features.length > 0) {
      const polygon = props.features[0]; // Pegamos o primeiro polígono desenhado
      if (polygon.geometry.type === "Polygon") {
        const coordinates = polygon.geometry.coordinates[0]; // Array de coordenadas do polígono
        const center = coordinates.reduce(
          (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
          [0, 0]
        );
        setPolygonCenter([
          center[0] / coordinates.length,
          center[1] / coordinates.length,
        ]);
      }
    }
  }, [props.features]);

  return (
    <>
      <DrawControl {...props} />

      {polygonCenter && (
        <Marker longitude={polygonCenter[0]} latitude={polygonCenter[1]}>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "5px",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            {children}
          </div>
        </Marker>
      )}
    </>
  );
};

export default CustomDrawControl;
