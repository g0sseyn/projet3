function ajaxGet(url, callback) {
    var req = new XMLHttpRequest();
    req.open("GET", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            // Appelle la fonction callback en lui passant la réponse de la requête
            callback(req.responseText);
        } else {
            console.error(req.status + " " + req.statusText + " " + url);
        }
    });
    req.addEventListener("error", function () {
        console.error("Erreur réseau avec l'URL " + url);
    });
    req.send(null);
}
var zoomLvl = 15;
var mymap = L.map('mapid', {
	center:[47.2173, -1.5534],
	zoom: zoomLvl,
	scrollWheelZoom:true,
	doubleClickZoom:false,
});
var myIcon = L.icon({
	iconSize:[40,40]
});
var interval;
var infoPerso = {
	name:undefined,
	surname:undefined,
	loadInfo:function(){
		var infoPersoJSON=localStorage.getItem('infoPerso');
		var cacheInfoPerso=infoPersoJSON && JSON.parse(infoPersoJSON);
		infoPerso.name=cacheInfoPerso? cacheInfoPerso.name : '';
		infoPerso.surname=cacheInfoPerso? cacheInfoPerso.surname : '';
		
	},
	saveInfo:function(name,surname){		
		infoPerso.name=name;
		infoPerso.surname=surname;	
		localStorage.setItem('infoPerso',JSON.stringify(infoPerso));
	}
};

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZ29zc2V5biIsImEiOiJjam91Y2hsMGgxNnB0M3BwYTlwczZsMzUzIn0.RyJZg4QPzrfrSyTk3M839g'
}).addTo(mymap);
function clearError(){
	$('#error').css('display','none');
	$('#alreadyReserved').css('display','none');
}
function oncanvas(show){
	if(show=='show'){		
		$('#signature').css('display','block');
		$('#valider').css('display','inline-block');
		$('#annuler').css('display','inline-block');
		$('#effacer').css('display','inline-block');
	}else {		
		$('#signature').css('display','none');
		$('#valider').css('display','none');
		$('#annuler').css('display','none');
		$('#effacer').css('display','none');
	}
}
function stationInfo(show){
	if(show=='show'){
		$('#stationInfo').css('display','block');
		$('#reserver').css('display','block');
	}else {
		$('#stationInfo').css('display','none');
		$('#reserver').css('display','none');
	}
}
function reserve(station,nom,prenom) {
	$('#infoReservation').html('Vous avez une réservation à la station :<span class="stationReserved"></br>'+station+'</span>')
};
function showInfoStation(stationName,stationAddress,stationStatus,availableBikes,bikeStands,persoName,persoSurname,bouton){
	$('#mapinfo').css('display','block');
	$('#stationName').html(stationName);
	$('#stationAdress').html(stationAddress);
	$('#stationStatus').html(stationStatus);
	$('#stationAvailableBike').html(availableBikes);
	$('#stationStandBike').html(bikeStands);
	$('#formName').val(persoName);
	$('#formSurname').val(persoSurname);
	$('#reservedBike').css('display','none');
}
function chrono(tmp){
		var min=Math.floor(tmp/60);
		var sec=Math.floor(tmp-min*60);
		$('#chrono').html('Temps restant :  </br><span class="stationChrono">'+min+' min '+sec+'s</span>');
};
var chronoTime = 1199;
if((sessionStorage.getItem('chrono')!=='0')&&(sessionStorage.getItem('station'))) {
	delaychrono();
	infoPerso.loadInfo();
	reserve(sessionStorage.getItem('station'),infoPerso.name,infoPerso.surname);
}
function delaychrono(){
	if(interval){
		clearInterval(interval);
		interval=undefined;
	}
	interval=setInterval(function() {
	var sec = sessionStorage.getItem('chrono');
	if (sec>0){
		chrono(sec);
		sec--;
		sessionStorage.setItem('chrono',sec)
	} else {clearInterval(interval);
	$('#infoReservation').html('');
	$('#chrono').html('<p>Temps Passé , Veuillez re-réservez</p>')}
	},1000)
}

ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=Nantes&apiKey=ed5e307a672804df93c903779d7a25350e86aa5b", function (reponse) {
	var stations = JSON.parse(reponse);		
	stations.forEach(function(station) {
		var available=parseInt(station.available_bikes);		
		if ((available == 0) || (station.status == 'CLOSED')) {
			myIcon.options.iconUrl='iconred.png'
		}else if (available <= 5) {
			myIcon.options.iconUrl='iconorange.png'
		}else myIcon.options.iconUrl = 'icongreen.png'
		var regex = /#[0123456789 ]{5} ?- ?/;
		var stationName = station.name.replace(regex,'');
			station.stat=(station.status=='OPEN') ? 'Ouvert' : 'Fermé';
		var marker= L.marker([station.position.lat,station.position.lng],{icon:myIcon}).addTo(mymap);
			marker.on("click",function(){				
				clearError();
				infoPerso.loadInfo();
				oncanvas('hide');
				stationInfo('show');
				showInfoStation(stationName,station.address,station.stat,station.available_bikes,station.bike_stands,infoPerso.name,infoPerso.surname);
				if (this._icon.attributes[0].nodeValue=='iconred.png') {						
					$('#bouton').css('display','none');
					$('#status').css('background-color','#ec1c24');
				}else if (this._icon.attributes[0].nodeValue=='iconorange.png'){
					$('#bouton').css('display','block');
					$('#status').css('background-color','#ff7f27');
				}else {
					$('#bouton').css('display','block');
					$('#status').css('background-color','#0ed145')
				}
				if (stationName==sessionStorage.getItem('station')) {
					stationInfo('hide');
					oncanvas('hide');
					$('#alreadyReserved').html('Vous avez déjà une réservation en cours pour cette station').css('display','block');
				}
				
				$('#reserver').on('click',function(){
				    name=$('#formName').val();
				    surname=$('#formSurname').val();
					if (name && surname) {
						clearError();
						clearCanvas();													
						infoPerso.saveInfo(name,surname);					
						oncanvas('show');
						stationInfo('hide');						
					}else $('#error').html('Veuillez remplir votre nom ET prénom').css('display','block');
				})
				$('#annuler').on('click',function(){
					oncanvas('hide');
					stationInfo('show');
				})
				$('#effacer').on('click',clearCanvas)
				$('#valider').on('click',function(){
					if(!isCanvasBlank(canvas[0])){
						clearError();
						oncanvas('hide');
						$('#reservedBike').css('display','block');
						sessionStorage.setItem('station',stationName);					
						reserve(sessionStorage.getItem('station'),name,surname);		
						$('#chrono').html('Temps restant :  </br><span class="stationChrono">20 min 0s</span>');
						sessionStorage.setItem('chrono',chronoTime)
						delaychrono(chronoTime);
					}else $('#error').html('Veuillez signer SVP !').css('display','block');
				})
				mymap.on("click",function(){
					$('#mapinfo').css('display','none');
				});
			})
	})	
})

