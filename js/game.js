this.baseUrl = 'http://localhost:8080/';
this.httpRequest = function (url) {
	this._resource = null;
    var xhr = new XMLHttpRequest(),
        promise = new Promise(function(resolve,reject){
        	var onError = function () {
		    	console.log('loading reosurces failed');
		    	reject();
		    };

		    xhr.onreadystatechange = function() {
		        if(xhr.readyState === 4 && xhr.status === 200) {
		           console.log('date returned ', xhr.response);
		           resolve(xhr.response);
		        } else if(xhr.readyState === 4) {
		        	console.error('loading resources failed');
		        	reject();
		        }
		    };
		    xhr.open('GET',url,true);
		    xhr.timeout = 60000; // Set timeout to 60 seconds (10000 milliseconds)
		    xhr.responseType = 'json';
		    xhr.ontimeout = onError;
		    xhr.onerror = onError;
		    xhr.send();
        });
    return promise;
};

var initGame = function() {
	this.mainContainer  = document.getElementById('mainContainer');
	this.spinnerContainer  = document.getElementById('spinner');
	this.winningImage = document.getElementById('winnerImage');
	this.spinButton = document.getElementById('spinButton');
	this.resultContainer = document.getElementById('resultContainer');
	this.multiplier = document.getElementById('multiplier');

	var loadResources = function () {
		this.spinButton.setAttribute('style', 'background-image: url('+ this.baseUrl + this.resource.btn_spin+');');
		this.spinButton.onclick =this.startSpin.bind(this);
	}

	//load the reosuce from server if it fails show error dialog
	this.httpRequest(this.baseUrl+'resource.json').then(
		function(success) {
			console.log(success);
			this.resource = success;
			loadResources();
		}.bind(this), function() {
			alert('SERVER ERROR');
		}
	);
}

this.startSpin = function() {
	this.spinners = [document.getElementById('image1'), document.getElementById('image2'), document.getElementById('image3')]
	this.clearResults();
	this.httpRequest(this.baseUrl+'api/spin').then(
		function(success) {
			console.log(success);
			this.finishCurrentSpin();
			var i = 0;
			for (var values in success.result) {
				if (this.resource.symbols[parseInt(success.result[values])] && this.spinners[i]) {
					this.spinners[i++].setAttribute('style', 'background-image: url('+ this.baseUrl + this.resource.symbols[success.result[values]].image+');');
				} else {
					console.error('no valid resources to set');
				}
			}
			this.resultContainer.textContent = success.winStatus;
			if (success.special) {
				this.resultContainer.textContent += '- You WON a multiplier';
				this.httpRequest(this.baseUrl+'api/special').then(
					function(success) {
						this.multiplier.textContent = 'x '+ success.result;
						this.multiplier.classList.remove('hidden');
					}.bind(this), function() {
						console.error('no valid response received');
					}
				);
			}
		}.bind(this), function() {
			this.clearResults();
			this.finishCurrentSpin();
			alert('No server response');
		}
	);
	/*this.spinButton.setAttribute('style', '');
	this.winnerImage.setAttribute('style', '');
	document.getElementById('spinnerText').textContent = 'SPIN';
	document.getElementById('spinner').classList.add('flipper');
	this.resultContainer.textContent = '';
	this.resultContainer.classList.remove('loose');
	this.resultContainer.classList.remove('win');

	var symbols = this.resource.symbols || [],
		start = 0,
		end = symbols.length-1,
		selection = Math.floor( Math.random() * ( end + 1 ) );

	console.log('index selected ' + selection, this.selector.selectedIndex);


	//update the result after 3 seconds
	setTimeout(function() {
		document.getElementById('spinner').classList.remove('flipper');
		document.getElementById('spinnerText').textContent = '';
		this.spinButton.setAttribute('style', 'background-image: url('+ this.baseUrl + this.resource.btn_spin+');');
		this.winnerImage.setAttribute('style', 'background-image: url('+this.baseUrl  + symbols[selection].image+');');
		if(selection === this.selector.selectedIndex) {
			this.resultContainer.textContent = 'YOU WON';
			this.resultContainer.classList.add('win');
		} else {
			this.resultContainer.textContent = 'YOU LOOSE';
			this.resultContainer.classList.add('loose');
		}
	}.bind(this),3000);*/
}

this.finishCurrentSpin = function () {
	this.spinnerContainer.classList.remove('spin');
	this.spinButton.onclick =this.startSpin.bind(this);
	this.spinButton.setAttribute('style', 'background-image: url('+ this.baseUrl + this.resource.btn_spin+');');
}

this.clearResults = function() {
	this.spinnerContainer.classList.add('spin');
	this.resultContainer.textContent = '';
	this.spinButton.onclick = '';
	this.multiplier.classList.add('hidden');
	this.spinButton.setAttribute('style', 'background-image: url('+ this.baseUrl + this.resource.btn_spin_disabled+');');
	for (var spinner in this.spinners) {
		this.spinners[spinner].setAttribute('style', 'background-image: "");');
	}
}