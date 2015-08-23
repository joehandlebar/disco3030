"use strict";

/**
 * Global utility for managing interface components 
 * knock-off of Backbone
 */
var Disco = {};

Disco.components = {};

//object w/ routing functions, callback after routing
Disco.router = function(routes, cb) {
	var hash;

	this.initRouter = function() {
		window.addEventListener('hashchange', updatePage)
		
		updatePage();
		cb();
	}

	function updatePage(e) {
		if (e) {
			e.preventDefault();
		}

		hash = window.location.hash.slice(1);

		if (typeof routes[hash] !== "undefined") {
			if (e) {
				routes[hash](e);
			}
			else {
				routes[hash]();
			}
		} 
		else {
			//we'll have a 404 eventually...
			routes['']();	
		}
	}
}


Disco.add = function(name, obj) {
	var origRender, newRender;

	//store component
	this.components[name] = obj;

	origRender = obj.render.bind(obj);

	//complete the render function
	//all render functions called once all components
	//are set up
	newRender = function() {
		//call render w/ the right context
		origRender();
		//attach events
		if (obj.events) {
			_attachEvents(obj, obj.events)	
		}
	}

	obj.render = newRender;
}

Disco.get = function(name) {
	if (typeof this.components[name] !== "undefined") {
		return this.components[name];
	}
}

//renders all components
//you can decide the order and timing of the rendering process
Disco.render = function(order, times) {
	var c, 
		i, leng, delay = 0,
		components = this.components;

	//render selected components
	if (order && times) {
		leng = order.length;

		for (i = 0 ; i < leng; i++) {
			delay += times[i];
			_timeout(components[order[i]].render, delay);
		}

		//set up routing after interface is rendered
		_timeout(this.initRouter, delay);
	}
	//render everything in w.e order
	else {
		for (c in components)  {
			components[c].render();
		}

		//set up routing after interface is rendered
		_timeout(this.initRouter, delay);
	}
}

function _timeout(f, delay) {
	setTimeout(f, delay);
}

//helper for attaching events to view
function _attachEvents(view, events) {
	var el = view.el,
		el2;

	for (var ev in events) {

		if (typeof events[ev] === "string") {
			//be able to reference interface obj	
			el.view = view;
			//events attached to top level interface
			el.on(ev, view[events[ev]].bind(el));
		}

		else {

			//events attached a lower level component
			for (var elem in events[ev]) {
				el2 = $(elem);
				//be able to reference interface obj	
				el2.view = view;
				el2.on(ev, view[events[ev][elem]].bind(el2) );
			}	

		}

	}
}

/* A+ promise implementation from
 * http://modernjavascript.blogspot.ca/2013/08/promisesa-understanding-by-doing.html 
 */
var Aplus = function() {
	var State = {
		PENDING: 0,
		FULFILLED: 1,
		REJECTED: 2
	};

	var Aplus = {
		state: State.PENDING,

		changeState: function(state, value) {
			if (this.state == state) {
				throw new Error("can't transition to same state: " + state);
			}

			if (this.state == State.FULFILLED ||
					this.state == State.REJECTED) {
				throw new Error("can't transition from current state: " + state);
			}

			//if (!value) {
				//throw new Error("transition must have none null reason");
			//}

			this.state = state;
			this.value = value;
			this.resolve();
			return this.state;
		},

		fulfill: function(value) {
			this.changeState( State.FULFILLED, value );				 
		},

		reject: function(reason) {
			this.changeState( State.REJECTED, reason );
		},

		//fulfills promise with a delay
		timeout: function(delay, value) {
			setTimeout(this.fulfill.bind(this, value), delay);
		},

		then: function( onFulfilled, onRejected ) {
			//initialize array
			this.cache = this.cache || [];

			var promise = Object.create(Aplus);

			this.cache.push({
				fulfill: onFulfilled,
				reject: onRejected,
				promise: promise
			});

			this.resolve();

			return promise;
		},

		resolve: function() {
			// check if pending
			if (this.state == State.PENDING) {
				return false;
			}


			// for each 'then'
			while ( this.cache && this.cache.length ) {
				var obj = this.cache.shift();

				var fn = this.state == State.FULFILLED ? obj.fulfill : obj.reject;

				if ( typeof fn != 'function' ) {
					obj.promise.changeState( this.state, this.value );
				}
				else {
					try {
						var value = fn( this.value );

						if ( value && typeof value.then == 'function' ) {
							value.then( function(value) {
								obj.promise.changeState( State.FULFILLED, value );
							}, function(error) {
								obj.promise.changeState( State.REJECTED, error );
							});
						}
						else {
							obj.promise.changeState( State.FULFILLED, value );
						}
					}
					catch (error) {
						obj.promise.changeState( State.REJECTED, error );
					}
				}
			}
		}
	};

	return Object.create(Aplus);
}

