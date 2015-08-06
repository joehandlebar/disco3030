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

		if (routes[hash]) {
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

	this.components[name] = obj;

	origRender = obj.render.bind(obj);

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
	if (this.components[name]) {
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

	return {
		setSprites: setSprites,
		getSprite: getSprite
	}

})();

var templates = (function() {
	var _templates = { 'work_menu':  { type: 'html',
								  	 html: ''},
					  'work_display':  { type: 'html',
								  	     html: ''}
					},
		tmp;


	//takes a promise to fulfill once templates are loaded
	function loadTemplates(promise) {
		var leng = Object.keys(_templates).length, i = 0;

		for (tmp in _templates) {
			(function(tmp){
				$.get('view/' + tmp + '.' + _templates[tmp].type, 
					function(data) {
						_templates[tmp].html = data;

						i++;

						if (i === leng) {
							promise.fulfill();
						}
					})
			}(tmp))
		}
	}

	//compiles templates with given data
	function compileTemplates(data) {
		var menuTmp = Handlebars.compile(_templates['work_menu'].html),
			displayTmp = Handlebars.compile(_templates['work_display'].html);

		//inject sprite data 
		var sp;
		data.apps.forEach(function(app) {
			app.img = sprites.getSprite(app.img); 

			app.tools = app.tools.map(function(tool) {
				sp = sprites.getSprite(tool.toLowerCase());

				//we shouldnt need this eventually
				sp["name"] = tool;

				return sp;	
			})
		});

		data.wordpress.forEach(function(w) {
			w.img = sprites.getSprite(w.img); 
			
			w.tools = w.tools.map(function(tool) {
				sp = sprites.getSprite(tool.toLowerCase());

				//we shouldnt need this eventually
				sp["name"] = tool;

				return sp;	
			})
		});

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

	return {
		loadTemplates: loadTemplates,
		compileTemplates: compileTemplates,
		getTemplate: getTemplate
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
	//the original set of points
	this.pts = pts;

	//the corresponding colors 
	this.colors = colors;

	//a separate array to hold the animated data
	this.rotated = [];

	//copy this.pts to this.rotated
	this.resetPts();


	//interval id
	this.id = undefined;


	//var img = new Image();

	//img.src = src;
	//img.onload = this.handleLoad.bind(this, img);
}


Browser.prototype = {
	
	resetPts: function() {
		var i, leng = this.pts.length;
	
		for ( i = 0 ; i < leng ; i++ ) {
			this.rotated[i] = this.pts[i];
		}
	},

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
	blowUp: function () {
		var	leng = this.rotated.length/3,
			pts = this.rotated,
			colors = this.colors,
			that = this,
			
			i, i3, 
			x, y, z, 
			grow = 1.2589,
			a,
			scale,
			j = 0;

		//this.id = setInterval(draw, 1000/this.frames);
		ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 

		this.id = raf(draw);

		function draw() {
			ctx.fillRect(0, 0, canvas.width, canvas.height);

		
			for ( i = 0; i < leng; i++ ) {
				i3 = i*3;
				x = pts[i3];
				y = pts[i3+1];
				z = pts[i3+2];

				a = Math.PI/120; 

				pts[i3] =  (x * Math.cos(a)
						   + z * -Math.sin(a)) * grow;

				pts[i3+1] = y * grow;

				pts[i3+2] = (x * Math.sin(a) 
							+ z * Math.cos(a)) * grow;

				scale = 1000/(pts[i3+2] + 1000); 

				ctx.strokeStyle = colors[i];
				ctx.beginPath();

				ctx.arc(pts[i3]*scale + canvas.width/2.5,
						pts[i3+1]*scale + canvas.height/2,
						1, 0, Math.PI*2);

				ctx.stroke();
			}
			
			j++;
				
			that.id = raf(draw);

			if (j === 20) {
				caf(that.id);
				that.twirl();	
			}
		}
	},

	twirl: function() {
		var	leng = this.rotated.length/3,
			pts = this.rotated,
			colors = this.colors,
			that = this,

			i, i3, 
			x, y, z, 
			a,
			scale,
			j = 0;

		ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 

		this.id = raf(draw);

		function draw() {

			ctx.fillRect(0, 0, canvas.width, canvas.height);

		
			for ( i = 0; i < leng; i++ ) {
				i3 = i*3;
				x = pts[i3];
				y = pts[i3+1];
				z = pts[i3+2];

				a = Math.PI/480 
					+ (0.025 * (j/1000))
					+ (0.0025 - 0.0025*Math.abs(y/180)) 
					+ (0.0025 - 0.0025*Math.abs(x/180));


				pts[i3] =  x * Math.cos(a)
						   + z * -Math.sin(a);
							
				pts[i3+2] = x * Math.sin(a) 
							+ z * Math.cos(a);

				scale = 1000/(pts[i3+2] + 1000); 

				ctx.strokeStyle = colors[i];
				ctx.beginPath();

				ctx.arc(pts[i3]*scale + canvas.width/2.5,
						pts[i3+1]*scale + canvas.height/2,
						3, 0, Math.PI*2);

				ctx.stroke();
			}

			j = (j + 1) % 1000;
			that.id = raf(draw);
		}
	},

	//shrink current browser and blowup next one
	shrink: function(next) {
		var	leng = this.rotated.length/3,
			pts = this.rotated,
			colors = this.colors,
			that = this,

			i, i3, 
			x, y, z,
			a,
			scale,
			j = 0,
		
			//a chunk of the rotation angle
			base = Math.PI/240, 
		
			//scalar for distance from origin to point
			shrink = 1, 
		
			//radius for each circle
			r = 3;


		ctx.fillStyle = "rgba(16, 16, 32, 0.1)"; 

		caf(this.id);
		this.id = raf(draw);

		function draw() {
			ctx.fillRect(0, 0, canvas.width, canvas.height);

		
			for ( i = 0; i < leng; i++ ) {
				i3 = i*3;
				x = pts[i3];
				y = pts[i3+1];
				z = pts[i3+2];

				a = base
					+ (0.015 * (j/1000))
					+ (0.0025 - 0.0025*Math.abs(y/180)) 
					+ (0.0025 - 0.0025*Math.abs(x/180));

				pts[i3] =  (x * Math.cos(a)
						   + z * -Math.sin(a)) * shrink;

				pts[i3+1] = y * shrink;

				pts[i3+2] = (x * Math.sin(a) 
							+ z * Math.cos(a)) * shrink;

				scale = 1000/(pts[i3+2] + 1000); 

				ctx.strokeStyle = colors[i];
				ctx.beginPath();

				ctx.arc(pts[i3]*scale + canvas.width/2.5,
						pts[i3+1]*scale + canvas.height/2,
						r, 0, Math.PI*2);

				ctx.stroke();
			}
			
			j++;

			that.id = raf(draw);

			//smudge and shrink w/ faster spin
			if (j === 60) {
				ctx.fillStyle = "rgba(16, 16, 32, 0.8)"; 
				shrink = 0.7943;
				base = Math.PI/60;
				r = 1;
			}

			//on to the next one
			if (j === 80) {
				that.resetPts();
				next.blowUp();
				caf(that.id);
			}
		}
	},

	//blows up the browser to the right and ends the animation
	explode: function() {

		var	leng = this.rotated.length/3,
			pts = this.rotated,
			colors = this.colors,
			that = this,

			i, i3, 
			x, y, z,
		
			originX = -600,
			scale,
			j = 0;

		ctx.fillStyle = "rgba(16, 16, 32, 0.1)"; 

		caf(this.id);
		this.id = raf(draw);

		function draw() {
			ctx.fillRect(0, 0, canvas.width, canvas.height);		

			for ( i = 0; i < leng; i++ ) {
				i3 = i*3;
				x = pts[i3];
				y = pts[i3+1];
				z = pts[i3+2];

				pts[i3] = (x + (x - originX)/10) * 1.3;
				pts[i3+1] = (y + y/10) * 1.3;

				pts[i3+2] = 0;

				scale = 1000/(pts[i3+2] + 1000); 

				ctx.strokeStyle = colors[i];
				ctx.beginPath();


				ctx.arc(pts[i3]*scale + canvas.width/2.5,
						pts[i3+1]*scale + canvas.height/2,
						3, 0, Math.PI*2);

				ctx.stroke();
			}
			
			j++;

			that.id = raf(draw);

			if (j === 30) {
				caf(that.id);
				that.resetPts();
			} 
		} 
	},

	//ends the animation, suspending the last frame 
	stop: function() {
		caf(this.id);			  
	}
} 

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

//WORK REMIX *****

var WorkBlob = (function() {

//var originX = canvas2.width/2,
	//originY = canvas2.height/2,

var originX = canvas2.width/1.8,
	originY = canvas2.height/2,

	//original radius
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
			  
	i = 0;

	ctx2.fillStyle = colors[i];


	//to update display
	var prevSelected, newSelected;
	
	function _updateColor() {
		var j = Math.round( Math.random() * (colors.length - 1) );

		while (j === i) {
			j = Math.round( Math.random() * (colors.length - 1) );
		}

		i = j;
		ctx2.fillStyle = colors[i];
	}


	function draw() {
		//where in the period period
		var p = (Math.cos(angle)+1)/2;

		ctx2.clearRect(0, 0,
				canvas2.width, canvas2.height);
		

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


			_updateColor();
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


			_updateColor();
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

	return {
		fadeIn: fadeIn,
		flexDisplay: flexDisplay
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
			el.addClass('disco-init4')
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

	//do we stil need this???
	//rendered: false,

	browsers: [],	

	init: function(data) {
			this.browsers.push(new Browser(data.ie.pts, data.ie.colors));
			this.browsers.push(new Browser(data.firefox.pts, data.firefox.colors));
			this.browsers.push(new Browser(data.chrome.pts, data.chrome.colors));
			this.browsers.push(new Browser(data.opera.pts, data.opera.colors));
	},

	render: function() {
		this.browsers[ this.i ].blowUp();
		this.id = setInterval(this._toggle.bind(this),
							  30000)

		//do we stil need this???
		setTimeout(function() {
			this.rendered = true;
		}.bind(this), 1000)
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

	//do we still need this?
	renderExplode: function() {
		this.browsers[ this.i ].blowUp();

		setTimeout(function() {
			this.browsers[ this.i ].explode();
		}.bind(this), 800)
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
		setTimeout(function() {

			this._increment();

		}.bind(this), 1000)

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
		var that = this.el;

		setTimeout(function() {
			that.attr("class", "nav-loading");	

			//too much to have it load every time we go back to the menu
			setTimeout(function() {
				that.attr('class', '');
			}, 500);
		}, 0)
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

Disco.add('suk', {

	el: $('#suk'),			

	states: {},

	render: function() {

		this.states = {
			"sleepy": sprites.getSprite("sleepy"),	
			"hover": sprites.getSprite("hover"),	
			"social": sprites.getSprite("social"),	
			"whoa": sprites.getSprite("whoa"),	
			"professional": sprites.getSprite("professional")	
		}

		this.setState("sleepy");	

		this.el.removeClass('suk-hidden');
	},

	setState: function(state) {
		var d = this.states[state];					 

		this.el.css({ 'background-position': d.x + 'px ' + d.y + 'px',
					  'width': d.width,
					  'height': d.height });
	}

});

Disco.add('workDisplay', {

	container: $('#display'),

	el: undefined,

	init: WorkBlob.fadeIn,

	render: function() {
		this.el = $(templates.getTemplate('work_display'));
			
		this.container.append(this.el);
	}
	
})

Disco.add('workMenu', {

	container: $('#content'),

	el: undefined,

	selected: undefined,

	events: {
		'click': 'display'
	},

	render: function() {

		this.el = $(templates.getTemplate('work_menu'));

		this.container.append(this.el);
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
		var content = $('.content-selected'),
			display = $('.display-selected');

		Disco.get('nav').showLinks();
		Disco.get('suk').setState("sleepy");

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		if (e) {
			if (e.oldURL.search(/about/) > -1) {
				Portrait.stop();	
			}
		}

		//hide content and display of previous page
		if (content) {
			content.attr('class', '');
		}

		if (display) {
			display.attr('class', '');
		}

		setTimeout(function() {
			Disco.get('browsers').render();
		}, 100)
	},

	'about': function() {
		var nav = Disco.get('nav'), 
			content, display;

		
		nav.hideLinksExcept( $("a[href='#about']")[0] );


		content = document.getElementById('about');

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("whoa");
			Disco.get('browsers').explode();
			Portrait.init();

		}, 400);
	},

	'resume': function() {
		var nav = Disco.get('nav'), 
			content, display;

		
		nav.hideLinksExcept( $("a[href='#resume']")[0] );


		content = document.getElementById('resume');
		display = document.getElementById('resume-display');

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			display.className = 'display-selected';
		}, 400);
	},

	'work': function() {
		var nav = Disco.get('nav'), 
			selected = Disco.get('workMenu').selected,
			content, display;

		
		nav.hideLinksExcept( $("a[href='#work']")[0] );


		content = document.getElementById('work');
		display = document.getElementById('work-display');

		if (selected) {
			selected.className = "project";
			Disco.get('workMenu').selected = undefined;
		}

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			display.className = 'display-selected';

			Disco.get('workDisplay').init('wordpress-0');
		}, 400);

	}
}, 

function() {
	var browsers = Disco.get('browsers');	

	if (!sessionStorage.getItem('visited')) {
		sessionStorage.setItem('visited', true);
		window.location.hash = '';
	}

	//need to pause display when on a different tab
	//otherwise it gets messed up
	window.addEventListener('blur', function() {
		if (window.location.hash.length === 0) {
			browsers.pause();
		}
	})

	window.addEventListener('focus', function() {
		if (window.location.hash.length === 0) {
			browsers.cont(); 
		}
	})
})

var loadInterface = function() {
	var times;

	if (sessionStorage.getItem('visited')) {
		times = [0,
				 0,
				 0,
				 0,
				 400,
				 0];
	}
	else {
		times = [0,
				 0,
				 0,
				 2200,
				 400,
				 0];
	}

	Disco.render(['workMenu',
				  'workDisplay',
				  'ball',
				  'suk',
				  'nav', 
				  'contact'],

				  times);
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
