import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Overlay from 'ol/Overlay';

// Datos de ejemplo de población por ubicación
const populationData = [
  { city: 'Londrina', lon: -51.169582, lat: -23.304452, population: 200 }, // Londrina con 1 millón de habitantes
  { city: 'Cascavel', lon: -53.45528, lat: -24.95583, population: 300 }, // Palmas con 500,000 habitantes
  { city: 'Francisco Beltrão', lon: -53.055, lat: -26.08111, population: 150 }, // Palmas con 500,000 habitantes
  { city: 'Maringá', lon: -51.93861, lat: -23.42528, population: 80 }, // Palmas con 500,000 habitantes
  { city: 'Guarapuava', lon: -51.46541, lat: -25.39048, population: 212 }, // Palmas con 500,000 habitantes
  { city: 'São José dos Pinhais', lon: -49.20836, lat: -25.5302, population: 134 }, // Palmas con 500,000 habitantes
  { city: 'Ponta Grossa', lon: -50.16194, lat: -25.095, population: 420 } // Palmas con 500,000 habitantes
  // Agrega más ubicaciones con sus respectivas poblaciones aquí
];

const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'img/marker_map_icon.png',
  }),
});

const iconFeatures = populationData.map(data => {
  const lonLat = fromLonLat([data.lon, data.lat]);
  const iconFeature = new Feature({
    geometry: new Point(lonLat),
    name: `${data.city} (Participantes: ${data.population})`,
    population: data.population,
    rainfall: 500,
  });
  iconFeature.setStyle(iconStyle);
  return iconFeature;
});

const vectorSource = new VectorSource({
  features: iconFeatures,
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const rasterLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [rasterLayer, vectorLayer],
  view: new View({
    center: fromLonLat([-53.45528, -24.95583]), // Coordenadas para Brasil
    zoom: 6,
  }),
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

let popover;
function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}
// display popup on click
map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  disposePopover();
  if (!feature) {
    return;
  }
  popup.setPosition(evt.coordinate);
  popover = new bootstrap.Popover(element, {
    placement: 'top',
    html: true,
    content: feature.get('name'),
  });
  popover.show();
});

// change mouse cursor when over marker
map.on('pointermove', function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});
// Close the popup when the map is moved
map.on('movestart', disposePopover);