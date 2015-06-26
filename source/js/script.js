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
