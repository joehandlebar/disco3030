Disco.add('workDisplay', {

	$container: $('#display'),

	$el: undefined,

	render: function() {
		this.$el = $(templates.getTemplate('work_display'));
			
		this.$container.append(this.$el);
	},

	init: function() {
		this.$el.attr('class', 'display-selected');

		WorkBlob.fadeIn('wordpress-0');
	} 
})
