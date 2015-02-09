var app = {

	tempo: 130,
	context: null,
	oscillator: [],
	gainNode: null,
	frequency: 100,
	volume: [],
	waveform: 'square',
	octave: 1,
	detunePercentage: 0,
	filter: null,
	keyCode: 1,
	keyDown: false,
	sequencePlaying: false,
	currentCell: '0-1',
	patternLength: 16,
	patternCount: 8,
	rowSkip: 1, //Rows to jump after adding a note
	lastFrequency: [],
	notes:[], //To store patterns
	drums:[], //To store drum patterns
	mute:[],
	frequencies:[], //To store frequencies
	availableNotes: ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'],
	samples:[],



	//----------------------------------------------------


	init: function(){

		//Create Context
		app.context = new (window.AudioContext || window.webkitAudioContext)();

		//Volumes
		app.volume['synth1'] = 0.4;
		app.mute['synth1'] = false;
		app.mute['drum1']  = false;

		//Create Filters
		app.filter = app.context.createBiquadFilter();
		app.filter.type = 'lowpass'; 
		app.filter.frequency.value = 10000;
		app.filter.Q.value = 8;

		app.notes['synth1'] = [];
		app.frequencies['synth1'] = [];

		//Set up the drums array
		app.drums['drum1'] = [];
		app.drums['drum1']['kick'] = [];
		app.drums['drum1']['sd'] = [];
		app.drums['drum1']['ch'] = [];
		app.drums['drum1']['oh'] = [];
		app.drums['drum1']['rs'] = [];

		
		app.oscillator = [];
		app.oscillator['synth1'] = null;

		//Create the empty patterns for each intrument
		for(var i=1; i<=app.patternCount; i++ ){
			app.notes['synth1'][i] = new Array(app.patternLength);
			app.frequencies['synth1'][i] = new Array(app.patternLength);

			//Set up drum patterns
			app.drums['drum1']['kick'][i] = new Array(app.patternLength);
			app.drums['drum1']['sd'][i] = new Array(app.patternLength);
			app.drums['drum1']['ch'][i] = new Array(app.patternLength);
			app.drums['drum1']['oh'][i] = new Array(app.patternLength);
			app.drums['drum1']['rs'][i] = new Array(app.patternLength);
		}

		app.loadSamples();

		/*
		//Keyboard drum testing
		function onKeyDown(e){
			switch (e.keyCode) {
				// X
				case 88:
					var playSound = app.context.createBufferSource(); // Declare a New Sound
					playSound.buffer = app.samples['sd']; // Attatch our Audio Data as it's Buffer
					playSound.connect(app.context.destination);  // Link the Sound to the Output
					playSound.start(0); // Play the Sound Immediately
				break;

				case 90:
					var playSound = app.context.createBufferSource(); // Declare a New Sound
					playSound.buffer = app.samples['kick']; // Attatch our Audio Data as it's Buffer
					playSound.connect(app.context.destination);  // Link the Sound to the Output
					playSound.start(0); // Play the Sound Immediately
				break;
			}
 		}
 		window.addEventListener("keydown",onKeyDown);
 		*/

 		//Test drum pattern
 		app.drums['drum1']['kick'][1][0] = true;
 		app.drums['drum1']['kick'][1][4] = true;
 		app.drums['drum1']['kick'][1][8] = true;
 		app.drums['drum1']['kick'][1][12] = true;

 		app.drums['drum1']['ch'][1][2] = true;
 		app.drums['drum1']['ch'][1][6] = true;
 		app.drums['drum1']['ch'][1][10] = true;
 		app.drums['drum1']['ch'][1][14] = true;

 		app.drums['drum1']['rs'][1][13] = true;
 		app.drums['drum1']['rs'][1][15] = true;

 		app.drums['drum1']['sd'][1][4] = true;
 		app.drums['drum1']['sd'][1][12] = true;
		

	},


	//----------------------------------------------------


	//Convert keycode to note
	getNote: function(keyCode){

		var keyNotes = [];
		keyNotes[90] = 'c0';
		keyNotes[83] = 'c#0';
		keyNotes[88] = 'd0';
		keyNotes[68] = 'd#0';
		keyNotes[67] = 'e0';
		keyNotes[86] = 'f0';
		keyNotes[71] = 'f#0';
		keyNotes[66] = 'g0';
		keyNotes[72] = 'g#0';
		keyNotes[78] = 'a0';
		keyNotes[74] = 'a#0';
		keyNotes[77] = 'b0';
		keyNotes[188] = 'c1';
		keyNotes[76] = 'c#1';
		keyNotes[190] = 'd1';
		keyNotes[59] = 'd#1';
		keyNotes[81] = 'c1';
		keyNotes[50] = 'c#1';
		keyNotes[87] = 'd1';
		keyNotes[51] = 'd#1';
		keyNotes[69] = 'e1';
		keyNotes[82] = 'f1';
		keyNotes[53] = 'f#1';
		keyNotes[84] = 'g1';
		keyNotes[54] = 'g#1';
		keyNotes[89] = 'a1';
		keyNotes[55] = 'a#1';
		keyNotes[85] = 'b1';
		keyNotes[73] = 'c2';
		keyNotes[57] = 'c#2';
		keyNotes[79] = 'd2';
		keyNotes[48] = 'd#2';
		keyNotes[80] = 'e2';
		keyNotes[219] = 'f2';
		keyNotes[61] = 'f#2';
		keyNotes[221] = 'g2';

		return keyNotes[keyCode];

	},


	//----------------------------------------------------


	//Convert note to frequency
	getFrequency: function(note){

		var noteFreq = [];
		noteFreq['c0']  = 16.35;
		noteFreq['c#0'] = 17.32;
		noteFreq['d0']  = 18.35;
		noteFreq['d#0'] = 19.45;
		noteFreq['e0']  = 20.60;
		noteFreq['f0']  = 21.83;
		noteFreq['f#0'] = 23.12;
		noteFreq['g0']  = 24.50;
		noteFreq['g#0'] = 25.96;
		noteFreq['a0']  = 27.50;
		noteFreq['a#0'] = 29.14;
		noteFreq['b0']  = 30.87;
		noteFreq['c1']  = 32.70;
		noteFreq['c#1'] = 34.65;
		noteFreq['d1']  = 36.71;
		noteFreq['d#1'] = 38.89;
		noteFreq['e1']  = 41.20;
		noteFreq['f1']  = 43.65;
		noteFreq['f#1'] = 46.25;
		noteFreq['g1']  = 49.00;
		noteFreq['g#1'] = 51.91;
		noteFreq['a1']  = 55.00; 
		noteFreq['a#1'] = 58.27;
		noteFreq['b1']  = 61.74;
		noteFreq['c2']  = 65.41;
		noteFreq['c#2'] = 69.30;
		noteFreq['d2']  = 73.42;
		noteFreq['d#2'] = 77.78;
		noteFreq['e2']  = 82.41;
		noteFreq['f2']  = 87.31;
		noteFreq['f#2'] = 92.50;
		noteFreq['g2']  = 98.00;

		return noteFreq[note] * app.octave;

	},


	//----------------------------------------------------


	playFrequency: function(instrument, freq){

		if(!isNaN(freq)){

				app.oscillator[instrument] = app.context.createOscillator();
				app.gainNode = app.context.createGain();

				var delay = app.context.createDelay();

				//Filter
				app.oscillator[instrument].connect(app.filter);

				
			    delay.delayTime.value = 0.4;
			    app.gainNode.gain.value = 0.1;

			    //Connect delay to gainNode - gainNode to Delay (create feedback)
			    //delay.connect(app.gainNode);
			    //app.gainNode.connect(delay);

			    //app.filter.connect(delay);

				app.filter.connect(app.gainNode);
				app.gainNode.connect(app.context.destination);
				//delay.connect(app.context.destination);

				//Osc settings
				app.frequency[instrument] = freq;
				app.gainNode.gain.value = app.volume[instrument];
				app.oscillator[instrument].type = app.waveform;
				app.oscillator[instrument].frequency.value = freq; // value in hertz
				app.oscillator[instrument].detune.value = app.detunePercentage; // value in cents
				app.oscillator[instrument].start();

				//console.log('Playing ' + freq);
				//console.log(app.oscillator);
			
		}

	},
	

	//----------------------------------------------------


	stopFrequency: function(instrument,freq){


		if(!isNaN(freq)){
			
			if(app.oscillator[instrument]){

					app.oscillator[instrument].disconnect(app.filter);
					app.filter.disconnect(app.gainNode);
					//app.gainNode.connect(app.context.destination);

					//console.log('Stopping ' + freq)
					app.oscillator[instrument].stop();
					delete app.oscillator[instrument];

			}

		}

	},


	//----------------------------------------------------


	setWaveform: function(waveform){

		app.waveform = waveform;

	},


	//----------------------------------------------------


	setOctave: function(){

		app.octave = $('#select_octave').val();

	},


	//----------------------------------------------------


	setControlKnob: function(instrument, controlName, value){
		console.log('Instrument: ' + instrument);
		console.log('Control: ' + controlName);
		console.log('Value: ' + value);
		console.log('-------------');
		
		//Tuning
		if(controlName == 'tune'){
			app.detunePercentage = value;
		}

		//Cutoff frequency
		if(controlName == 'cutoff'){
			 app.filter.frequency.value = value * 100;
		}

		//Resonance
		if(controlName == 'reso'){
			app.filter.Q.value = value / 4;
		}

		if(controlName == 'envmod'){

		}

	},


	//----------------------------------------------------

	
	loadSamples: function(){

		var samplePaths = [];
		samplePaths['kick']   = 'bd01.wav';
		samplePaths['sd']   = 'sd10.wav';
		samplePaths['ch']   = 'hh01.wav';
		samplePaths['oh']   = 'oh01.wav';
		samplePaths['rs']   = 'rs01.wav';

		loadSample = function(key, path){

				console.log('Loading key: ' + key + ' - sample: ' + path)

				app.samples[key]; // Create the Sound 
				var getSound = new XMLHttpRequest(); // Load the Sound with XMLHttpRequest
				getSound.open("GET", "samples/909/" + path, true); // Path to Audio File
				getSound.responseType = "arraybuffer"; // Read as Binary Data
				getSound.onload = function() {
					app.context.decodeAudioData(getSound.response, function(buffer){
						app.samples[key] = buffer; // Decode the Audio Data and Store it in a Variable
					});
				}
				getSound.send(); // Send the Request and Load the File

		}


		//Loop through sample paths
		for(key in samplePaths){
			loadSample(key, samplePaths[key]);
		}

		

	},
	

	//----------------------------------------------------


	playSequence: function(){

		//Do nothing if already playing
		if(app.sequencePlaying){
			return;
		}

		app.sequencePlaying = true;
		var speed = 60000 / app.tempo / 4
		var i = 0;

		//Play a row, then call function again
		function nextRow() {

			if(i>0){
				var previousFreq = app.frequencies['synth1'][1][i-1];
			} else {
				var previousFreq = app.frequencies['synth1'][1][app.patternLength-1];
			}
			
			var currentFreq = app.frequencies['synth1'][1][i];

		    //Check if sequence has been stopped
		    if(!app.sequencePlaying){
		    	if(previousFreq){
		    		app.stopFrequency('synth1', previousFreq);
		    		return;
		    	}
		    } 

	    	//Stop previous note 
		    if(previousFreq){
		    	console.log('Stopping ' + previousFreq );
		    	app.stopFrequency('synth1', previousFreq);
		    }

		    //Play current note
	    	if(currentFreq){
	    		if(!app.mute['synth1']){
	    			console.log('Playing ' + currentFreq );
	    			app.playFrequency('synth1', currentFreq);
	    		}
	    	}

	    	//Drums
			playSample = function(key){
				if( app.drums['drum1'][key][1][i] ) {
					var playSound = app.context.createBufferSource(); // Declare a New Sound
					playSound.buffer = app.samples[key]; // Attatch our Audio Data as it's Buffer
					playSound.connect(app.context.destination);  // Link the Sound to the Output
					playSound.start(0); // Play the Sound Immediately
				}
			}

			//Play drum sounds if not muted
			if(!app.mute['drum1']){
				//Loop through samples
				for(key in app.samples){
					playSample(key);
				}	
			}
			








		    //Next row
		    if(i<(app.patternLength-1)) {
		    	i++;
		        setTimeout(function(){
		        	nextRow();	
		        }, speed);

		    } else {
		    	//Back to start
		    	setTimeout(function(){
		        	i=0;
		        	nextRow();
		        }, speed);
		    }

		}

		nextRow(false);

	},


	//----------------------------------------------------


	stopSequence: function(){

		app.sequencePlaying = false;
		//console.log('stopped');

		//Stop Synth1
		if(app.oscillator['synth1']){
			app.oscillator['synth1'].stop();
			delete app.oscillator['synth1'];
		}


	},



}; //End App

//Run!
app.init();