var sprites = (function() {
	var _sprites;

	function setSprites(data) {
		_sprites = data; 
	}

	function getSprite(img) {
		return _sprites[img];
	}

	function applyImgToEl(img, $el) {
		var d = _sprites[img];

		if (typeof d.href !== "undefined") {
			$el.attr("href", d.href);
		}

		$el.css({ 'background-position': d.x + 'px ' + d.y + 'px',
					  'width': d.width,
					  'height': d.height });
	} 

	return {
		setSprites: setSprites,
		getSprite: getSprite,
		applyImgToEl: applyImgToEl
	}

})();

var templates = (function() {
	var _templates = { 'work_menu':  { type: 'html',
								  	 html: ''},
					  'work_display':  { type: 'html',
								  	     html: ''}
					};

	return {
		loadTemplates: loadTemplates,
		compileTemplates: compileTemplates,
		getTemplate: getTemplate
	}


	//takes a promise to fulfill once templates are loaded
	function loadTemplates(promise) {
		var leng = Object.keys(_templates).length, 
			i = 0, 
			tmp;

		for (tmp in _templates) {
			_loadTemplate(tmp);

		}

		function _loadTemplate(tmp) { 
			var tmpObj = _templates[tmp],
				path = 'view/' + tmp + '.' + tmpObj.type;

			$.get(path, storeTemplate);

			function storeTemplate(data) { 
				tmpObj.html = data;

				i++;
				//all templates loaded? 
				(i === leng) && promise.fulfill();
			}
		}

	}

	//compiles templates with given data
	function compileTemplates(data) {
		var menuTmp = Handlebars.compile(_templates['work_menu'].html),
			displayTmp = Handlebars.compile(_templates['work_display'].html, { noEscape: true });

		//inject sprite data 
		data.apps.forEach(_injectSpriteData);
		data.wordpress.forEach(_injectSpriteData);

		_templates['work_menu'].html = menuTmp({ 
											apps: data.apps, 
											wordpress: data.wordpress 
										   }); 

		_templates['work_display'].html = displayTmp({ 
												apps: data.apps, 
												wordpress: data.wordpress 
											   }); 
	}

	function getTemplate(t) {
		return _templates[t].html;
	}

	/****/

	function _injectSpriteData(project) { 
		project.img = sprites.getSprite(project.img);

		project.tools = project.tools.map(_getToolsSpriteData);
	}

	function _getToolsSpriteData(name) { 
		return sprites.getSprite(name.toLowerCase());
	} 
})();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext('2d');

var raf = window.requestAnimationFrame;
var caf = window.cancelAnimationFrame;

canvas.width = canvas2.width = window.innerWidth;
canvas.height = canvas2.height = window.innerHeight;

function getHex(base10) {
	var base16 = base10.toString(16);
	return (base16.length > 1) ? base16 : '0' + base16; 
}

//Each browser in the browser display has its own set of data
var Browser = function(pts, colors) {
	if (!(this instanceof Browser)) {
		return new Browser(pts, colors);
	}

	//the original set of points
	this.pts = pts;

	//the corresponding colors 
	this.colors = colors;

	//a separate array to hold the animated data
	this.rotated = [];

	//copy this.pts to this.rotated
	this.resetPts();

	//radius of disc
	this.r = 3;

	//interval id
	this.id = undefined;


	//var img = new Image();
	//img.src = src;
	//img.onload = this.handleLoad.bind(this, img);
}


