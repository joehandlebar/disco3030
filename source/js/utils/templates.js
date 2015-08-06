var templates = (function() {
	var _templates = { 'work_menu':  { type: 'html',
								  	 html: ''},
					  'work_display':  { type: 'html',
								  	     html: ''}
					},
		tmp;


	//takes a promise to fulfill once templates are loaded
	function loadTemplates(promise) {
		var leng = Object.keys(_templates).length, i = 0;

		for (tmp in _templates) {
			(function(tmp){
				$.get('view/' + tmp + '.' + _templates[tmp].type, 
					function(data) {
						_templates[tmp].html = data;

						i++;

						if (i === leng) {
							promise.fulfill();
						}
					})
			}(tmp))
		}
	}

	//compiles templates with given data
	function compileTemplates(data) {
		var menuTmp = Handlebars.compile(_templates['work_menu'].html),
			displayTmp = Handlebars.compile(_templates['work_display'].html);

		//inject sprite data 
		var sp;
		data.apps.forEach(function(app) {
			app.img = sprites.getSprite(app.img); 

			app.tools = app.tools.map(function(tool) {
				sp = sprites.getSprite(tool.toLowerCase());

				//we shouldnt need this eventually
				sp["name"] = tool;

				return sp;	
			})
		});

		data.wordpress.forEach(function(w) {
			w.img = sprites.getSprite(w.img); 
			
			w.tools = w.tools.map(function(tool) {
				sp = sprites.getSprite(tool.toLowerCase());

				//we shouldnt need this eventually
				sp["name"] = tool;

				return sp;	
			})
		});

		_templates['work_menu'].html = menuTmp({ 
											apps: data.apps, 
											wordpress: data.wordpress 
										   }); 

		_templates['work_display'].html = displayTmp({ 
												apps: data.apps, 
												wordpress: data.wordpress 
											   }); 
	}


	function getTemplate(t) {
		return _templates[t].html;
	}

	return {
		loadTemplates: loadTemplates,
		compileTemplates: compileTemplates,
		getTemplate: getTemplate
	}
})();
