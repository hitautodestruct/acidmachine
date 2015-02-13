var app = {

	tempo: 130,
	octave: 2,

	context: null,
	oscillator: [],
	filter: [],

	filter2: [], //Second filter used to achieve 24db
	filter2Active: true,

	gainNode: null,
	frequency: 100,
	volume: [],
	waveform: [],
	detunePercentage: [],
	keyCode: 1,
	keyDown: false,
	sequencePlaying: false,
	currentCell: '0-1',
	patternLength: 16,
	patternCount: 8,
	rowSkip: 1, //Rows to jump after adding a note
	lastFrequency: [],
	notes:[], //To store patterns
	slides:[],
	accents:[],
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
		app.filter['synth1'] = app.context.createBiquadFilter();
		app.filter['synth1'].type = 'lowpass'; 
		app.filter['synth1'].frequency.value = 10000;
		app.filter['synth1'].Q.value = 8;
		app.filter['synth1'].gain.value = -50;

		app.filter2['synth1'] = app.context.createBiquadFilter();
		app.filter2['synth1'].type = 'lowpass'; 
		app.filter2['synth1'].frequency.value = 10000;
		app.filter2['synth1'].Q.value = 8;
		app.filter2['synth1'].gain.value = -50;

		//Detune
		app.detunePercentage['synth1'] = 0;

		app.notes['synth1'] = [];
		app.frequencies['synth1'] = [];
		app.slides['synth1'] = [];
		app.accents['synth1'] = [];

		//Set up the drums array
		app.drums['drum1'] = [];
		app.drums['drum1']['kick'] = [];
		app.drums['drum1']['sd'] = [];
		app.drums['drum1']['ch'] = [];
		app.drums['drum1']['oh'] = [];
		app.drums['drum1']['rs'] = [];

		
		app.oscillator = [];
		app.oscillator['synth1'] = null;

		//Setup waveforms array
		app.waveform['synth1'] = 'sawtooth';

		//Create the empty patterns for each intrument
		for(var i=1; i<=app.patternCount; i++ ){
			app.notes['synth1'][i] = new Array(app.patternLength);
			app.frequencies['synth1'][i] = new Array(app.patternLength);
			app.slides['synth1'][i] = new Array(app.patternLength);
			app.accents['synth1'][i] = new Array(app.patternLength);

			//Set up drum patterns
			app.drums['drum1']['kick'][i] = new Array(app.patternLength);
			app.drums['drum1']['sd'][i] = new Array(app.patternLength);
			app.drums['drum1']['ch'][i] = new Array(app.patternLength);
			app.drums['drum1']['oh'][i] = new Array(app.patternLength);
			app.drums['drum1']['rs'][i] = new Array(app.patternLength);
		}

		app.loadSamples();

 		//Test drum pattern
 		app.drums['drum1']['kick'][1][0] = true;
 		app.drums['drum1']['kick'][1][4] = true;
 		app.drums['drum1']['kick'][1][8] = true;
 		app.drums['drum1']['kick'][1][12] = true;

 		app.drums['drum1']['ch'][1][2] = true;
 		app.drums['drum1']['ch'][1][6] = true;
 		app.drums['drum1']['ch'][1][10] = true;
 		app.drums['drum1']['ch'][1][14] = true;

 		//app.drums['drum1']['rs'][1][13] = true;
 		//app.drums['drum1']['rs'][1][15] = true;

 		//app.drums['drum1']['sd'][1][4] = true;
 		//app.drums['drum1']['sd'][1][12] = true;
		

	},


	//----------------------------------------------------

	//Convert note to frequency
	getFrequency: function(note){

		var noteFreq = [];

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
		noteFreq['g#2'] = 103.83;
		noteFreq['a2']  = 110.00;
		noteFreq['a#2'] = 116.54;
		noteFreq['b2']  = 123.47;

		noteFreq['c3']  = 130.81;
		noteFreq['c#3'] = 138.59;
		noteFreq['d3']  = 146.83;
		noteFreq['d#3'] = 155.56;
		noteFreq['e3']  = 164.81;
		noteFreq['f3']  = 174.61;
		noteFreq['f#3'] = 185.00;
		noteFreq['g3']  = 196.00;
		noteFreq['g#3'] = 207.65;
		noteFreq['a3']  = 220.00;
		noteFreq['a#3'] = 233.08;
		noteFreq['b3']  = 246.94;

		return noteFreq[note];

	},


	//----------------------------------------------------


	playFrequency: function(instrument, freq, slide){

		if(!isNaN(freq)){

				if(!slide){

					app.oscillator[instrument] = app.context.createOscillator();
					app.gainNode = app.context.createGain();

					var delay = app.context.createDelay();

					//Filter
					app.oscillator[instrument].connect(app.filter[instrument]);
					
				    //delay.delayTime.value = 0.390;
				    app.gainNode.gain.value = 2;

				    //Connect delay to gainNode - gainNode to Delay (create feedback)
				    //delay.connect(app.gainNode);
				    //app.gainNode.connect(delay);

				    //app.filter[instrument].connect(delay);

				    if(app.filter2Active){
				    	app.filter[instrument].connect(app.filter2[instrument]);
				    	app.filter2[instrument].connect(app.gainNode);
				    } else {
				    	app.filter[instrument].connect(app.gainNode);
				    }


					app.gainNode.connect(app.context.destination)
					//app.gainNode.connect(app.context.destination);
					//delay.connect(app.context.destination);

				}

				//Osc settings
				//app.frequency[instrument] = freq;
				app.gainNode.gain.value = app.volume[instrument];
				app.oscillator[instrument].type = app.waveform[instrument];
				app.oscillator[instrument].frequency.value = freq; // value in hertz
				app.oscillator[instrument].detune.value = app.detunePercentage[instrument]; // value in cents
				
				
				//Filter decay test---------------------
				var currentTime = app.context.currentTime;

				//var filterDecay = 400;
				//var newFilterCutoff = app.filter[instrument].frequency.value - filterDecay;

				app.filter[instrument].frequency.cancelScheduledValues(currentTime);
				app.filter2[instrument].frequency.cancelScheduledValues(currentTime);
				
				app.filter[instrument].frequency.setValueAtTime(10000, currentTime);
				app.filter2[instrument].frequency.setValueAtTime(10000, currentTime);

				app.filter[instrument].frequency.linearRampToValueAtTime(400, currentTime + 0.1);
				app.filter2[instrument].frequency.linearRampToValueAtTime(400, currentTime + 0.1);
				//End filter decay test-------------------


				//Start osc - if slide not active
				if(!slide){
					app.oscillator[instrument].start();
				}


				//console.log('Playing ' + freq);
				//console.log(app.oscillator);
				console.log(app.detunePercentage[instrument]);
			
		}

	},
	

	//----------------------------------------------------


	stopOscillator: function(instrument){

		if(app.oscillator[instrument]){

				app.oscillator[instrument].disconnect(app.filter);

				if(app.filter2Active){
					app.filter2[instrument].disconnect(app.gainNode);
					app.filter[instrument].disconnect(app.filter2[instrument]);
				} else {
					app.filter[instrument].disconnect(app.gainNode);	
				}
				
				//app.gainNode.connect(app.context.destination);

				//console.log('Stopping ' + freq)
				app.oscillator[instrument].stop();
				delete app.oscillator[instrument];

		}

	},


	//----------------------------------------------------


	toggleWaveform: function(instrument){

		if(app.waveform[instrument] === 'sawtooth'){
			app.waveform[instrument] = 'square';
		} else {
			app.waveform[instrument] = 'sawtooth';
		}

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

		var filter = app.filter[instrument];
		var filter2 = app.filter2[instrument];
		
		//Tuning
		if(controlName == 'tune'){
			app.detunePercentage[instrument] = value * 10;
		}

		//Cutoff frequency
		if(controlName == 'cutoff'){
			if(app.filter2Active){
				filter.frequency.value = value * 100;
			 	filter2.frequency.value = value * 100;
			} else {
				filter.frequency.value = value * 100;
			}
		}

		//Resonance
		if(controlName == 'reso'){
			if(app.filter2Active){
				filter.Q.value = value / 8.5;
				filter2.Q.value = value / 8.5;
			} else {
				filter.Q.value = value / 4.5;
			}
		}

		if(controlName == 'envmod'){

		}

		if(controlName == 'decay'){

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
		var speed = 60000 / app.tempo / 4;
		var i = 0;

		//Play a row, then call function again
		function nextStep() {

			
			if(i>0){
				var previousFreq = app.frequencies['synth1'][1][i-1];
			} else {
				var previousFreq = app.frequencies['synth1'][1][app.patternLength-1];
			}
			
			
			var currentFreq = app.frequencies['synth1'][1][i];

			var slide = app.slides['synth1'][1][i];

			if(!previousFreq || i===0){
				slide = false;
			}

		    //Check if sequence has been stopped
		    if(!app.sequencePlaying){
		    	if(previousFreq){
		    		app.stopOscillator('synth1');
		    	}
		    	return;
		    } 

	    	//Stop previous note (if slide not activated)
		    if(!slide){
		    	if(app.oscillator['synth1']){
		    		console.log('Stopping ' + previousFreq );
	    			app.stopOscillator('synth1');
		    	}
		    }

		    //Play current note
	    	if(currentFreq){
	    		if(!app.mute['synth1']){
	    			console.log('Playing ' + currentFreq );
	    			app.playFrequency('synth1', currentFreq, slide);
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
		        	nextStep();	
		        }, speed);

		    } else {
		    	//Back to start
		    	setTimeout(function(){
		        	i=0;
		        	nextStep();
		        }, speed);
		    }

		}

		nextStep(false);

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

		//Stop Drums


	},



}; //End App

//Run!
app.init();