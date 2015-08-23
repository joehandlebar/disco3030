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

	
