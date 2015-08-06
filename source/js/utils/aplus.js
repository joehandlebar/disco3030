/* A+ promise implementation from
 * http://modernjavascript.blogspot.ca/2013/08/promisesa-understanding-by-doing.html 
 */
var Aplus = function() {
	var State = {
		PENDING: 0,
		FULFILLED: 1,
		REJECTED: 2
	};

	var Aplus = {
		state: State.PENDING,

		changeState: function(state, value) {
			if (this.state == state) {
				throw new Error("can't transition to same state: " + state);
			}

			if (this.state == State.FULFILLED ||
					this.state == State.REJECTED) {
				throw new Error("can't transition from current state: " + state);
			}

			//if (!value) {
				//throw new Error("transition must have none null reason");
			//}

			this.state = state;
			this.value = value;
			this.resolve();
			return this.state;
		},

		fulfill: function(value) {
			this.changeState( State.FULFILLED, value );				 
		},

		reject: function(reason) {
			this.changeState( State.REJECTED, reason );
		},

		//fulfills promise with a delay
		timeout: function(delay, value) {
			setTimeout(this.fulfill.bind(this, value), delay);
		},

		then: function( onFulfilled, onRejected ) {
			//initialize array
			this.cache = this.cache || [];

			var promise = Object.create(Aplus);

			this.cache.push({
				fulfill: onFulfilled,
				reject: onRejected,
				promise: promise
			});

			this.resolve();

			return promise;
		},

		resolve: function() {
			// check if pending
			if (this.state == State.PENDING) {
				return false;
			}


			// for each 'then'
			while ( this.cache && this.cache.length ) {
				var obj = this.cache.shift();

				var fn = this.state == State.FULFILLED ? obj.fulfill : obj.reject;

				if ( typeof fn != 'function' ) {
					obj.promise.changeState( this.state, this.value );
				}
				else {
					try {
						var value = fn( this.value );

						if ( value && typeof value.then == 'function' ) {
							value.then( function(value) {
								obj.promise.changeState( State.FULFILLED, value );
							}, function(error) {
								obj.promise.changeState( State.REJECTED, error );
							});
						}
						else {
							obj.promise.changeState( State.FULFILLED, value );
						}
					}
					catch (error) {
						obj.promise.changeState( State.REJECTED, error );
					}
				}
			}
		}
	};

	return Object.create(Aplus);
}
