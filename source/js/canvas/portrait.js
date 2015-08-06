var Portrait = (function() {

	var hidden = document.createElement("canvas");
	var hCtx = hidden.getContext("2d");

	var buffer = document.createElement("canvas");
	var bCtx = buffer.getContext("2d");
	buffer.width = canvas2.width;
	buffer.height = canvas2.height;

	hidden.width = "192";
	hidden.height = "256";

		//data
	var imgData, d,

		//where on the canvas image is rendered
		rX = canvas2.width/1.8,
		rY = canvas2.height/3,
 
		//for looping through data
		i, j, k,

		//image width and height
		w, h,

		//for grabbing a chunk of the image
		x, y, w2, h2,

		//for randomness
		r, r2,

		leng,

		//colors: red, green, blue purple, yellow, teal, none
		color = 'r',
		colors = 'rgbpytn',
		//alpha
		a,
	
		//time
		t = 0,
		time = 0;

	//load image
	var img = new Image();
		img.src = 'img/portrait.jpg';
		img.onload = handleLoad;


	//save image data
	function handleLoad() {

		hCtx.drawImage(img, 0, 0, hidden.width, hidden.height);

		imgData = imgData2 = hCtx.getImageData(0, 0, hidden.width, hidden.height);
		d = d2 = imgData.data,

		w = imgData.width;
		h = imgData.height;
		leng = d.length;
	}

	/**
	 * setup glitch  
	 */

		var id;

		var filter = function(d, i) {

			if (time % 5 === 0) {
				return _isDarkerThan(_rand(50, 200))(d, i);
			}
			else if (time % 5 === 1) {
				return _isRedderThan(_rand(100, 200))(d, i);
			}
			else if (time % 5 === 2) {
				return _isLessRedThan(_rand(100, 200))(d, i);
			} 
			else if (time % 5 === 3) {
				return _isLessBlueThan(_rand(100, 200))(d, i);
			} 
			else if (time % 5 === 4) {
				return _isBrighterThan(_rand(100, 200))(d, i);
			}
			else {
				return false;			
			}

		}

		var color1 = function(d, i) {
			if (Math.random() > 0.8) {
				_alpha(100);
			}
			else {
				_invert(d, i);
			}
		}
		
		var colorF = _getColoringF(filter, 
								color1,
								 _standardDark);

		var render = function(d) {
			bCtx.fillStyle = "rgba(16, 16, 32, 0.5)"; 
			bCtx.fillRect(rX - 5, 
							rY - 5, 
							hidden.width * 1.1, 
							hidden.height * 1.1);

			var r = Math.random();

			if (r > 0.7) {
				_renderChunk(d);
			}
			else {
				_renderShifted(d, h/_rand(10, 160), _rand(1, 5));
			}

			_resetData(d);

			if (time === t*6) {
				color = colors[  Math.round( Math.random()*(colors.length - 1) ) ];
			}

			time = (time + t) % 7*t;
		}

		var glitch = _getGlitch(_all, colorF, render);

		var runGlitch = function() {
			var r = Math.random();

			glitch();

			if (r > 0.1) {
				id = setTimeout(runGlitch, t);
			}
			else {
				id = setTimeout(unGlitch, t);
			}

		}

		var unGlitch = function() {
			var r = Math.random();

			ctx2.clearRect(0, 0, 
							canvas2.width, 
							canvas2.height);

			_renderOriginal();

			if (r > 0.8) {
				time = 0;
				t = _rand(30, 150);

				id = setTimeout(runGlitch, t);
			}
			else {
				id = setTimeout(unGlitch, 300);
			}
		} 

	/**
	 *
	 */


	return {
		init: init,
		stop: stop
	}


	function init() {
		//we'll have something different later...
		_renderOriginal();
		id = setTimeout(unGlitch, 1000);
	}

	function stop() {
		clearTimeout(id);
	}




	function _resetData(id) {
		imgData = hCtx.getImageData(0, 0, hidden.width, hidden.height);
		d = imgData.data;
	}


	//creates a coloring function w/ an added filter
	//optional: applyColor2 is executed for pixels that don't pass the filter
	function _getColoringF(filter, applyColor, applyColor2) {
		var f;

		if (applyColor2) {
			f = function(d, i) {
				if (filter(d, i)) {
					applyColor(d, i);
				}	
				else {
					applyColor2(d, i);
				}
			}
		}
		else {
			f = function(d, i) {
				if (filter(d, i)) {
					applyColor(d, i);
				}	
			}
		}

		return f;	
	}

	//create function that executes a frame of glitch
	function _getGlitch(divider, coloringF, render) {
		return divider.bind(this, 
							coloringF, 
							render);

	}

	
	/*
	 * rendering functions
	 */
	function _renderOriginal() {
		var orig = hCtx.getImageData(0, 0, hidden.width, hidden.height);
		ctx2.putImageData(orig, rX, rY);
	}

	function _renderWhole(imgData) {
		bCtx.putImageData(imgData, rX, rY);
		ctx2.drawImage(buffer, 0, 0);
	}

	function _renderChunk(imgData) {
		x = _rand(0, w),
		y = _rand(0, h),
		w2 = (x > w/2) ? _rand(-1,-x) : _rand(1, w - x),
		h2 = (y > h/2) ? _rand(-1, -y) : _rand(1, h - y);

		ctx2.putImageData(imgData, 
						  rX, rY,
						  x, y,
						  w2,
						  h2);
	}

	//data, block height, shift increment
	function _renderShifted(imgData, hInc, sInc) {
		var i, cX;

		for (i = 0 ; i < h ; i+=sInc) {

			cX = ( Math.round(i / hInc) % 2 === 0) ? rX + sInc : rX - sInc; 

			bCtx.putImageData(imgData, 
							  cX, rY,
							  0, i,
							  w,
							  hInc);
		}


		ctx2.drawImage(buffer, 0, 0);
	}

	/*
	 * filtering functions
	 */
	function _isBrighterThan(n) {

		return function(d, i) {
			return (d[i] + d[i+1] + d[i+2])/3 > n;
		}

	}

	function _isDarkerThan(n) {

		return function(d, i) {
			return (d[i] + d[i+1] + d[i+2])/3 < n;
		}

	}

	function _isRedderThan(n)  {

		return function(d, i) {
			return d[i] > n;
		}

	}

	function _isLessRedThan(n) {
		
		return function(d, i) {
			return d[i] < n;
		}

	}

	function _isGreenerThan(n)  {

		return function(d, i) {
			return d[i+1] > n;
		}

	}

	function _isLessGreenThan(n) {
		
		return function(d, i) {
			return d[i+1] < n;
		}

	}

	function _isBluerThan(n)  {

		return function(d, i) {
			return d[i+2] > n;
		}

	}

	function _isLessBlueThan(n) {
		
		return function(d, i) {
			return d[i+2] < n;
		}

	}

	function _randHigherThan(n) {
		
		return function() {
			return Math.random() > n;
		}

	}

	/*
	 * coloring functions
	 */
	function _grayScale(d, i) {
		var avg = (d[i] + d[i+1] + d[i+2])/3;

		d[i] = avg;
		d[i+1] = avg;
		d[i+2] = avg;
	}

	function _invert(d, i) {
		d[i] = 255 - d[i];
		d[i+1] = 255 - d[i+1];
		d[i+2] = 255 - d[i+2];
	}

	function _alpha(a) {
		return function(d, i) {
			d[i + 3] = a;
		}
	}

	function _standardDark(d, i) {
		var diff;

		if (color === 'r') {
			 diff = (255 - d[i]) / 2;

			 d[i+1] = d[i+1] - diff;
			 d[i+2] = d[i+2] - diff;
		}
		else if (color === 'g') {
			 diff = (255 - d[i+1]) / 2;

			 d[i] = d[i] - diff;
			 d[i+2] = d[i+2] - diff;
		}
		else if (color === 'b') {
			 diff = (255 - d[i+2]) / 2;

			 d[i] = d[i] - diff;
			 d[i+1] = d[i+1] - diff;
		}
		else if (color === 'p') {
			 diff = 2*255 - d[i] - d[i+2];

			 d[i+1] = d[i+1] - diff;
		}
		else if (color === 'y') {
			 diff = 2*255 - d[i] - d[i+1];

			 d[i+2] = d[i+2] - diff;
		}
		else if (color === 't') {
			 diff = 2*255 - d[i+1] - d[i+2];

			 d[i] = d[i] - diff;
		}
	}

	/*
	 * 'dividing' functions
	 */

	//these functions take in a coloring function and rendering function, 
	//divides the pixels in some type of way, applies colors  and renders 
	
	function _all(coloringF, render) {
		for (i = 0 ; i < leng ; i+=4 ) {
			coloringF(d, i);
		}

		render(imgData);
	}

	//
	function _rand(lo, hi) {
		return Math.round( Math.random() * (hi - lo)  + lo );
	}
})();
