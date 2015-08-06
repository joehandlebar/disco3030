Disco.add('workMenu', {

	container: $('#content'),

	el: undefined,

	selected: undefined,

	events: {
		'click': 'display'
	},

	render: function() {

		this.el = $(templates.getTemplate('work_menu'));

		this.container.append(this.el);
	},

	display: function(e) {
		var target = e.target;

		//update project display
		if (e.target.nodeName === 'LI') {
			var id = target.getAttribute('data-cat') + '-' 
					 + target.getAttribute('data-key'),
				
				prevSelected;

				prevSelected = this.view.selected;
				//prevSelected.className = 'project'; 

		
			this.view.selected = document.getElementById(id);	

			WorkBlob.flexDisplay(prevSelected, this.view.selected);
		}
	}

})
