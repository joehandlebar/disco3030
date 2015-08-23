Disco.add('resumeDisplay', {
	$el: $('#resume-display'),

	tools: [ 
			 ['vim', 'github'],
			 ['javascript', 'html5', 'css3', 'sass'],
			 ['angular', 'react', 'backbone', 'jquery', 'responsive design',
			  'node', 'mongo', 'bootstrap', 'foundation',
			  'svg', 'php'],
			['photoshop', 'illustrator', 'indesign'],
			['korea', 'japan']
	],

	populate: function() {
		this.tools.forEach(appendToolSet);

		function appendToolSet(toolset, i) { 
			var $ul = $('.resume-display-' + i + ' ul'); 	
			toolset.forEach(appendTool, $ul);
		}


		function appendTool(tool) { 
			var $li = $("<li></li>"),						   
				 $a = $("<a class='sprite' target='_blank'" +
						"title='more about " + tool + "'" +  
						"></a>");

			sprites.applyImgToEl(tool, $a);
			$li.append($a);
			this.append($li);
		}
	}, 

	render: function() {
		this.populate();
	},

	init: function() {
		var $display = this.$el;

		$display.attr('class', 'display-selected');
		$display.addClass('resume-init');

		setTimeout(function() {
			$display.removeClass('resume-init');	
			$display.addClass('resume-loaded');	
		}, 2000)
	},

})
