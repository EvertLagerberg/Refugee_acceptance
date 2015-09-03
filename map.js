	


	
	var definitiveLayerSelected = true;

	/*-----------------Create layers and map-------------------*/

	definitiveLayer = L.geoJson(geojson, {
		style: styleDefinitive,
		onEachFeature: onEachFeature
	});

	relativeLayer = L.geoJson(geojson, {
		style: styleRelative,
		onEachFeature: onEachFeature
	});

	var map = L.map('map', 
		{
			layers:[definitiveLayer]
		}).setView([62.30879, 15.99609], 5);



	
	var baselayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	}).addTo(map);	



		function getColorDefinitive(d) {
		    return d > 800 	? '#49006a' :
		           d > 400  ? '#7a0177' :
		           d > 200  ? '#ae017e' :
		           d > 100  ? '#dd3497' :
		           d > 50   ? '#f768a1' :
		           d > 20   ? '#fa9fb5' :
		           d > 10   ? '#fcc5c0' :
		                      '#fde0dd';
		}



		function getColorRelative(d) {
		    return d > 15 	? '#49006a' :
		           d > 12  	? '#7a0177' :
		           d > 10  	? '#ae017e' :
		           d > 5 	? '#dd3497' :
		           d > 2.5  ? '#f768a1' :
		           d > 1 	? '#fa9fb5' :
		           d > 0.5  ? '#fcc5c0' :
		                      '#fde0dd';
		}		


		function styleDefinitive(feature) {

		    return {
		        fillColor: getColorDefinitive(feature.properties.mottagna),
		        weight: 2,
		        opacity: 1,
		        color: 'white',
		        dashArray: '3',
		        fillOpacity: 0.7
		    };
		}

		function styleRelative(feature) {
		    return {
		        fillColor: getColorRelative(feature.properties.mottagna/(feature.properties.population/1000)),
		        weight: 2,
		        opacity: 1,
		        color: 'white',
		        dashArray: '3',
		        fillOpacity: 0.7
		    };
		}





 		function highlightFeature(e) {
    	var layer = e.target;

	    layer.setStyle({
	        weight: 2,
	        color: '#666',
	        dashArray: '',
	        fillOpacity: 0.7
	    });

	    if (!L.Browser.ie && !L.Browser.opera) {
	        layer.bringToFront();
	    }
	    info.update(layer.feature.properties);
	    

		}

		function resetHighlight(e) {
			if(definitiveLayerSelected){
				definitiveLayer.resetStyle(e.target);
				console.log("1");
			}
    		else{
    		 	relativeLayer.resetStyle(e.target);
    		 	console.log("2");
    		}
    		
    		info.update();
		}

		function zoomToFeature(e) {
    		map.fitBounds(e.target.getBounds());
		}
	

		function onEachFeature(feature, layer) {
		    layer.on({
		        mouseover: highlightFeature,
		        mouseout: resetHighlight,
		        click: zoomToFeature
		    });
		}





		/*-----------------INFOBOX-------------------*/
		var info = L.control();

		info.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'info infobox'); // create a div with a class "info"
		    this.update();
		    return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		info.update = function (props) {
		    this._div.innerHTML = '<h4>Refugees received per Municipality 2015</h4>' +  (props ?
		        '<b>' + props.KnNamn + '</b> ['+ props.population + ' citizens] <br />' + props.mottagna + ' received' 
		        + '<br /> where of ' + props.vrv_ensmbrn +' unaccompanied minors'
		        : 'Hover over a municipality');
		};

		info.addTo(map);



		/*-----------------LEGEND1-------------------*/
		var legend1 = L.control({position: 'bottomright'});

		legend1.onAdd = function (map) {

		    var div = L.DomUtil.create('div', 'info legend'),
		        grades = [0, 10, 20, 50, 100, 200, 400, 800],
		        labels = [];

		    // loop through our intervals and generate a label with a colored square for each interval
		    for (var i = 0; i < grades.length; i++) {
		        div.innerHTML +=
		            '<i style="background:' + getColorDefinitive(grades[i] + 1) + '"></i> ' +
		            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		    }

		    return div;
		};

		legend1.addTo(map);



		/*-----------------LEGEND2-------------------*/
		var legend2 = L.control({position: 'bottomright'});

		legend2.onAdd = function (map) {

		    var div = L.DomUtil.create('div', 'info legend'),
		        grades = [0, 0.5, 1, 2.5, 5, 10, 12, 15],
		        labels = [];

		    // loop through our intervals and generate a label with a colored square for each interval
		    for (var i = 0; i < grades.length; i++) {
		        div.innerHTML +=
		            '<i style="background:' + getColorRelative(grades[i]+0.5) + '"></i> ' +
		            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		    }

		    return div;
		};






		/*-----------------LAYER CONTROL-------------------*/
		var baseMaps = {
	    "received refugees": definitiveLayer,
	    "received refugees per thousand citizens": relativeLayer
		};

		L.control.layers(baseMaps).addTo(map);

		// Add and remove layers
		map.on('baselayerchange', function (eventLayer) {

			definitiveLayerSelected = !definitiveLayerSelected;

		    // Switch to the Permafrost legend...
		    if (eventLayer.name === "received refugees per thousand citizens") {
		        map.removeControl(legend1);
		        legend2.addTo(map);
		    } else { // Or switch to the treeline legend...
		        map.removeControl(legend2);
		        legend1.addTo(map);
		    }
		});



if (L.Browser.touch) {
    L.control.touchHover().addTo(map);
}

		


