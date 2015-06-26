var Matrix3D = function(m) {
	this._m = m ? m : [];
}

Matrix3D.prototype = {
	add: function(m2) {
		 this._m = this._m.map(function(n, i) {
						return n + m2[i]; 
		 		   });

		 return this;
	},

	//expects a 3 x 3 transformation matrix
	//T(m) = Am
	transform: function(a) {
		var i, leng = this._m.length,
			x, y, z;

		for (i = 0; i < leng; i+=3) {
			x = this._m[i];
			y = this._m[i+1];
			z = this._m[i+2];

			this._m[i] = a[0]*x
						 + a[1]*y
						 + a[2]*z;

			this._m[i+1] = a[3]*x
						 + a[4]*y
						 + a[5]*z;

			this._m[i+2] = a[6]*x
						 + a[7]*y
						 + a[8]*z;
		}

		return this;
	},

	scale: function(x, y, z) {

		var A = [ x, 0, 0,
				  0, y, 0,
				  0, 0, z ];

		return this.transform(A);
	},

	scaleX: function(x) {
		return this.scale(x, 1, 1);				
	},

	scaleY: function(y) {
		return this.scale(1, y, 1);				
	},

	scaleZ: function(z) {
		return this.scale(1, 1, z);				
	},

	//ehhh can't 
	translate: function(x, y, z) {
		var i, leng = this._m.length;

		for (i = 0; i < leng; i+=3) {
				this._m[i] += x; 
				this._m[i+1] += y; 
				this._m[i+2] += z; 
		}

		return this;
	},

	translateX: function(x) {
		return this.translate(x, 0, 0);
	},

	translateY: function(y) {
		return this.translate(0, y, 0);
	},

	translateZ: function(z) {
		return this.translate(0, 0, z);
	},

	rotateX: function(deg) {
		var rad = deg*Math.PI/180,
		A = [ Math.cos(rad), -Math.sin(rad), 0,
			  Math.sin(rad), Math.cos(rad), 0,
			  0, 0, 1
			];

		return this.transform(A);
	},

	rotateY: function(deg) {
		var rad = deg*Math.PI/180,

		A = [ Math.cos(rad), 0, -Math.sin(rad),
			  0, 1, 0,
			  Math.sin(rad), 0, Math.cos(rad)
			];

		return this.transform(A);
	},

	rotateZ: function(deg) {
		var rad = deg*Math.PI/180,

		A = [ 1, 0, 0,
			  0, Math.cos(rad), -Math.sin(rad),
			  0, Math.sin(rad), Math.cos(rad) 
			];

		return this.transform(A);
	},

	flipX: function() {
		var A = [ -1, 0, 0,
				   0, 1, 0,	
				   0, 0, 1
				];

		return this.transform(A);
	},

	flipY: function() {
		var A = [ 1, 0, 0,
				  0, -1, 0,	
				  0, 0, 1
				];

		return this.transform(A);
	},

	flipZ: function() {
		var A = [ 1, 0, 0,
				  0, 1, 0,	
				  0, 0, -1
				];

		return this.transform(A);
	}
}

Object.defineProperty(Matrix3D.prototype, 'm', {
   get: function() {
		return this._m;	
   }
})
