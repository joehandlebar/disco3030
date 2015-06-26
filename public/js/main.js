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

"use strict"

/* A+ promise implementation from:
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


var templateManager = (function() {
	var templates = { 'disco': { type: 'html',
								 html: ''},
					  'nav': { type: 'html',
					  		   html: ''},
					  'about': { type: 'html',
								 html: ''},
					  'resume': { type: 'html',
								 html: ''},
					  'work_menu':  { type: 'html',
								  	 html: ''},
					  'work_display':  { type: 'html',
								  	     html: ''}
					},
		tmp;

	for (tmp in templates) {
		(function(tmp){
			$.get('view/' + tmp + '.' + templates[tmp].type, 
				function(data) {
					templates[tmp].html = data;
				})
		}(tmp))
	}

	//prepare handlebar templates
	$.getJSON('work.json', function handleData(data) {
		var menuTmp = Handlebars.compile(templates['work_menu'].html),
			displayTmp = Handlebars.compile(templates['work_display'].html);

		templates['work_menu'].html = menuTmp({ 
											apps: data.apps, 
											wordpress: data.wordpress 
										   }); 

		templates['work_display'].html = displayTmp({ 
												apps: data.apps, 
												wordpress: data.wordpress 
											   }); 
	})

	function getTemplate(t) {
		return templates[t].html;
	}

	return {
		getTemplate: getTemplate
	}
})();

document.addEventListener('DOMContentLoaded', function() {

var disco = {
	container: $(document.body),

	el: $(templateManager.getTemplate('disco')),

	events: {
		'DOMNodeInserted': 'init'
	},

	render: function() {
		attachEvents(this, this.events);
		this.container.prepend(this.el);
	},

	init: function(e) {
		var that = this;

		var init1 = function() {
			var promise = Aplus();

			setTimeout(function() {
				that.addClass('disco-init1')
				promise.timeout(500);
			}, 0);

			return promise;
		}
	
		init1()
			.then(function() {
				var promise = Aplus();

				that.addClass('disco-init2')
				promise.timeout(1000);

				return promise;
			})
			.then(function() {
				var promise = Aplus();

				that.addClass('disco-init3')
				promise.timeout(500);

				return promise;
			})
			.then(function() {
				that.addClass('disco-init4')
			})
	}
};

var nav = {
	container: $(document.body),

	el: $(templateManager.getTemplate('nav')),

	events: {
		'DOMNodeInserted': 'init',
		'click': 'handleClick'
	},

	render: function() {

		var links = this.el.find('li');
		var back = $('#back', 'nav');

		attachEvents(this, this.events);

		this.container.prepend(this.el);
	},

	init: function(e) {
		var that = this;
		setTimeout(function() {
			that.attr("class", "nav-loading");	

			setTimeout(function() {
				that.attr('class', '');
			}, 500);
		}, 0)
	},

	handleClick: function(e) {
		var	$links = $('#main-menu > li'),
			$displays = $('#display > div'),
			back = document.getElementById('back'),
			target = e.target;

		//select main menu link
		if (target.nodeName === 'A') {

			$links.each(function updateLinks(index) {
				//hide back button
				back.setAttribute('class', '');
				
				//hide other links
				if (this !== target.parentNode) {
					this.setAttribute('class', 'link-hidden');
				}
				else {
					//enlarge selected link text
					setTimeout(function() {
						this.setAttribute('class', 'link-selected');

					}.bind(this), 400);
				}
			})
		}

		//hit back button
		if (target.id === "back") {
			//reveal links
			$links.attr('class', '');
			//hide back btn
			back.setAttribute('class', 'back-hidden');
			//hide displays
			$displays.attr('class', '');
			//empty hash
			window.location.hash = '';
		}
	}
};

var about =  {
	container: $('#content'),

	el: $(templateManager.getTemplate('about')),
	
	render: function() {
		this.container.append(this.el);
	} 
}

var resume =  {
	container: $('#content'),

	el: $(templateManager.getTemplate('resume')),
	
	render: function() {
		this.container.append(this.el);
	} 
}

var workMenu = {
	container: $('#content'),

	el: $(templateManager.getTemplate('work_menu')),

	selected: undefined,

	events: {
		'mouseover': 'display'
	},

	render: function() {
		this.container.append(this.el);
		attachEvents(this, this.events);
	},

	display: function(e) {
		var target = e.target;

		//update project display
		if (e.target.nodeName === 'LI') {
			var id = target.getAttribute('data-cat') + '-' 
					 + target.getAttribute('data-key');

			if (this.selected) { this.selected.className = 'project'; }
		
			this.selected = document.getElementById(id);	
			this.selected.className += ' project-selected';
		}
	}
}

var workDisplay = {
	container: $('#display'),

	el: $(templateManager.getTemplate('work_display')),

	render: function() {
		this.container.append(this.el);
	}
}

//var router = (function() {
	var selectedContent = undefined,
		selectedDisplay = undefined;

	$(window).on('hashchange', function(e) {
		e.preventDefault();

		if (selectedContent) { selectedContent.attr('class', ''); } 
		if (selectedDisplay) { selectedDisplay.attr('class', ''); } 

		setTimeout(function() {
			selectedContent = $(window.location.hash).addClass('content-selected');
			selectedDisplay = $(window.location.hash + '-display').addClass('display-selected');
		}, 0)
	});

//})(); 
	

//attach events to view
function attachEvents(view, events) {
	var el = view.el;

	for (var ev in events) {
		el.on(ev, view[events[ev]].bind(el));
	}
}

//about.render();
//resume.render();
//workMenu.render();
//workDisplay.render();
//setTimeout(disco.render.bind(disco), 0);
//setTimeout(nav.render.bind(nav), 3500);

})
