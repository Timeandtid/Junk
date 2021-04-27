   var audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();
   var frequency = where => Math.pow(2, (where - 48) / 12) * 440;
   var toNote1 = where => notes[where % 12] + (Math.floor((where - 3) / 12) + 1);
   var toNote2 = freq => 12 * Math.log(freq / 440) / Math.log(2) + 36;
   var createNote = (type, vol, note, leng) => {
   	leng = leng || (type == "snare" ? 0.15 : (type == "hihat" ? 0.05 : (type == "kick" ? 0.4 : ((type == "bell" || type == "guitar") ? 2 : (type == "organ" ? 2.4 : 1.6)))));
   	note = note || (type == "kick" ? 150 : ((type == "snare" || type == "hihat") ? 1200 : 440));
   	vol = vol || ((type == "snare" || type == "hihat") ? 0.5 : ((type == "pianoforte" || type == "organ") ? 0.6 : 0.7));
   	let bufferSize = leng * audioCtx.sampleRate;
   	let noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
   	let output = noiseBuffer.getChannelData(0);
   	switch (type.toLowerCase()) {
   		case "snare":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * Math.pow((bufferSize - i) / bufferSize, 2) * (Math.random() * 0.5 - 0.25);
   			}
   			break;
   		case "kick":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * (1 - i / bufferSize) * Math.sin(Math.PI * 2 * note * (1 - (0.5 * i / bufferSize)) * i / audioCtx.sampleRate);
   			}
   			break;
   		case "bell":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * (0.1 + 49 / note) * Math.pow(0.1 + 0.9 * (1 - i / bufferSize), 2) * Math.sin(Math.PI * 2 * note * i / audioCtx.sampleRate);
   			}
   			break;
   		case "hihat":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * Math.pow((bufferSize - i) / bufferSize, 2) * (Math.random() * 0.6 - 0.25) * Math.sin(Math.PI * 2 * note * (1 + 0.01 * i / bufferSize) * i / audioCtx.sampleRate);
   			}
   			break;
   		case "pianoforte":
   			var curVol;
   			var attack = 0.007 * audioCtx.sampleRate;
   			for (let i = 0; i < bufferSize; i++) {
   				if (i <= attack) {
   					curVol = vol * i / attack;
   				} else {
   					curVol = vol * Math.pow(1 - (i - attack) / (bufferSize - attack), 4);
   				}
   				var x = Math.PI * 2 * note * (1 + 0.01 * i / bufferSize) * i / audioCtx.sampleRate;
   				output[i] = curVol * (-0.25 * Math.sin(3 * x) + 0.25 * Math.sin(x) + 0.866 * Math.cos(x));
   			}
   			break;
   		case "organ":
   			var curVol;
   			var attack = 0.2 * audioCtx.sampleRate;
   			for (let i = 0; i < bufferSize; i++) {
   				if (i <= attack) {
   					curVol = vol * i / attack;
   				} else {
   					curVol = vol * Math.pow(1 - (i - attack) / (bufferSize - attack), 4);
   				}
   				var x = Math.PI * 2 * note * (1 + 0.01 * i / bufferSize) * i / audioCtx.sampleRate;
   				output[i] = curVol * (-0.25 * Math.sin(3 * x) + 0.25 * Math.sin(x) + 0.866 * Math.cos(x));
   			}
   			break;
   		case "guitar":
   			var whiteN = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				whiteN.push(Math.random() * 2 - 1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * Math.sqrt((bufferSize - i) / bufferSize) * whiteN[i % freq];
   				if (i % freq != 0) {
   					whiteN[i % freq] = (whiteN[i % freq] + whiteN[i % freq - 1]) / 2;
   				} else if (i != 0) {
   					whiteN[i % freq] = (whiteN[i % freq] + whiteN[freq - 1]) / 2;
   				}
   			}
   			break;
   		case "sine":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * Math.sin(Math.PI * 2 * note * (1 + 0.01 * i / bufferSize) * i / audioCtx.sampleRate);
   			}
   			break;
   		case "square":
   			var waf = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				waf.push(i < freq / 2 ? 1 : -1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * waf[i % freq];
   			}
   			break;
   		case "triangle":
   			var whiteN = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				whiteN.push(2 * Math.abs(2 * i / freq - 1) - 1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * whiteN[i % freq];
   			}
   			break;
   		case "sawtooth":
   			var waf = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				waf.push(2 * i / freq - 1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * waf[i % freq];
   			}
   			break;
   		case "buzz":
   			var waf = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				waf.push(2 * Math.random() - 1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * waf[i % freq];
   			}
   			break;
   		case "white":
   			for (let i = 0; i < bufferSize; i++) {
   				output[i] = vol * (2 * Math.random() - 1);
   			}
   			break;
   		case "trumpet":
   			var attack = 0.03 * audioCtx.sampleRate;
   			var waf = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				waf.push(2 * i / freq - 1);
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				if (i <= attack) {
   					curVol = vol * i / attack;
   				} else {
   					curVol = vol * Math.pow(1 - (i - attack) / (bufferSize - attack), 4);
   				}
   				output[i] = curVol * waf[i % freq];
   			}
   			break;
   		case "flute":
   			var attack = 0.07 * audioCtx.sampleRate;
   			var curVol;
   			for (let i = 0; i < bufferSize; i++) {
   				if (i <= attack) {
   					curVol = (Math.random() * 0.05 + 0.4) * vol * i / attack;
   				} else {
   					curVol = (Math.random() * 0.05 + 0.4) * vol * Math.pow(1 - (i - attack) / (bufferSize - attack), 2);
   				}
   				var x = Math.PI * 2 * note * (1 + 0.01 * i / bufferSize) * i / audioCtx.sampleRate;
   				output[i] = curVol * (0.25 * Math.sin(3 * x) - 0.25 * Math.sin(x) + 0.866 * Math.cos(x));
   			}
   			break;
   		case "clarinet":
   			var attack = 0.05 * audioCtx.sampleRate;
   			var waf = [];
   			var freq = Math.round(audioCtx.sampleRate / note);
   			for (let i = 0; i < freq; i++) {
   				waf.push(Math.max(Math.min(5 * Math.sin(i * 2 * Math.PI / freq), 1), -1));
   			}
   			for (let i = 0; i < bufferSize; i++) {
   				if (i <= attack) {
   					curVol = vol * i / attack;
   				} else {
   					curVol = vol * Math.pow(1 - (i - attack) / (bufferSize - attack), 4);
   				}
   				output[i] = curVol * waf[i % freq];
   			}
   			break;
   	}
   	let sound = audioCtx.createBufferSource();
   	sound.buffer = noiseBuffer;
   	return sound;
   }
   var cnotes = [
   	// Piano
   	"29|2400,36|650,41|650,45|650,24|2400,31|650,36|650,40|650,26|2400,33|650,38|650,41|650,21|2400,28|650,33|650,38|650,22|2400,29|650,34|650,37|650,17|2400,24|650,29|650,32|650,22|2400,29|650,34|650,37|650,24|2400,31|650,36|650,40|650,29|2400,36|650,41|650,45|650,24|2400,31|650,36|650,40|650,26|2400,33|650,38|650,41|650,21|2400,28|650,33|650,38|650,22|2400,29|650,34|650,37|650,17|2400,24|650,29|650,32|650,22|2400,29|650,34|650,37|650,24|2400,31|650,36|650,40|650,29|2400,36|650,41|650,45|650,24|2400,31|650,36|650,40|650,26|2400,33|650,38|650,41|650,21|2400,28|650,33|650,38|650,22|2400,29|650,34|650,37|650,17|2400,24|650,29|650,32|650,22|2400,29|650,34|650,37|650,24|2400",
   	// Trumpet
   	",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,57|1300,,,,55|1300,,,,53|1300,,,,52|1300,,,,50|1300,,,,48|1300,,,,50|1300,,,,52|1300,,,,57|1300|53|1300,,,,55|1300|51|1300,,,,53|1300|50|1300,,,,52|1300|48|1300,,,,50|1300|46|1300,,,,48|1300|44|1300,,,,50|1300|46|1300,,,,52|1300|42|1300"
   ];
   cnotes.forEach((a, i) => {
   	cnotes[i] = a.split(",");
   	cnotes[i].forEach((b, j) => {
   		cnotes[i][j] = b.split("|");
   	});
   });
   var canon = (time) => {
   	let n = Date.now();
   	if (cnotes[0][time]) {
   		for (let i = 0; i < cnotes[0][time].length; i += 2) {
   			let o = createNote('pianoforte', time % 4 == 0 ? 0.55 : 0.045, frequency(+cnotes[0][time][i]), +cnotes[0][time][i + 1] / 1000);
   			o.connect(audioCtx.destination);
   			let ct = 250 + n - Date.now();
   			o.start(audioCtx.currentTime + ct / 1000);
   			setTimeout(() => {
   				o.stop(0);
   				o.disconnect();
   			}, cnotes[0][time][i + 1] + ct);
   		}
   	}
   	if (cnotes[1][time]) {
   		for (let i = 0; i < cnotes[1][time].length; i += 2) {
   			let o = createNote('trumpet', 0.1, frequency(+cnotes[1][time][i]), +cnotes[1][time][i + 1] / 1000);
   			o.connect(audioCtx.destination);
   			let ct = 250 + n - Date.now();
   			o.start(audioCtx.currentTime + ct / 1000);
   			setTimeout(() => {
   				o.stop(0);
   				o.disconnect();
   			}, cnotes[1][time][i + 1] + ct);
   		}
   	}
   	setTimeout(() => {
   		if (time < cnotes[0].length) {
   			canon(time + 1);
   		}
   	}, 300);
   };
   var drums = (time) => {
   	let n = Date.now();
   	if (true) {
   		let o = createNote('hihat', 0.3);
   		o.connect(audioCtx.destination);
   		let ct = 250 + n - Date.now();
   		o.start(audioCtx.currentTime + ct / 1000);
   		setTimeout(() => {
   			o.stop(0);
   			o.disconnect();
   		}, 800 + ct);
   	}
   	if (time % 6 == 0) {
   		let o = createNote('kick', 0.5);
   		o.connect(audioCtx.destination);
   		let ct = 250 + n - Date.now();
   		o.start(audioCtx.currentTime + ct / 1000);
   		setTimeout(() => {
   			o.stop(0);
   			o.disconnect();
   		}, 800 + ct);
   	}
   	if (time % 3 == 0) {
   		let o = createNote('snare', 0.2);
   		o.connect(audioCtx.destination);
   		let ct = 250 + n - Date.now();
   		o.start(audioCtx.currentTime + ct / 1000);
   		setTimeout(() => {
   			o.stop(0);
   			o.disconnect();
   		}, 800 + ct);
   	}
   	setTimeout(() => {
   		if (time < 50) {
   			drums(time + 1);
   		}
   	}, 175);
   }
   var snotes = [39, 41, 43, 44, 46, 48, 50, 51];

   function smusic(time, type = "sine") {
   	if (time < snotes.length) {
   		let o = createNote(type, 0.15, frequency(snotes[time]));
   		o.connect(audioCtx.destination);
   		o.start(audioCtx.currentTime);
   		setTimeout(() => {
   			o.stop(0);
   			o.disconnect();
   			smusic(time + 1, type);
   		}, 500);
   	}
   }
//270
