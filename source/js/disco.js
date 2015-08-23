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
