"use strict";

// Show page map
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "show-map", // container ID
  style: "mapbox://styles/mapbox/light-v11", // style URL
  center: photo.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
});

// navigation control
map.addControl(new mapboxgl.NavigationControl());

// photo marker pop up
new mapboxgl.Marker({ offset: [0, -22] })
  .setLngLat(photo.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({}))
  .addTo(map);

//////////////////////////////////////////////////////////////////////
// load data
map.on("load", () => {
  map.addSource("photos", {
    type: "geojson",
    // point to geojson data
    data: photos,
    cluster: true,
    clusterMaxZoom: 14, // max zoom to cluster points on
    clusterRadius: 50, // radius of each cluster when clustering points
  });

  //////////////////////////////////////////////////////////////////////
  // add cluster points
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "photos",
    filter: ["has", "point_count"],
    paint: {
      // three steps to implement three types of circles
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#1B9C85",
        30,
        "#FFE194",
        100,
        "#E8F6EF",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 30, 30, 100, 40],
    },
  });

  //////////////////////////////////////////////////////////////////////
  // add cluster numbers
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "photos",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  //////////////////////////////////////////////////////////////////////
  // add unclustered points
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "photos",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#4C4C6D",
      "circle-radius": 10,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  //////////////////////////////////////////////////////////////////////
  // inspect a cluster on click
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("photos").getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
      });
    });
  });

  //////////////////////////////////////////////////////////////////////
  // unclustered point pop up
  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { popUp } = e.features[0].properties;
    // the popup appears over the copy being pointed to
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUp).addTo(map);
  });

  //////////////////////////////////////////////////////////////////////
  // mouse over style
  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});
