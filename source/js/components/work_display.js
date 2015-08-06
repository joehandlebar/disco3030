Disco.add('workDisplay', {

	container: $('#display'),

	el: undefined,

	init: WorkBlob.fadeIn,

	render: function() {
		this.el = $(templates.getTemplate('work_display'));
			
		this.container.append(this.el);
	}
	
})
