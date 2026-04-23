// analyzer.js - farm plot analyzer with map and crop plotting

document.addEventListener('DOMContentLoaded', function () {
    initializeMap();
    setupEventListeners();
});

// globals
let map;
let drawnItems;
let drawControl;
let currentLayer = 'satellite';
let plotCount = 0;

// map tile layers
const tileLayers = {
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,


    }),
    streets: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,

    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: OpenTopoMap',
        maxZoom: 17,

    })
};

//layers for different GIS modeling
const overlayLayers = {
    ndvi: L.layerGroup(),
    soil: L.layerGroup()
};

function initializeMap() {
    // initialize map centered
    map = L.map('map', {
        center: [0, 0],
        zoom: 3, //intial zoom 3 
        minZoom: 2, //set min zoom 
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]], //set max bounds 
        layers: [tileLayers.satellite], //intial satellite view
        maxBoundsViscosity: 1.0, // viscous af -- how quickly mouse moves back

        zoomControl: false
    });

    // initial layers
    overlayLayers.ndvi.addTo(map); //ndvi add
    overlayLayers.soil.addTo(map); // soil moisture add

    // drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // draw control
    drawControl = new L.Control.Draw({
        draw: {
            polygon: { // polygon shape
                allowIntersection: false, // no crossing plots
                showArea: true, // inner shade
                shapeOptions: {
                    color: '#84a98c',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#2d6a4f',
                    fillOpacity: 0.2
                }
            },
            polyline: false,
            rectangle: { // rectangle
                shapeOptions: {
                    color: '#84a98c',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#2d6a4f',
                    fillOpacity: 0.2
                }
            },
            circle: {
                shapeOptions: {
                    color: '#84a98c',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#2d6a4f',
                    fillOpacity: 0.2
                }
            },
            marker: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    map.addControl(drawControl);

    // mouse movement --> coordinates
    map.on('mousemove', function (e) {
        document.getElementById('lat-display').textContent = e.latlng.lat.toFixed(4);
        document.getElementById('lng-display').textContent = e.latlng.lng.toFixed(4);
    });

    // handle drawn shapes
    map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        // update plot count
        plotCount = drawnItems.getLayers().length;
        updatePlotCount(); // call 01
        addPlotToList(layer);

        // enable analyze button
        document.getElementById('analyze-plot').disabled = false;
    });

    // handle edits
    map.on(L.Draw.Event.EDITED, function () {
        updatePlotCount(); // call 02
    });

    // handle deletions
    map.on(L.Draw.Event.DELETED, function () {
        plotCount = drawnItems.getLayers().length;
        updatePlotCount(); // call 03
        updatePlotList();

        if (plotCount === 0) {
            document.getElementById('analyze-plot').disabled = true;
        }
    });
}

function setupEventListeners() {
    // draw plot button
    document.getElementById('draw-plot').addEventListener('click', function () {
        new L.Draw.Polygon(map, {
            shapeOptions: {
                color: '#84a98c',
                weight: 3,
                opacity: 0.8,
                fillColor: '#2d6a4f',
                fillOpacity: 0.2
            }
        }).enable();
    });


    document.getElementById('analyze-plot').addEventListener('click', function () { // analyze button, does nothing currently
        
    });

    // clear all plots
    document.getElementById('clear-plots').addEventListener('click', function () {
        drawnItems.clearLayers();
        plotCount = 0;
        updatePlotCount(); // call 04
        updatePlotList();
        document.getElementById('analyze-plot').disabled = true;
    });

    // layer switching
    document.getElementById('layer-satellite').addEventListener('click', function () {
        switchLayer('satellite', this);
    });

    document.getElementById('layer-streets').addEventListener('click', function () {
        switchLayer('streets', this);
    });

    document.getElementById('layer-terrain').addEventListener('click', function () {
        switchLayer('terrain', this);
    });

    // overlay toggles
    document.getElementById('toggle-ndvi').addEventListener('change', function (e) {
        toggleOverlay('ndvi', e.target.checked);
    });

    document.getElementById('toggle-soil').addEventListener('change', function (e) {
        toggleOverlay('soil', e.target.checked);
    });

    // map controls
    document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());

    document.getElementById('my-location').addEventListener('click', function () {
        map.locate({ setView: true, maxZoom: 16 });
    });

    document.getElementById('fullscreen-map').addEventListener('click', toggleFullscreen);

    // handle location found
    map.on('locationfound', function (e) {
        L.circleMarker(e.latlng, {
            color: '#84a98c',
            weight: 3,
            fillColor: '#2d6a4f',
            fillOpacity: 0.5,
            radius: 10
        }).addTo(map).bindPopup('You are here!').openPopup();
    });
}