Browser.prototype = (function() { 

	return { 
		resetPts: resetPts,
		explode: explode,
		blowUp: blowUp,
 		shrink: shrink,
	    twirl: twirl,
         stop: stop
	}

	function resetPts() {
		var i, leng = this.pts.length;
	
		for ( i = 0 ; i < leng ; i++ ) {
			this.rotated[i] = this.pts[i];
		}
	}

	/*
	 * used to extract data from raw img
	 * right now we have the ones we want in browsers.json 
	 */

	//handleLoad: function(img) {

		//var imgData, data, 
			//i, i4, 
			//x, y,
			//colorTotal,
			//leng, l;

		//hCtx.clearRect(0, 0, hidden.width, hidden.height);
		//hCtx.drawImage(img, 0, 0, hidden.width, hidden.height);

		//imgData = hCtx.getImageData(0, 0, hidden.width, hidden.height);

		//data = imgData.data,

		//leng = data.length/4,

		//l = Math.sqrt(leng);


		//for ( i = 0 ; i < leng ; i+=109) {
			//i4 = i*4;

			//colorTotal = data[i4] + data[i4+1] + data[i4+2];

			//if (colorTotal > 0 && colorTotal < 750) {
				////translate points to center
				////and shrink
				//x = ((i % l) - 200) * 1/100;
				//y = ((Math.floor(i / l) ) - 200) * 1/100;


				//this.colors.push("#" 
									//+ getHex(data[i4])
									//+ getHex(data[i4+1])
									//+ getHex(data[i4+2]));

				//this.pts.push(x);
				//this.pts.push(y);
				//this.pts.push(0);

				//this.rotated.push(x);
				//this.rotated.push(y);
				//this.rotated.push(0);
			//}
		//}
	//},

	//each browser's shrunken in the beginning so we 
	//'blow up' the one we want to display
	function blowUp() {
		var positionPt,
			fill, draw,
			j = 0,

			//angle
			a = Math.PI/120,
			//scalar for growing size
			s = 1.2589;

		positionPt = function(x, y, z, i3) { 
				this.rotated[i3] =  (x * Math.cos(a)
						   			+ z * -Math.sin(a)) * s;

				this.rotated[i3+1] = y * s;

				this.rotated[i3+2] = (x * Math.sin(a) 
									+ z * Math.cos(a)) * s;
		
		}.bind(this);

		fill = _getFillFn(positionPt).bind(this);

		draw = function() { 
			fill();	
			j++;
			this.id = raf(draw);
			(j === 20) && (caf(this.id), this.twirl());

		}.bind(this);

		ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 
		this.r = 0.5;
		this.id = raf(draw);
	}

	//twirl browser after blowing it up
	function twirl() {
		var positionPt, 
			fill, draw,
			j = 0,

			//angle	
			a;

		positionPt = function(x, y, z, i3) { 

			a = Math.PI/480 
				+ (0.025 * (j/1000))
				+ (0.0025 - 0.0025*Math.abs(y/180)) 
				+ (0.0025 - 0.0025*Math.abs(x/180));


			this.rotated[i3] =  x * Math.cos(a)
					   			+ z * -Math.sin(a);
						
			this.rotated[i3+2] = x * Math.sin(a) 
								 + z * Math.cos(a);
		
		}.bind(this);

		fill = _getFillFn(positionPt).bind(this);

		draw = function() { 
			fill();

			j = (j + 1) % 1000;
			this.id = raf(draw);

		}.bind(this);

		ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 
		this.r = 3;
		this.id = raf(draw);
	}

	//shrink current browser and blowup next one
	function shrink(next) {
		var positionPt, 
			fill, draw,

			a,
			//a chunk of the rotation angle
			base = Math.PI/240, 
			//scalar for distance from origin to point
			s = 1,
			j = 0;


		positionPt = function(x, y, z, i3) { 
			a = base
				+ (0.015 * (j/1000))
				+ (0.0025 - 0.0025*Math.abs(y/180)) 
				+ (0.0025 - 0.0025*Math.abs(x/180));

			this.rotated[i3] =  (x * Math.cos(a)
					   + z * -Math.sin(a)) * s;

			this.rotated[i3+1] = y * s;

			this.rotated[i3+2] = (x * Math.sin(a) 
						+ z * Math.cos(a)) * s;
		}.bind(this);

		fill = _getFillFn(positionPt).bind(this);

		draw = function() { 
			fill();
			
			j++;
			this.id = raf(draw);

			//smudge and shrink w/ faster spin
			if (j === 60) {
				ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 
				s = 0.7943;
				base = Math.PI/60;
				this.r = 1;
			}

			//on to the next one
			if (j === 80) {
				this.resetPts();
				next.blowUp();
				caf(this.id);
			}
		}.bind(this);


		ctx.fillStyle = "rgba(16, 16, 32, 0.1)"; 
		caf(this.id);
		this.r = 3;
		this.id = raf(draw);
	}

	//blows up the browser to the right and ends the animation
	function explode() {
		var positionPt, 
			fill, draw,
			j = 0,
				
			originX = -600;

		positionPt = function(x, y, z, i3) { 
			this.rotated[i3] = (x + (x - originX)/10) * 1.3;
			this.rotated[i3+1] = (y + y/10) * 1.3;
			this.rotated[i3+2] = 0;
		}.bind(this);

		fill = _getFillFn(positionPt).bind(this);

		draw = function() { 
			fill();
			j++;
			this.id = raf(draw);

			if (j === 30) {
				caf(this.id);
				this.resetPts();
			} 
		}.bind(this);

		ctx.fillStyle = "rgba(16, 16, 32, 0.1)"; 
		caf(this.id);
		this.id = raf(draw);
	}

	//pauses animation
	function stop() {
		caf(this.id);			  
	}

	/****/

	function _drawPt(x, y, z, color, r) { 
		var scale = 1000/(z + 1000);

		ctx.strokeStyle = color;
		ctx.beginPath();

		ctx.arc(x*scale + canvas.width/2.5,
				y*scale + canvas.height/2,
				r, 0, Math.PI*2);

		ctx.stroke();
	}

	function _getFillFn(pos) { 
		var i, i3,
			pts, leng, colors,
			x, y, z;

		return function() { 

			pts = this.rotated;
			leng = pts.length/3;
			colors = this.colors;

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for (i = 0 ; i < leng; i++) { 
					i3 = i*3;
					x = pts[i3];
					y = pts[i3+1];
					z = pts[i3+2];

					pos(x, y, z, i3);

				_drawPt(pts[i3], 
						pts[i3+1], 
						pts[i3+2], 
						colors[i],
						this.r);
			}
		}
	} 
})();

	

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
 
		//image width and height
		w, h,
		leng,

		//colors: red, green, blue purple, yellow, teal, none
		color = 'r',
		colors = 'rgbpytn';
	
	//load image
	var img = new Image();
		img.src = 'img/portrait.jpg';
		img.onload = handleLoad;


	//save image data
	function handleLoad() {

		hCtx.drawImage(img, 0, 0, hidden.width, hidden.height);

		//imgData = imgData2 = hCtx.getImageData(0, 0, hidden.width, hidden.height);
		//d = d2 = imgData.data,

		imgData = hCtx.getImageData(0, 0, hidden.width, hidden.height);
		d = imgData.data;

		w = imgData.width;
		h = imgData.height;
		leng = d.length;
	}



	/*
	 * Public API
	 *
	 */

	function init() {
		_renderOriginal();
		id = setTimeout(unGlitch, 1000);
	}

	function stop() {
		clearTimeout(id);
	}

	function adjust() { 
		rX = canvas2.width/1.8;
		rY = canvas2.height/3;
		buffer.width = canvas2.width;
		buffer.height = canvas2.height;
	}

	/****/





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
				(filter(d, i)) ? applyColor(d, i) : applyColor2(d,i);	
			}
		}
		else {
			f = function(d, i) { 
				(filter(d, i)) && applyColor(d, i);	
			}
		}

		return f;	
	}

	//create function that executes a frame of glitch
	function _getGlitch(divider, coloringF, render) {
		return divider.bind(null, coloringF, render);
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
		var x = _rand(0, w),
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
			//shift right for even blocks, left for odd blocks
			cX = ( Math.round(i / hInc) % 2 === 0) ? rX + sInc : rX - sInc; 

			bCtx.putImageData(imgData, 
							  cX, rY,
							  0, i,
							  w, hInc);
		}

		ctx2.drawImage(buffer, 0, 0);
	}

	/*
	 * filtering functions
	 */
	function _getFilter(f) { 
		return function(d, i, n) { 
			return f(d, i, n);
		}	
	}

	var _isBrighterThan = _getFilter(function(d, i, n) { 
		return (d[i] + d[i+1] + d[i+2])/3 > n;
	});

	var _isDarkerThan = _getFilter(function(d, i, n) { 
		return (d[i] + d[i+1] + d[i+2])/3 < n;
	});

	var _isRedderThan = _getFilter(function(d, i, n) { 
		return d[i] > n;
	});

	var _isLessRedThan = _getFilter(function(d, i, n) { 
		return d[i] < n;
	})

	var _isGreenerThan = _getFilter(function(d, i, n) { 
			return d[i+1] > n;
		});

	var _isLessGreenThan = _getFilter(function(d, i, n) { 
			return d[i+1] < n;
		});

	var _isBluerThan = _getFilter(function(d, i, n) { 
			return d[i+2] > n;
		});

	var _isLessBlueThan = _getFilter(function(d, i, n) { 
			return d[i+2] < n;
		});

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

	function _alpha(d, i, a) {
		d[i + 3] = a;
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
		var i;

		for (i = 0 ; i < leng ; i+=4 ) {
			coloringF(d, i);
		}

		render(imgData);
	}

	/****/

	function _rand(lo, hi) {
		return Math.round( Math.random() * (hi - lo)  + lo );
	}

	/**
	 * setup glitch  
	 */

		var id,
		//time
		t = 0,
		time = 0;


		var filter = function(d, i) {
			var result = false;

			(time % 5 === 0) && (result = _isDarkerThan(d, i, _rand(50, 200)) );
			(time % 5 === 1) && (result = _isRedderThan(d, i, _rand(100, 200)) );
			(time % 5 === 2) && (result = _isLessRedThan(d, i, _rand(100, 200)) );
			(time % 5 === 3) && (result = _isLessBlueThan(d, i, _rand(100, 200)) );
			(time % 5 === 4) && (result = _isBrighterThan(d, i, _rand(100, 200)) );

			return result;
		}

		var color1 = function(d, i) {
			var r = _rand(20, 80);

			(Math.random() > 0.8) ? _alpha(d, i, r) : (_invert(d, i), _alpha(d, i, r));
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

			if (Math.random() > 0.7) {
				_renderChunk(d);
			}
			else {
				_renderShifted(d, h/_rand(10, 50), _rand(1, 5));
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
			id = (r > 0.1) ? setTimeout(runGlitch, t) : setTimeout(unGlitch, t);
		}

		var unGlitch = function() {
			var r = Math.random();

			ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

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
		stop: stop,
		adjust: adjust
	}
})();

