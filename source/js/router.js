Disco.router({
	//home
	'': function(e) {
		var content = $('.content-selected'),
			display = $('.display-selected');

		Disco.get('nav').showLinks();
		Disco.get('suk').setState("sleepy");

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		if (e) {
			if (e.oldURL.search(/about/) > -1) {
				Portrait.stop();	
			}
		}

		//hide content and display of previous page
		if (content) {
			content.attr('class', '');
		}

		if (display) {
			display.attr('class', '');
		}

		setTimeout(function() {
			Disco.get('browsers').render();
		}, 100)
	},

	'about': function() {
		var nav = Disco.get('nav'), 
			content, display;

		
		nav.hideLinksExcept( $("a[href='#about']")[0] );


		content = document.getElementById('about');

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("whoa");
			Disco.get('browsers').explode();
			Portrait.init();

		}, 400);
	},

	'resume': function() {
		var nav = Disco.get('nav'), 
			content, display;

		
		nav.hideLinksExcept( $("a[href='#resume']")[0] );


		content = document.getElementById('resume');
		display = document.getElementById('resume-display');

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			display.className = 'display-selected';
		}, 400);
	},

	'work': function() {
		var nav = Disco.get('nav'), 
			selected = Disco.get('workMenu').selected,
			content, display;

		
		nav.hideLinksExcept( $("a[href='#work']")[0] );


		content = document.getElementById('work');
		display = document.getElementById('work-display');

		if (selected) {
			selected.className = "project";
			Disco.get('workMenu').selected = undefined;
		}

		content.className = 'content-selected';

		setTimeout(function() {
			nav.back.attr('class', '');

			Disco.get('suk').setState("professional");
			Disco.get('browsers').explode();

			display.className = 'display-selected';

			Disco.get('workDisplay').init('wordpress-0');
		}, 400);

	}
}, 

function() {
	var browsers = Disco.get('browsers');	

	if (!sessionStorage.getItem('visited')) {
		sessionStorage.setItem('visited', true);
		window.location.hash = '';
	}

	//need to pause display when on a different tab
	//otherwise it gets messed up
	window.addEventListener('blur', function() {
		if (window.location.hash.length === 0) {
			browsers.pause();
		}
	})

	window.addEventListener('focus', function() {
		if (window.location.hash.length === 0) {
			browsers.cont(); 
		}
	})
})
