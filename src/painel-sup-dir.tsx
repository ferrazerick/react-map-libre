import * as React from 'react';
import area from '@turf/area';

function PanelSupDir(props) {
  let polygonArea = 0;
  for (const polygon of props.polygons) {
    polygonArea += area(polygon);
  }

  return (
    <div className="painel-sup-dir">
      <h3>Draw Polygon</h3>
      {polygonArea > 0 && (
        
        <p>
          {console.log(props.polygons[0].geometry.coordinates)}
          {/* [0] longitude, [1] latitude. São armazedas 4 coordenadas. Por que?? */}
          
          square teste
        </p>
      )}
      <div className="source-link">
        <a
          href="https://github.com/visgl/react-maplibre/tree/1.0-release/examples/draw-polygon"
          target="_new"
        >
          View Code ↗
        </a>
      </div>
    </div>
  );
}

export default React.memo(PanelSupDir);