//WORK REMIX *****

var WorkBlob = (function() {

//var originX = canvas2.width/2,
	//originY = canvas2.height/2,

//var originX = canvas2.width/1.8,
var originX = canvas2.width/1.75,
	originY = canvas2.height/2,

	//original radius
	//origR = 120,
	origR = 120,
	//changing radius
	r = origR,

	//left bound
	left = originX - origR*2,
	//right bound
	right = originX + origR*2,

	//top bound
	start = originY - 250,
	//bottom bound
	end = originY + 300,

	//y increment for bezier pts
	incr = (end - start),

	//angle for oscillation
	angle = 0;

	var colors = ['rgba(230, 180, 255, 0.5)',
				  'rgba(130, 255, 130, 0.5)',
				  'rgba(255, 255, 80, 0.5)',
				  'rgba(130, 130, 255, 0.5)',
				  'rgba(255, 150, 30, 0.5)'],
			 
	//color index
	i = 0;



	//to update display
	var prevSelected, newSelected;
	
	function _updateColorIndex() {
		var j = Math.round( Math.random() * (colors.length - 1) );

		while (j === i) {
			j = Math.round( Math.random() * (colors.length - 1) );
		}

		i = j;
	}


	function draw() {
		//where in the period 
		var p = (Math.cos(angle)+1)/2;

		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		ctx2.beginPath();
		ctx2.moveTo(left, start);

		//left side of blob
		ctx2.bezierCurveTo( left - r, start + incr/3, 
							left + r, start + incr*2/3, 
							left, start + incr 
							);


		//curve to right side

		//from
		//ctx2.bezierCurveTo( originX  - 3*r, 
							//end + 1.2*r, 
							//originX + r, 
							//end + r, 
							//right, end
							//);

		//to
		//ctx2.bezierCurveTo( originX  + r, 
							//end - r, 
							//originX - 3*r, 
							//end - 1.2*r, 
							//right, end
							//);

		ctx2.bezierCurveTo( originX  + (-4*p + 1) * r , 

							end + (2.2*p - 1) * r , 

							originX + (4*p - 3) * r, 

							end + (2.2*p - 1.2) * r , 

							right, end
							);

		//right side of blob
		ctx2.bezierCurveTo( right + r, end - incr/3, 
							right - r, end - incr*2/3, 
							right, end - incr 
							);

		//bring it back

		//from
		//ctx2.bezierCurveTo( originX + 3*r, 
							//start - 1.2*r, 
							//originX - r, 
							//start - r, 
							//left, start
							//);

		//to
		//ctx2.bezierCurveTo( originX - r, 
							//start + r, 
							//originX + 3*r, 
							//start + 1.2*r, 
							//left, start
							//);

		ctx2.bezierCurveTo( originX  + (4*p - 1) * r , 

							start + (-2.2*p + 1) * r , 

							originX + (-4*p + 3) * r, 

							start + (-2.2*p + 1.2) * r , 

							left, start
							);

		ctx2.closePath();
		ctx2.fillStyle = colors[i];

		ctx2.fill();
	}

	function leftToRight(selected) {
		if (angle >= 0 && 

			angle !== Math.PI/2) {

			angle -= Math.PI/40 % (Math.PI*2);
			r = origR*Math.cos(angle);
			draw();

			raf(leftToRight.bind(this, selected));

		}	
		else if (angle === Math.PI/2) {

			prevSelected.className = 'project';
			newSelected.className += ' project-selected';


			_updateColorIndex();
			draw();

			angle -= Math.PI/40 % (Math.PI*2);
			r = origR*Math.cos(angle);

			raf(leftToRight);
		}
	}

	function rightToLeft() {
		if (angle <= Math.PI && 
			angle !== Math.PI/2) {

			angle += Math.PI/40 % (Math.PI*2);
			r = origR*Math.cos(angle);
			draw();

			raf(rightToLeft);
		}	

		else if (angle === Math.PI/2) {

			prevSelected.className = 'project';
			newSelected.className += ' project-selected';


			_updateColorIndex();
			draw();

			angle += Math.PI/40 % (Math.PI*2);
			r = origR*Math.cos(angle);

			raf(rightToLeft);
		}
	}

	//flex the blob and update display
	function flexDisplay(p, n) {
		prevSelected = p;
		newSelected = n;

		//decide direction
		if (angle > Math.PI) {

			angle = Math.PI;
			leftToRight();	

		}	
		else {

			angle = 0;
			rightToLeft();	

		}
	} 

	function fadeIn(id) {
		var inc = 0.5/40, a = 0,
			selected = document.getElementById(id);

		Disco.get('workMenu').selected = selected;

		angle = 0;

		function fill() {

			angle += Math.PI/40;
			a += inc;
			ctx2.fillStyle = 'rgba(230, 180, 255, ' + a + ')'; 
			r = origR*Math.cos(angle);
			draw();

			if (angle === Math.PI/2) {
				selected.className += ' project-selected';
			}

			if (angle <= Math.PI) {
				raf(fill);
			}
		}

		raf(fill);
	}

	function adjust() { 
		originX = canvas2.width/1.75;
		originY = canvas2.height/2;
		left = originX - origR*2;
		right = originX + origR*2;
		start = originY - 250;
		end = originY + 300;
		incr = (end - start);

		((/work/).test(window.location.hash)) && draw();
	}

	return {
		fadeIn: fadeIn,
		flexDisplay: flexDisplay,
		adjust: adjust
	}
})();

