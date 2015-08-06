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
