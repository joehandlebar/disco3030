var loadInterface = function() {
	var delays;

	if (sessionStorage.getItem('visited')) {
		delays = [0,
				 0,
				 0,
				 0,
				 0,
				 400,
				 0];
	}
	else {
		delays = [0,
				 0,
				 0,
				 0,
				 2200,
				 400,
				 0];
	}

	Disco.render(['workMenu',
				  'workDisplay',
				  'resumeDisplay',
				  'ball',
				  'suk',
				  'nav', 
				  'contact'],

				  delays);
}

var startDisco = function() {
	
	//load sprites
	var init1 = function() {
		var promise = Aplus();

		$.getJSON('disco3030sprite.json', function(data) {
			sprites.setSprites(data);
			promise.fulfill();
		});

		return promise;
	}

	init1()
		//load templates
		.then(function init2() {
			var promise = Aplus();

			templates.loadTemplates(promise);

			return promise;
		})
		//compile templates with data
		.then(function init2() {
			var promise = Aplus();

			$.getJSON('work.json', function(data) {
				templates.compileTemplates(data);
				promise.fulfill();
			});

			return promise;
		})
		//prepare browser display data
		.then(function init3() {
			var promise = Aplus();

			$.getJSON('browsers.json', function handleData(data) {
				Disco.get('browsers').init(data);	
				promise.fulfill();
			});	

			return promise;
		})
		//load interface
		.then(loadInterface);
}



document.addEventListener('DOMContentLoaded', startDisco); 