Disco.add('ball', {

	el: $('#disco-ball'),

	render: function() {
		var el = this.el;

		var init1 = function() {
			var promise = Aplus();

			el.removeClass('disco-hidden'); 

			setTimeout(function() {
				el.addClass('disco-init1')
				promise.timeout(500);
			}, 100);

			return promise;
		}

		var init2 = function() {
			var promise = Aplus();

			el.addClass('disco-init2')
			promise.timeout(1000);

			return promise;
		}

		var init3 = function() {
			var promise = Aplus();

			el.addClass('disco-init3')
			promise.timeout(500);

			return promise;
		}

		var init4 = function() {
			//el.addClass('disco-init4')
			el.attr('class', 'disco-solid disco-init4')
		}

		//second visit and on gets partial disco treatment
		if (sessionStorage.getItem('visited')) {
			init4();
		}
		//first time gets full disco treatment
		else {
			init1()
				.then(init2)
				.then(init3)
				.then(init4)
		}
	}
});

Disco.add('browsers', {

	i: 0, 

	id: undefined,

	browsers: [],	

	init: function(data) {
			this.browsers.push(Browser(data.ie.pts, data.ie.colors));
			this.browsers.push(Browser(data.firefox.pts, data.firefox.colors));
			this.browsers.push(Browser(data.chrome.pts, data.chrome.colors));
			this.browsers.push(Browser(data.opera.pts, data.opera.colors));
	},

	render: function() {
		this.browsers[ this.i ].blowUp();
		this.id = setInterval(this._toggle.bind(this),
							  30000)
	},

	explode: function() {
		clearInterval(this.id);
		this.browsers[this.i].explode();
	},

	pause: function() {
		this.browsers[ this.i ].stop();			   
		clearInterval(this.id);
	},

	cont: function() {
		this.browsers[ this.i ].twirl();
		this.id = setInterval(this._toggle.bind(this),
							  30000)
	},

	_shrink: function() {
		var browsers = this.browsers,
			i = this.i;

		browsers[i].shrink(browsers[(i+1) % 4]);		
	},

	_increment: function() {
		this.i = (this.i + 1) % 4;
	},

	_toggle: function() {
		this._shrink();			

		//delay increment so that explode
		//doesn't conlict with shrink
		setTimeout(this._increment.bind(this), 1000)

	},
})

