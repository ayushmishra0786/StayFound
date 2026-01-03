
    let btn = document.querySelector(".mapBtn");

    // for geocode location
    async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
        headers: {
        "Accept": "application/json"
        }
    });

    const data = await response.json();

    if (data.length > 0) {
        return {
        lat: data[0].lat,
        lon: data[0].lon,
        display_name: data[0].display_name
        };
    } else {
        alert("Location not found");
        return null;
    }
    }

    if(place.length>0){
        geocodeAddress(place).then(result => {
            if (result) {
                const map = L.map('map', {
                    attributionControl: false
                }).setView([result.lat, result.lon], 10);

                // Base layers
                const normal_map = L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { attribution: '© StayFound' }
                ).addTo(map);

                //satellite layers
                const satellite = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                    'World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    // { attribution: 'Ayush Gautam, © GaIn' }
                );

                // Overlay labels (roads + places)
                const labels = L.tileLayer(
                    'https://services.arcgisonline.com/ArcGIS/rest/services/' +
                    'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
                    // { attribution: 'Ayush Gautam, © GaIn' }
                );

                // add custom attribution
                L.control.attribution({
                    position: 'bottomright',
                    prefix: false,   // removes "Leaflet"
                }).addAttribution('Ayush Gautam').addTo(map);

                // Layer control
                L.control.layers(
                    {
                    "Normal": normal_map,
                    "Satellite": satellite
                    },
                    {
                    "Satellite Labels": labels
                    }
                ).addTo(map);

                //marker
                L.marker([result.lat, result.lon])
                    .addTo(map)
                    .bindPopup(result.display_name)
                    .openPopup();

                // Auto-enable labels when satellite is selected
                map.on('baselayerchange', function (e) {
                if (e.name === "Satellite") {
                    map.addLayer(labels);
                } else {
                    map.removeLayer(labels);
                }
                });

                //for current location
                navigator.geolocation.watchPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    map.setView([lat, lon], 5);

                    L.circleMarker([lat, lon], {
                        radius: 8,
                        color: 'pink',
                        fillColor: 'pink',
                        fillOpacity: 1
                    })
                    .addTo(map)
                    .bindPopup("You are about here")
                    .openPopup();

                    L.circle([lat, lon], {
                    //   radius: accuracy,
                        color: 'green',
                        fillColor: '#green',
                        fillOpacity: 1
                    }).addTo(map);
                });

                // adding permission feature to show current location
                btn.addEventListener("click", () => {
                    if (!navigator.geolocation) {
                        alert("Geolocation is not supported by your browser");
                        return;
                    }

                    navigator.geolocation.getCurrentPosition((pos) => {
                        const userLat = pos.coords.latitude;
                        const userLng = pos.coords.longitude;

                        const destLat = result.lat;
                        const destLng = result.lon;

                        L.Routing.control({
                            waypoints: [
                            L.latLng(userLat, userLng),
                            L.latLng(destLat, destLng)
                            ],
                            routeWhileDragging: false,
                            show: false,
                            addWaypoints: false
                        }).on('routesfound', function (e) {
                            const route = e.routes[0];
                            const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
                            const timeMin = (route.summary.totalTime / 60).toFixed(0);

                            alert(`Distance: ${distanceKm} km\nTime: ${timeMin} mins`);
                        }).addTo(map);
                    });
                });
            }
        }).catch((e) => {
            console.log(e);
        });
    }