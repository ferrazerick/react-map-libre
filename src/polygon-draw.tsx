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
  features,
  ...props
}) => {
  console.log("props", props);
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
      } else {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["gl-draw-polygon-fill"],
        });
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

  const calculateCentroid = (coordinates: number[][]) => {
    let xSum = 0;
    let ySum = 0;
    let area = 0;

    const numPoints = coordinates.length;

    for (let i = 0; i < numPoints; i++) {
      const x1 = coordinates[i][0];
      const y1 = coordinates[i][1];
      const x2 = coordinates[(i + 1) % numPoints][0]; // Conecta com o próximo ponto (circular)
      const y2 = coordinates[(i + 1) % numPoints][1];

      const crossProduct = x1 * y2 - x2 * y1;
      area += crossProduct;

      xSum += (x1 + x2) * crossProduct;
      ySum += (y1 + y2) * crossProduct;
    }

    // O centroide é a média ponderada com base na área
    area *= 0.5;
    const cx = xSum / (6 * area);
    const cy = ySum / (6 * area);

    return [cx, cy] as [number, number];
  };

  useEffect(() => {
    if (features && features.length > 0) {
      const polygon = features[0]; // Pegamos o primeiro polígono desenhado
      if (polygon.geometry.type === "Polygon") {
        const coordinates = polygon.geometry.coordinates[0]; // Array de coordenadas do polígono
        const centroid = calculateCentroid(coordinates);
        setPolygonCenter(centroid);
      }
    }
  }, [features]);

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
              justifyContent: "center",
              position: "absolute",
              transform: "translate(-50%, -50%)",
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
