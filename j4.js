function Link(text, url) {
	this.text = text;
	this.url = url;
} {
	Link.convertManyToHTMLElementUL = function(links) {
		var returnValue = document.createElement("ul");
		for (var i = 0; i < links.length; i++) {
			if (i > 0) {
				var spacer = document.createElement("li");
				spacer.innerHTML = "-";
				spacer.style.display = "inline";
				returnValue.appendChild(spacer);
			}
			var link = links[i];
			var linkAsHTMLElement = link.toHTMLElementLI();
			returnValue.appendChild(linkAsHTMLElement);
		}
		return returnValue;
	}
	Link.prototype.toHTMLElementLI = function() {
		var returnValue = document.createElement("li");
		returnValue.style.display = "inline";
		returnValue.style.margin = "4px";
		var aElement = document.createElement("a");
		aElement.innerHTML = this.text;
		aElement.href = "/" + this.url;
		returnValue.appendChild(aElement);
		return returnValue;
	}
}
var links = [new Link("Adding Machine", "addingmachine.html"), new Link("Artillery Game", "artillerygame.html"), new Link("Asteroids Game", "AsteroidsGame/_AsteroidsGame.html"), new Link("Barter Session", "barter.html"), new Link("Binary File to Image Transcoder", "BinaryFileToImageTranscoder.html"), new Link("Brick-Breaking Game", "brickbreakinggame.html"), new Link("Camera", "imagecapture.html"), new Link("Cinematics Engine", "cinematics.html"), new Link("Conversation Engine", "conversation.html"), new Link("Data Transcoder", "datatranscoder.html"), new Link("Desktop Publisher", "desktoppublisher.html"), new Link("EXE Explorer", "exeexplorer2.html"), new Link("FAT12 Disk Image Explorer", "fat12diskimage.html"), new Link("File to DataURL", "filetodataurl.html"), new Link("File Splitter", "filesplitter.html"), new Link("Flashcards", "flashcards.html"), new Link("Font Tracer", "fonttracingengine.html"), new Link("Game Framework", "gameframework.html"), new Link("GIF Viewer", "gifviewer.html"), new Link("Hex Editor", "HexEditor/_HexEditor.html"), new Link("Isometric Map", "isometric.html"), new Link("JavaScript Minifier", "JSMinifier/_Program.html"), new Link("JavaScript Modularizer", "JSModularizer/_Program.html"), new Link("Landscape Generator", "landscape.html"), new Link("Layout Designer", "layout.html"), new Link("Line of Sight", "lineofsight.html"), new Link("LZW Compressor", "lzwcompressor.html"), new Link("Math Problem Generator", "mathproblemgenerator.html"), new Link("Mesh Editor", "mesheditor.html"), new Link("Minesweeper", "minesweeper.html"), new Link("Mortgage Calculator", "mortgagecalculator.html"), new Link("Multi-Doc Editor", "multipletextdocumenteditor.html"), new Link("Music Tracker", "MusicTracker/_MusicTracker.html"), new Link("Orbital Mechanics Simulator", "orbitalsimulator.html"), new Link("Orrery", "planetarium.html"), new Link("Pac-Man Clone", "mazeeater.html"), new Link("Paint", "paint.html"), new Link("Parallax Scrolling", "parallaxscrolling.html"), new Link("Pixel Art Editor", "pixelarteditor.html"), new Link("Posable Skeleton", "skeleton.html"), new Link("Procedural Caverns", "proceduralcaverns.html"), new Link("Random Password Generator", "randompasswordgenerator.html"), new Link("Random Planet", "randomplanet.html"), new Link("Ray Tracer", "raytracer.html"), new Link("Reading a String from a TXT File", "readingastringfromatxtfile.html"), new Link("Retirement Calculator", "retirementsavingscalculator.html"), new Link("Roguelike", "roguelike.html"), new Link("RPG Combat Engine", "RPGCombatEngine/Source/RPGCombatEngine.html"), new Link("Scrollable Map", "scrollablemap.html"), new Link("Scrolling Tile Map", "scrollingtilemap.html"), new Link("Sidescroller", "sidescroller.html"), new Link("Skeletal Animation", "skinandbones.html"), new Link("Snake", "snakegame.html"), new Link("Sokoban", "sokoban.html"), new Link("Solar System Navigator", "solarsystem.html"), new Link("Solitaire", "solitaire.html"), new Link("Sound Editor", "soundeditor.html"), new Link("Space Strategy Game", "spacestrategygame.html"), new Link("Spherical Network", "sphericalnetwork.html"), new Link("Spreadsheet", "spreadsheet.html"), new Link("SVG Editor", "TextSVGEditor/_Program.html"), new Link("Synthesizer", "synthesizer.html"), new Link("Tactics Game", "tacticsgame.html"), new Link("Tetris", "tetris.html"), new Link("Text Console", "textconsole.html"), new Link("Text Differencer", "textdifferencer.html"), new Link("Text Editor", "texteditor.html"), new Link("Text to Speech", "texttospeech.html"), new Link("Tile Matching Game", "tilematchinggame.html"), new Link("Touch-Typing Trainer", "touchtypingtrainer.html"), new Link("TrueType Viewer", "TrueTypeViewer/_TrueTypeViewer.html"), new Link("Turn-Based Game", "simpleturnbasedgame.html"), new Link("3D Maze Game", "threedeemazegame.html"), new Link("WAV Visualizer", "wavvisualizer.html"), new Link("Web GL Demo", "webgl.html"), ];
var divFooter = document.createElement("div");
divFooter.style.display = "block";
var pFooterTitle = document.createElement("div");
pFooterTitle.innerHTML = "Other programs on This Could Be Better:"
pFooterTitle.style.margin = "8px";
pFooterTitle.style.textAlign = "center";
divFooter.appendChild(pFooterTitle);
divFooter.appendChild(Link.convertManyToHTMLElementUL(links));
document.body.appendChild(divFooter);
