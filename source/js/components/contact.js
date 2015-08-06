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
