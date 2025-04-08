import React, { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource, TileWMS } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import 'ol/ol.css';

export const MapContainer = ({ markers, selectedMarker, onMarkerClick }) => {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(
    new VectorLayer({ source: new VectorSource() })
  );

  // Initialize map
  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new TileWMS({
            url: process.env.REACT_APP_BHUVAN_URL,
            params: {
              'LAYERS': 'basemap%3Aadmin_group',
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png',
              'TRANSPARENT': 'true',
              'SRS': 'EPSG:4326',
              'WIDTH': 256,
              'HEIGHT': 256,
              'pixelRatio': 1,
            },
            serverType: 'geoserver',
            projection: 'EPSG:4326',
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([91.829437, 26.131644]),
        zoom: 7,
      }),
      pixelRatio: 1,
    });

    setMap(initialMap);
    return () => initialMap.setTarget(null); // Cleanup on unmount
  }, []);

  // Update markers on the map
  useEffect(() => {
    if (map && markers) {
      const source = vectorLayer.getSource();
      source.clear();

      markers.forEach((marker) => {
        const coordinates = fromLonLat([marker.location.lng, marker.location.lat]);
        const feature = new Feature({
          geometry: new Point(coordinates),
          data: marker,
        });

        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
              scale: 0.06,
            }),
          })
        );

        source.addFeature(feature);
      });

      // Center map on markers if any exist
      if (markers.length > 0) {
        const extent = source.getExtent();
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 15,
        });
      }
    }
  }, [map, markers, vectorLayer]);

  return (
    <div ref={mapElement} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img 
        src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} 
        style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} 
      />
      <img 
        src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} 
        style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} 
      />
      <img 
        src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} 
        style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} 
      />
    </div>
  );
}; 