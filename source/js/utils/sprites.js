var sprites = (function() {
	var _sprites;

	function setSprites(data) {
		_sprites = data; 
	}

	function getSprite(img) {
		return _sprites[img];
	}

	function applyImgToEl(img, $el) {
		var d = _sprites[img];

		if (typeof d.href !== "undefined") {
			$el.attr("href", d.href);
		}

		$el.css({ 'background-position': d.x + 'px ' + d.y + 'px',
					  'width': d.width,
					  'height': d.height });
	} 

	return {
		setSprites: setSprites,
		getSprite: getSprite,
		applyImgToEl: applyImgToEl
	}

})();
