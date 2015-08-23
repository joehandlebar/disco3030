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
