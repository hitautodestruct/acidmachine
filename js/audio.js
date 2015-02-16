var app = {

	tempo: 130,
	octave: 2,

	context: null,
	oscillator: [],
	filter: [],

	filter2: [], //Second filter used to achieve 24db
	filter2Active: true,

	filterParams: [], //To store decay, env.mod, accent values

	cutoffTempStore: [],

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
	
	availableNotes: ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'], //All notes
	//availableNotes: ['c','d#','f','g','a#','c'], //Minor pentatonic c
	
	samples:[],

	patternID: [], //Store current pattern id for each instrument
	nextPattern: [], //Store next pattern id for each instrument

	testPattern:true, //Rebirth default pattern for testing



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
		app.filter2['synth1'].Q.value = 5;
		app.filter2['synth1'].gain.value = -50;

		app.cutoffTempStore['synth1'] = app.filter['synth1'].frequency.value;

		app.filterParams['synth1'] = [];
		app.filterParams['synth1']['decayTime'] = 40;
		app.filterParams['synth1']['decayAmount'] = 5000;

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

		//Init the currently selected pattern
		app.patternID['synth1'] = 1;
		app.patternID['drum1']  = 1;

		app.nextPattern['synth1'] = 1;
		app.nextPattern['drum1']  = 1;

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

 		//app.drums['drum1']['rs'][1][13] = true;
 		//app.drums['drum1']['rs'][1][15] = true;

 		app.drums['drum1']['sd'][1][4] = true;
 		app.drums['drum1']['sd'][1][12] = true;


 		app.drums['drum1']['kick'][2][0] = true;
 		app.drums['drum1']['kick'][2][4] = true;
 		app.drums['drum1']['kick'][2][8] = true;
 		app.drums['drum1']['kick'][2][12] = true;

 		app.drums['drum1']['ch'][2][2] = true;
 		app.drums['drum1']['ch'][2][6] = true;
 		app.drums['drum1']['ch'][2][10] = true;
 		app.drums['drum1']['ch'][2][14] = true;

 		app.drums['drum1']['sd'][2][4] = true;
 		app.drums['drum1']['sd'][2][12] = true;



 		app.drums['drum1']['kick'][3][0] = true;
 		app.drums['drum1']['kick'][3][4] = true;
 		app.drums['drum1']['kick'][3][8] = true;
 		app.drums['drum1']['kick'][3][12] = true;

 		app.drums['drum1']['ch'][3][2] = true;
 		app.drums['drum1']['ch'][3][6] = true;
 		app.drums['drum1']['ch'][3][10] = true;
 		app.drums['drum1']['ch'][3][14] = true;

 		app.drums['drum1']['sd'][3][4] = true;
 		app.drums['drum1']['sd'][3][10] = true;
 		app.drums['drum1']['sd'][3][12] = true;
 		app.drums['drum1']['sd'][3][13] = true;
 		app.drums['drum1']['sd'][3][14] = true;
 		app.drums['drum1']['sd'][3][15] = true;



 		if(app.testPattern){
 			app.setTestPattern();
 		}
		

	},


	//----------------------------------------------------

	setTestPattern: function(){

		app.notes['synth1'][1] = [null,'c3','c2','','c2',null,'c3',null,'c2','d2','d#2','c2',null,null,null,null];
		app.slides['synth1'][1] = [null,null,null,true,true,false,false,false,false,true,true,false,false,false,true,true];

		app.notes['synth1'][2] = ['c2','c2','c2','c2','c2','c2','c3','c2','c2','c2','c2','c2','c2','c2','c2','c2'];

		for(var i=0; i<16; i++){
			app.frequencies['synth1'][1][i] = app.getFrequency(app.notes['synth1'][1][i]);
			app.frequencies['synth1'][2][i] = app.getFrequency(app.notes['synth1'][2][i]);

			//Update table
			$('#r' + (i+1) + 'c1').val(app.notes['synth1'][1][i]);
		}



	},

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
				    //app.gainNode.gain.value = 2;

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

					//Attack 
					app.gainNode.gain.setValueAtTime(0,app.context.currentTime);
					app.gainNode.gain.linearRampToValueAtTime(app.volume[instrument], app.context.currentTime + 0.01);

				}

				//Osc settings
				//app.frequency[instrument] = freq;
				



				app.oscillator[instrument].type = app.waveform[instrument];
				
				//Slide or just set frequency
				if(slide){
					var speed = 60000 / app.tempo / 4;
					var slideTime = speed / 20 / 100;
					//alert(slideTime);
					app.oscillator[instrument].frequency.linearRampToValueAtTime(freq, app.context.currentTime + slideTime);
				} else {
					app.oscillator[instrument].frequency.value = freq;
				}
				
				
				app.oscillator[instrument].detune.value = app.detunePercentage[instrument]; // value in cents
				
				
				//Filter decay test---------------------
					app.filter[instrument].frequency.cancelScheduledValues(app.context.currentTime);
					app.filter2[instrument].frequency.cancelScheduledValues(app.context.currentTime);

					//Temp copy of current filter cutoff value
					app.filter[instrument].frequency.value = app.cutoffTempStore[instrument];
					app.filter2[instrument].frequency.value = app.cutoffTempStore[instrument];

					var filterDecayAmount = app.filterParams[instrument]['decayAmount'];
					var filterDecayTime = app.filterParams[instrument]['decayTime'];

					var newFilterCutoff = app.cutoffTempStore[instrument] - filterDecayAmount;
					newFilterCutoff = filterDecayAmount; 

					//Min value for cutoff
					if(newFilterCutoff < 100){
						newFilterCutoff = 100;
					}

					//console.log('Temp: ' + app.cutoffTempStore[instrument] + ' --- Filter: ' + app.filter[instrument].frequency.value);
					//console.log(app.filter[instrument].frequency.value + ' - ' + newFilterCutoff);
					
					app.filter[instrument].frequency.setValueAtTime(app.cutoffTempStore[instrument], app.context.currentTime);
					app.filter2[instrument].frequency.setValueAtTime(app.cutoffTempStore[instrument], app.context.currentTime);

					app.filter[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + filterDecayTime);
					app.filter2[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + filterDecayTime);
				//End filter decay test-------------------


				//Start osc - if slide not active
				if(!slide){
					app.oscillator[instrument].start();
				}


				//console.log('Playing ' + freq);
				//console.log(app.oscillator);
				//console.log(app.detunePercentage[instrument]);
			
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

			var cutoffVal = value * 100;

			if(app.filter2Active){
				filter.frequency.value = cutoffVal;
			 	filter2.frequency.value = cutoffVal;
			} else {
				filter.frequency.value = cutoffVal;
			}

		//Copy of cutoff value - To use when playing note as filter decay will change cutoff - this value is used to reset it 
		app.cutoffTempStore[instrument] = cutoffVal;

		console.log(app.cutoffTempStore[instrument]);

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
			app.filterParams[instrument]['decayAmount'] = value * 100;
		}

		if(controlName == 'decay'){
			app.filterParams[instrument]['decayTime'] = value / 100;
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

			//Check if current pattern has been changed
			if(i===0){
				if( app.patternID['synth1'] !== app.nextPattern['synth1'] ){
					app.patternID['synth1'] = app.nextPattern['synth1'];
					ui.highlightPattern('synth1', app.patternID['synth1']);
				}

				if( app.patternID['drum1'] !== app.nextPattern['drum1'] ){
					app.patternID['drum1'] = app.nextPattern['drum1'];
					ui.highlightPattern('drum1', app.patternID['drum1']);
				}

			}

			
			if(i>0){
				var previousFreq = app.frequencies['synth1'][app.patternID['synth1']][i-1];
			} else {
				var previousFreq = app.frequencies['synth1'][app.patternID['synth1']][app.patternLength-1];
			}
			
			
			var currentFreq = app.frequencies['synth1'][app.patternID['synth1']][i];

			var slide = app.slides['synth1'][app.patternID['synth1']][i];

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
				if( app.drums['drum1'][key][app.patternID['drum1']][i] ) {
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