Disco.add('contact', {

	el: $('#contact'),

	events: {
		'mouseenter': {
			'#contact a': 'makeSukFlex'	
		},
		'mouseleave': {
			'#contact a': 'makeSukSleep'	
		}
	},

	render: function() {
		this.el.attr('class', 'contact-loading');
	},

	makeSukSleep: function(e) {
		var hash = window.location.hash,
			suk = Disco.get('suk');
					 
		if (hash.search(/work|resume/) > -1) {
			suk.setState('professional');					 
		}
		else if (hash.search(/about|codepen/) > -1) {
			suk.setState('whoa');					 
		}
		else {
			suk.setState('sleepy');					 
		}
	},

	makeSukFlex: function(e) {
		Disco.get('suk').setState('social');					 
	}

});

Disco.add('nav', {

	el: $('nav'),

	links: $('nav li'),

	back: $('#back'),

	events: {

		'click': 'handleClick',

		'mouseenter': {
			'nav li a': 'wakeSuk'
		},

		'mouseleave':  {
			'nav li a': 'makeSukSleep'
		}

	},

	menuHidden: false,

	render: function() {
		var nav = this.el;

		nav.attr("class", "nav-loading");	

		setTimeout(nav.attr.bind(nav, 'class', ''), 500);
	},

	showBackBtn: function() {
		//hide back button
		this.back.attr('class', '');
	},

	showLinks: function() {
		this.menuHidden = false;

		this.links.attr('class', '');
		//hide back button
		this.back.attr('class', 'back-hidden');

	},

	hideLinks: function() {
		this.menuHidden = true;

		this.links.attr('class', 'link-hidden');
		//hide back button
		this.back.attr('class', '');

	},

	hideLinksExcept: function(exception) {
		var back = this.back,
			expLi = exception.parentNode;

		this.menuHidden = true;

		this.links.each(function updateLinks(index) {
			//hide other links
			if (this !== expLi) {
				this.setAttribute('class', 'link-hidden');
			}
			else {
				//enlarge selected link text
				setTimeout(function() {
					back.attr('class', '');

					//select link
					this.setAttribute('class', 'link-selected');

				}.bind(this), 400);
			}

		})
	},

	handleClick: function(e) {
		var	$displays = $('#display > div'),
			target = e.target;

		//hit back button
		if (target.id === "back") {
			
			//nav.showLinks();
			this.view.showLinks();

			//hide displays
			//$displays.attr('class', '');

			//empty hash
			window.location.hash = '';

			//Disco.get('browsers').render();

			//init browser display
			//BrowserDisplay.init(10000);
		}
	},

	wakeSuk: function(e) {
		Disco.get('suk').setState('hover');				 
	},

	makeSukSleep: function(e) {
		if (!this.view.menuHidden) {
			Disco.get('suk').setState('sleepy');				 
		}
	}

});

