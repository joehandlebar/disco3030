Disco.router({
	//home
	'': function(e) {
		var $content = $('.content-selected'),
			$display = $('.display-selected');

		Disco.get('nav').showLinks();
		Disco.get('suk').setState("sleepy");

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		//stop portrait if returning from about
		(e && e.oldURL.search(/about/) > -1) && Portrait.stop();

		//hide content and display of previous page
		(typeof $content !== "undefined") && $content.attr('class', '');
		(typeof $display !== "undefined") && $display.attr('class', '');

		setTimeout(Disco.get('browsers').render, 300);
	},

	'about': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#about']")[0] );

		document.getElementById('about')
				 .className = 'content-selected';

		setTimeout(function start() {
			Disco.get('suk').setState("whoa");
			Disco.get('browsers').explode();
			Portrait.init();
		}, 400);
	},

	'resume': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#resume']")[0] );

		document.getElementById('resume')
				 .className = 'content-selected';

		setTimeout(function() {
			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			Disco.get('resumeDisplay').init();
		}, 400);
	},

	'work': function() {
		Disco.get('nav')
			  .hideLinksExcept( $("a[href='#work']")[0] );

		Disco.get('workMenu').init();

		setTimeout(function() {

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			Disco.get('workDisplay').init();
		}, 400);

	}
}, 

function windowEvents() {
	var browsers = Disco.get('browsers');	

	if (!sessionStorage.getItem('visited')) {
		sessionStorage.setItem('visited', true);
		window.location.hash = '';
	}

	//need to pause display when on a different tab
	//otherwise it gets messed up
	window.addEventListener('blur', function() {
		window.location.hash.length === 0 &&
		browsers.pause();
	})

	window.addEventListener('focus', function() {
		window.location.hash.length === 0 &&
		browsers.cont();
	})

	/*
	 * PUT WINDOW RESIZE RESPONSIVE STUFF HERE
	 *
	 */
	window.addEventListener('resize', function() { 
		canvas.width = canvas2.width = window.innerWidth;
		canvas.height = canvas2.height = window.innerHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
		Portrait.adjust();
		WorkBlob.adjust();
	})
})
