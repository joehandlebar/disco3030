Disco.add('ball', {

	el: $('#disco-ball'),

	render: function() {
		var el = this.el;

		var init1 = function() {
			var promise = Aplus();

			el.removeClass('disco-hidden'); 

			setTimeout(function() {
				el.addClass('disco-init1')
				promise.timeout(500);
			}, 100);

			return promise;
		}

		var init2 = function() {
			var promise = Aplus();

			el.addClass('disco-init2')
			promise.timeout(1000);

			return promise;
		}

		var init3 = function() {
			var promise = Aplus();

			el.addClass('disco-init3')
			promise.timeout(500);

			return promise;
		}

		var init4 = function() {
			el.addClass('disco-init4')
		}

		//second visit and on gets partial disco treatment
		if (sessionStorage.getItem('visited')) {
			init4();
		}
		//first time gets full disco treatment
		else {
			init1()
				.then(init2)
				.then(init3)
				.then(init4)
		}
	}
});