Disco.add('resumeDisplay', {
	$el: $('#resume-display'),

	tools: [ 
			 ['vim', 'github'],
			 ['javascript', 'html5', 'css3', 'sass'],
			 ['angular', 'react', 'backbone', 'jquery', 'responsive design',
			  'node', 'mongo', 'bootstrap', 'foundation',
			  'svg', 'php'],
			['photoshop', 'illustrator', 'indesign'],
			['korea', 'japan']
	],

	populate: function() {
		this.tools.forEach(appendToolSet);

		function appendToolSet(toolset, i) { 
			var $ul = $('.resume-display-' + i + ' ul'); 	
			toolset.forEach(appendTool, $ul);
		}


		function appendTool(tool) { 
			var $li = $("<li></li>"),						   
				 $a = $("<a class='sprite' target='_blank'" +
						"title='more about " + tool + "'" +  
						"></a>");

			sprites.applyImgToEl(tool, $a);
			$li.append($a);
			this.append($li);
		}
	}, 

	render: function() {
		this.populate();
	},

	init: function() {
		var $display = this.$el;

		$display.attr('class', 'display-selected');
		$display.addClass('resume-init');

		setTimeout(function() {
			$display.removeClass('resume-init');	
			$display.addClass('resume-loaded');	
		}, 2000)
	},

})

Disco.add('suk', {
	$el: $('#suk'),			

	render: function() {
		//unhide suk
		this.setState("sleepy");	
		this.$el.removeClass('suk-hidden');
	},

	setState: function(state) {
		sprites.applyImgToEl(state, this.$el);	
	}

});

Disco.add('workDisplay', {

	$container: $('#display'),

	$el: undefined,

	render: function() {
		this.$el = $(templates.getTemplate('work_display'));
			
		this.$container.append(this.$el);
	},

	init: function() {
		this.$el.attr('class', 'display-selected');

		WorkBlob.fadeIn('wordpress-0');
	} 
})