function switchLayer(layerName, button) {
    // remove active class from all layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // add active class to clicked button
    button.classList.add('active');

    // remove current layer
    map.removeLayer(tileLayers[currentLayer]);

    // add new layer
    map.addLayer(tileLayers[layerName]);
    currentLayer = layerName;
}

function toggleOverlay(overlayName, show) {
    const legend = document.getElementById(`legend-${overlayName}`);
    const overlay = overlayLayers[overlayName];

    // clear existing overlay
    overlay.clearLayers();

    // show/hide legend
    if (legend) {
        legend.style.display = show ? 'block' : 'none';
    }

    if (show) { //if user chooses to toggle GIS layers
        // add visual representation
        const bounds = map.getBounds(); 
        const center = bounds.getCenter();

        if (overlayName === 'ndvi') {
            // add NDVI pattern 
            for (let i = 0; i < 8; i++) {
                const lat = center.lat + (Math.random() - 0.5) * 0.2;
                const lng = center.lng + (Math.random() - 0.5) * 0.2;
                const radius = 100 + Math.random() * 200;

                // random NDVI values 
                const colors = ['#d73027', '#fee08b', '#1a9850'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                L.circle([lat, lng], {
                    radius: radius,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 0
                }).addTo(overlay);
            }
        } else if (overlayName === 'soil') {
            // add soil moisture pattern 
            for (let i = 0; i < 6; i++) {
                const lat = center.lat + (Math.random() - 0.5) * 0.25;
                const lng = center.lng + (Math.random() - 0.5) * 0.25;
                const radius = 150 + Math.random() * 300;

                // soil moisture colors
                const colors = ['#8B4513', '#A0522D', '#CD853F'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                L.circle([lat, lng], {
                    radius: radius,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    weight: 0
                }).addTo(overlay);
            }
        }
    }
}

function addPlotToList(layer) {
    const list = document.getElementById('plot-list');
    const plotId = Date.now();

    // calculate approximate area
    let area = 0;
    if (layer.getLatLngs) {
        try {
            area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        } catch (e) {
            area = 0.00; // 
        }
    }

    const areaAcres = (area * 0.000247105).toFixed(2); // convert to acres 


    // remove empty message if present
    if (list.querySelector('.empty-plots')) {
        list.innerHTML = '';
    }

    const plotElement = document.createElement('div');
    plotElement.className = 'plot-item';
    plotElement.dataset.id = plotId;
    plotElement.innerHTML = `
        <div class="plot-icon">
            <i class="fas fa-draw-polygon" style="color: #84a98c;"></i>
        </div>
        <div class="plot-details">
            <div class="plot-name">Farm Plot ${plotCount}</div>
            <div class="plot-area">${areaAcres} acres</div>
        </div>
        <button class="plot-remove" onclick="removePlot(this)" title="Remove plot">
            <i class="fas fa-times"></i>
        </button>
    `;

    list.appendChild(plotElement);
}

function updatePlotCount() { // counts the layers 
    const count = drawnItems.getLayers().length;
    document.getElementById('plot-count').textContent = count === 1 ? '1 plot' : `${count} plots`;
}

function updatePlotList() {
    const list = document.getElementById('plot-list');

    if (plotCount === 0) {
        list.innerHTML = `
            <div class="empty-plots">
                <i class="fas fa-map-marked-alt"></i>
                <p>No plots drawn yet.<br>Click "Draw Plot" to outline your farm area.</p>
            </div>
        `;
    }
}

// make removePlot globally available
window.removePlot = function (button) {
    const plotItem = button.closest('.plot-item');
    if (plotItem) {
        // Remove the corresponding layer from map
        const layers = drawnItems.getLayers();
        if (layers.length > 0) {
            drawnItems.removeLayer(layers[layers.length - 1]);
        }
        plotItem.remove();

        plotCount = drawnItems.getLayers().length;
        updatePlotCount();

        if (plotCount === 0) {
            document.getElementById('analyze-plot').disabled = true;
            updatePlotList();
        }
    }
};

function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-wrapper');
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Handle window resize
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});