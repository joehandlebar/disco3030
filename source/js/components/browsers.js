Disco.add('browsers', {

	i: 0, 

	id: undefined,

	browsers: [],	

	init: function(data) {
			this.browsers.push(Browser(data.ie.pts, data.ie.colors));
			this.browsers.push(Browser(data.firefox.pts, data.firefox.colors));
			this.browsers.push(Browser(data.chrome.pts, data.chrome.colors));
			this.browsers.push(Browser(data.opera.pts, data.opera.colors));
	},

	render: function() {
		this.browsers[ this.i ].blowUp();
		this.id = setInterval(this._toggle.bind(this),
							  30000)
	},

	explode: function() {
		clearInterval(this.id);
		this.browsers[this.i].explode();
	},

	pause: function() {
		this.browsers[ this.i ].stop();			   
		clearInterval(this.id);
	},

	cont: function() {
		this.browsers[ this.i ].twirl();
		this.id = setInterval(this._toggle.bind(this),
							  30000)
	},

	_shrink: function() {
		var browsers = this.browsers,
			i = this.i;

		browsers[i].shrink(browsers[(i+1) % 4]);		
	},

	_increment: function() {
		this.i = (this.i + 1) % 4;
	},

	_toggle: function() {
		this._shrink();			

		//delay increment so that explode
		//doesn't conlict with shrink
		setTimeout(this._increment.bind(this), 1000)

	},
})
