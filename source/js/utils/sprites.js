var sprites = (function() {
	var _sprites;

	function setSprites(data) {
		_sprites = data; 
	}

	function getSprite(img) {
		return _sprites[img];
	}

	return {
		setSprites: setSprites,
		getSprite: getSprite
	}

})();
