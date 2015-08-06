Disco.add('suk', {

	el: $('#suk'),			

	states: {},

	render: function() {

		this.states = {
			"sleepy": sprites.getSprite("sleepy"),	
			"hover": sprites.getSprite("hover"),	
			"social": sprites.getSprite("social"),	
			"whoa": sprites.getSprite("whoa"),	
			"professional": sprites.getSprite("professional")	
		}

		this.setState("sleepy");	

		this.el.removeClass('suk-hidden');
	},

	setState: function(state) {
		var d = this.states[state];					 

		this.el.css({ 'background-position': d.x + 'px ' + d.y + 'px',
					  'width': d.width,
					  'height': d.height });
	}

});