Disco.add('workMenu', {

	container: $('#content'),

	content: undefined,

	el: undefined,

	selected: undefined,

	events: {
		'click': 'display'
	},

	render: function() {
		this.el = $(templates.getTemplate('work_menu'));
		this.container.append(this.el);

		this.content = $('#work');
	},

	init: function() {
		
		 if (this.selected) {
		 	this.selected.className = 'project'; 
			this.selected = undefined;
		 }

		 this.content.addClass('content-selected');
	},

	display: function(e) {
		var target = e.target;

		//update project display
		if (e.target.nodeName === 'LI') {
			var id = target.getAttribute('data-cat') + '-' 
					 + target.getAttribute('data-key'),
				
				prevSelected;

				prevSelected = this.view.selected;
				//prevSelected.className = 'project'; 

		
			this.view.selected = document.getElementById(id);	

			WorkBlob.flexDisplay(prevSelected, this.view.selected);
		}
	}

})

Disco.router({
	//home
	'': function(e) {
		var $content = $('.content-selected'),
			$display = $('.display-selected');

		Disco.get('nav').showLinks();
		Disco.get('suk').setState("sleepy");

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		//stop portrait if returning from about
		(e && e.oldURL.search(/about/) > -1) && Portrait.stop();

		//hide content and display of previous page
		(typeof $content !== "undefined") && $content.attr('class', '');
		(typeof $display !== "undefined") && $display.attr('class', '');

		setTimeout(Disco.get('browsers').render, 300);
	},

	'about': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#about']")[0] );

		document.getElementById('about')
				 .className = 'content-selected';

		setTimeout(function start() {
			Disco.get('suk').setState("whoa");
			Disco.get('browsers').explode();
			Portrait.init();
		}, 400);
	},

	'resume': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#resume']")[0] );

		document.getElementById('resume')
				 .className = 'content-selected';

		setTimeout(function() {
			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			Disco.get('resumeDisplay').init();
		}, 400);
	},

	'work': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#work']")[0] );

		Disco.get('workMenu').init();

		setTimeout(function() {

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			Disco.get('workDisplay').init();
		}, 400);

	}
}, 

function windowEvents() {
	var browsers = Disco.get('browsers');	

	if (!sessionStorage.getItem('visited')) {
		sessionStorage.setItem('visited', true);
		window.location.hash = '';
	}

	//need to pause display when on a different tab
	//otherwise it gets messed up
	window.addEventListener('blur', function() {
		window.location.hash.length === 0 &&
		browsers.pause();
	})

	window.addEventListener('focus', function() {
		window.location.hash.length === 0 &&
		browsers.cont();
	})

	/*
	 * PUT WINDOW RESIZE RESPONSIVE STUFF HERE
	 *
	 */
	window.addEventListener('resize', function() { 
		canvas.width = canvas2.width = window.innerWidth;
		canvas.height = canvas2.height = window.innerHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
		Portrait.adjust();
		WorkBlob.adjust();
	})
})

var loadInterface = function() {
	var delays;

	if (sessionStorage.getItem('visited')) {
		delays = [0,
				 0,
				 0,
				 0,
				 0,
				 400,
				 0];
	}
	else {
		delays = [0,
				 0,
				 0,
				 0,
				 2200,
				 400,
				 0];
	}

	Disco.render(['workMenu',
				  'workDisplay',
				  'resumeDisplay',
				  'ball',
				  'suk',
				  'nav', 
				  'contact'],

				  delays);
}

var startDisco = function() {
	
	//load sprites
	var init1 = function() {
		var promise = Aplus();

		$.getJSON('disco3030sprite.json', function(data) {
			sprites.setSprites(data);
			promise.fulfill();
		});

		return promise;
	}

	init1()
		//load templates
		.then(function init2() {
			var promise = Aplus();

			templates.loadTemplates(promise);

			return promise;
		})
		//compile templates with data
		.then(function init2() {
			var promise = Aplus();

			$.getJSON('work.json', function(data) {
				templates.compileTemplates(data);
				promise.fulfill();
			});

			return promise;
		})
		//prepare browser display data
		.then(function init3() {
			var promise = Aplus();

			$.getJSON('browsers.json', function handleData(data) {
				Disco.get('browsers').init(data);	
				promise.fulfill();
			});	

			return promise;
		})
		//load interface
		.then(loadInterface);
}



document.addEventListener('DOMContentLoaded', startDisco); 
