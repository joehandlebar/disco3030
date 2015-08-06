/*
 * tool for converting leshy spritesheet data to the one I need
 */

var fs = require("fs");

fs.readFile('./disco3030sprite.json', function(err, data) {
	var d = JSON.parse(data.toString()),
		result = {},
		o, prop,
		width = 1045,
		height = 1307;

	var hrefs = {
		"github" : "https://github.com/",
		"react" : "https://facebook.github.io/react/",
		"jquery" : 	"https://jquery.com/",
		"svg" : "https://developer.mozilla.org/en/docs/Web/SVG",
		"firebase": "https://www.firebase.com/",
		"angular": "https://angularjs.org/",
		"mongo" : "https://www.mongodb.org/",
		"html5": "https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5",
		"node": "https://nodejs.org/",
		"css3": "https://developer.mozilla.org/en/docs/Web/CSS/CSS3",
		"sass": "http://sass-lang.com/",
		"php": "https://secure.php.net/"
	}

	d.forEach(function(s) {
		o = {};

		for (prop in s) {
			if (prop === "x") {
				o[prop] = width - s[prop];
			}
			else if (prop === "y") {
				o[prop] = height - s[prop];
			}
			else {
				o[prop] = s[prop];
			}

			if (prop === "name" &&
				hrefs[ s[prop] ]) {
				o["href"] = hrefs[ s[prop] ]
			}
		}

		result[s.name] = o;

	})


	fs.writeFile('./disco3030sprite.json', JSON.stringify(result, null, 4));
})
