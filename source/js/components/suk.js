Disco.add('suk', {
	$el: $('#suk'),			

	render: function() {
		//unhide suk
		this.setState("sleepy");	
		this.$el.removeClass('suk-hidden');
	},

	setState: function(state) {
		sprites.applyImgToEl(state, this.$el);	
	}

});
