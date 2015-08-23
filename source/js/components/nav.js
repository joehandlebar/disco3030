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
