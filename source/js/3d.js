var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// equations for 3d to 2d projection
//
// var points3d = {x: 100, y: 133, z: 230};
// var focalLength = 1000;
// var scale = focalLength/(point3D.z + focalLength);
//
// var point2d = {x: point3d.x*scale, 
// 				  y: point3.y*scale };
//

function _extend(obj, props) {
	for (var prop in props) {
		obj[prop] = props[prop];
	}
}

function Scene3D(canvas) {
	Matrix3D.call(this);

	this.focalLength = 1000;
	this.context = canvas.getContext('2d');
	this.sceneWidth = canvas.width;
	this.sceneHeight = canvas.height;
	this.points3D = this.m;
	this.points2D = [];
	this.numPoints = 0;

	this.items = [];
}

//delegate matrix methods
Scene3D.prototype = Object.create(Matrix3D.prototype);

_extend(Scene3D.prototype, {
	setupPoint: function(x, y, z) {
		var returnVal = this.numPoints;

		this.points2D[this.points2D.length] = 0;
		this.points2D[this.points2D.length] = 0;
		
		this.points3D[this.points3D.length] = x;
		this.points3D[this.points3D.length] = y;
		this.points3D[this.points3D.length] = z;

		this.numPoints++;

		return returnVal;
	},

	addItem: function(item) {
		this.items[this.items.length] = item;
		item.addToScene(this);
	},

	render: function() {
		var halfWidth = this.sceneWidth * 0.5,
			halfHeight = this.sceneHeight * 0.5,
			i, i3, i2, x, y, z, scale;

		for (i = 0; i < this.numPoints; i++) {
			i3 = i*3;
			i2 = i*2;
			x = this.points3D[i3];
			y = this.points3D[i3+1];
			z = this.points3D[i3+2];
			scale = this.focalLength/(z + this.focalLength);

			this.points2D[i2] = x*scale + halfWidth;
			this.points2D[i2+1] = y*scale + halfHeight;
		}

		this.context.save();
		//this.ctx.fillStyle = "rgb(0, 0, 0);";
		
		for (i = 0; i < this.items.length; i++) {
			this.items[i].render(this.context);
		}

		this.context.restore();


		return this;
	}
});

function Point3D(x, y, z) {
	this._x = x ? x : 0;
	this._y = y ? y : 0;
	this._z = z ? z : 0;
	this.myScene = null;
	this.xIdx;
	this.yIdx;
	this.zIdx;
	this.xIdx2D;
	this.yIdx2D;
}

Point3D.prototype = {
	
	setupWithScene: function(scene) {
		this.myScene = scene;

		var idx = scene.setupPoint(this._x, this._y, this._z),
			i3 = idx*3,
			i2 = idx*2;

		this.xIdx = i3;
		this.yIdx = i3 + 1;
		this.zIdx = i3 + 2;

		this.xIdx2D = i2;
		this.yIdx2D = i2 + 1;
	}
}

Object.defineProperties(Point3D.prototype, {
	sceneIdx: {
	  get: function() {
	  	   return this.myScene;
	  }
	},

	x: {
	   get: function() {
	    	return this._x;
	   },

	   set: function(val) {
		  if (this.myScene) {
			this.myScene.points3D[this.xIdx] = val;
		  }			  

		  this._x = val;
	   }
	},	

	y: {
	   get: function() {
	    	return this._y;
	   },

	   set: function(val) {
		  if (this.myScene) {
			this.myScene.points3D[this.yIdx] = val;
		  }			  

		  this._y = val;
	   }
	},	

	z: {
	   get: function() {
	    	return this._z;
	   },

	   set: function(val) {
		  if (this.myScene) {
			this.myScene.points3D[this.zIdx] = val;
		  }			  

		  this._z = val;
	   }
	},	

	x2D: {
		get: function() {
			return this.myScene.points2D[this.xIdx2D];			  
	    }			 
	}, 

	y2D: {
		get: function() {
			return this.myScene.points2D[this.yIdx2D];			  
	    }			 
	} 
});

function Line3D() {
	this.colour = "#aaa";
	this.points = [];
	this.startPoint = new Point3D();
	this.endPoint = new Point3D();
}

Line3D.prototype = {
	addToScene: function(scene) {
		var i;
		
		for (i = 0; i < this.points.length; i++) {
			this.points[i].setupWithScene(scene);
		}					
	},

	addPoint: function(point) {
		this.points[this.points.length] = point;						  
	},

	render: function(ctx) {				
		ctx.beginPath();
		ctx.strokeStyle = this.colour;

		var i;

		for (i = 0; i < this.points.length; i++) {
			ctx.lineTo(this.points[i].x2D,
					   this.points[i].y2D);
		}

		ctx.stroke();
	}
}

function Shape3D() {
	Line3D.call(this);
} 

Shape3D.prototype = Object.create(Line3D.prototype);

Shape3D.prototype.render = function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = this.colour;

		var i;

		for (i = 0; i < this.points.length; i++) {
			ctx.lineTo(this.points[i].x2D,
					   this.points[i].y2D);
		}
		//the only difference
		ctx.closePath();

		ctx.stroke();
}

var scene,
	numLinesSegments,
	data1 = [
		-100, -100, 155,
		0, -200, 155,
		100, -100, 155,
		100, 100, 155,
		-100, 100, 155
	],
	data2 = [
		-50, -50, 155,
		0, -100, 155,
		50, -50, 155
	],
	i,
	i3,
	time = 0, id;

//var m = new Matrix3D(data1);

//data = m

function onInit() {
	scene = new Scene3D(canvas);


	//var line = new Line3D();
	var shape1 = new Shape3D();
	shape1.colour = "rgb(255, 255, 0)";
	numLinesSegments = data1.length/3;

	for (i = 0; i< numLinesSegments; i++) {
		i3 = i*3;

		shape1.addPoint(new Point3D(data1[i3],
									data1[i3+1],
									data1[i3+2]));
	}

	var shape2 = new Shape3D();
	shape2.colour = "rgb(255, 255, 255)";
	numLinesSegments = data2.length/3;

	for (i = 0; i< numLinesSegments; i++) {
		i3 = i*3;

		shape2.addPoint(new Point3D(data2[i3],
									data2[i3+1],
									data2[i3+2]));
	}

	scene.addItem(shape1);
	scene.addItem(shape2);

	//scene
	//.rotateX(20)
	//.rotateZ(25)
	//.translateX(-100)

	id = setInterval(onRender, 50);
	//onRender();
}

var angle = 10;

function onRender() {
	if (time > 900000) {
		clearInterval(id);
	}

	ctx.fillStyle = "rgba(16, 16, 32, 0.05)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//scene
		//.rotateX(angle)
		//.flipX()
		//.render()
		//.translateX(5)
		//.rotateY(5)
		//.flipY()
		//.render()
		//.flipZ()
		//.render();

	//angle+= 0.15;

		// thats rly random
		//
		scene
		.scaleX(1 + Math.random() * 0.05 - 0.025)
		.scaleY(1 + Math.random() * 0.05 - 0.025)
		.flipY()
		.flipX()
		.rotateX(Math.floor(Math.random() * 30 - 15))
		.rotateZ(Math.floor(Math.random() * 30 - 15))
		.render();

	time += 1000;
}

onInit();
