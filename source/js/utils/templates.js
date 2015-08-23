var templates = (function() {
	var _templates = { 'work_menu':  { type: 'html',
								  	 html: ''},
					  'work_display':  { type: 'html',
								  	     html: ''}
					};

	return {
		loadTemplates: loadTemplates,
		compileTemplates: compileTemplates,
		getTemplate: getTemplate
	}


	//takes a promise to fulfill once templates are loaded
	function loadTemplates(promise) {
		var leng = Object.keys(_templates).length, 
			i = 0, 
			tmp;

		for (tmp in _templates) {
			_loadTemplate(tmp);

		}

		function _loadTemplate(tmp) { 
			var tmpObj = _templates[tmp],
				path = 'view/' + tmp + '.' + tmpObj.type;

			$.get(path, storeTemplate);

			function storeTemplate(data) { 
				tmpObj.html = data;

				i++;
				//all templates loaded? 
				(i === leng) && promise.fulfill();
			}
		}

	}

	//compiles templates with given data
	function compileTemplates(data) {
		var menuTmp = Handlebars.compile(_templates['work_menu'].html),
			displayTmp = Handlebars.compile(_templates['work_display'].html, { noEscape: true });

		//inject sprite data 
		data.apps.forEach(_injectSpriteData);
		data.wordpress.forEach(_injectSpriteData);

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

	/****/

	function _injectSpriteData(project) { 
		project.img = sprites.getSprite(project.img);

		project.tools = project.tools.map(_getToolsSpriteData);
	}

	function _getToolsSpriteData(name) { 
		return sprites.getSprite(name.toLowerCase());
	} 
})();
