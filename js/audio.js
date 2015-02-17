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

	gainNode: [],
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
	
	//availableNotes: ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'], //All notes
	availableNotes: ['c','d#','f','g','a#','c'], //Minor pentatonic c
	
	samples:[],

	patternID: [], //Store current pattern id for each instrument
	nextPattern: [], //Store next pattern id for each instrument

	synthCount: 2,

	testPattern:true, //Rebirth default pattern for testing



	//----------------------------------------------------


	init: function(){

		//Create Context
		app.context = new (window.AudioContext || window.webkitAudioContext)();

		//Volumes
		for(var i=1;i<=app.synthCount;i++){
			app.volume['synth' + i] = 0.2;
			app.mute['synth' + i] = false;
		}

		app.volume['drum1'] = 0.9;
		app.mute['drum1']  = false;

		//Create Filters
		for(var i=1;i<=app.synthCount;i++){
			app.filter['synth' + i] = app.context.createBiquadFilter();
			app.filter['synth' + i].type = 'lowpass'; 
			app.filter['synth' + i].frequency.value = 10000;
			app.filter['synth' + i].Q.value = 8;
			app.filter['synth' + i].gain.value = -50;

			app.filter2['synth' + i] = app.context.createBiquadFilter();
			app.filter2['synth' + i].type = 'lowpass'; 
			app.filter2['synth' + i].frequency.value = 10000;
			app.filter2['synth' + i].Q.value = 5;
			app.filter2['synth' + i].gain.value = -50;

			app.cutoffTempStore['synth' + i] = app.filter['synth' + i].frequency.value;

			app.filterParams['synth' + i] = [];
			app.filterParams['synth' + i]['decayTime'] = 40;
			app.filterParams['synth' + i]['decayAmount'] = 10000;

			//Detune
			app.detunePercentage['synth' + i] = 0;

			app.notes['synth' + i] = [];
			app.frequencies['synth' + i] = [];
			app.slides['synth' + i] = [];
			app.accents['synth' + i] = [];
		}

		//Set up the drums array
		app.drums['drum1'] = [];
		app.drums['drum1']['kick'] = [];
		app.drums['drum1']['sd'] = [];
		app.drums['drum1']['ch'] = [];
		app.drums['drum1']['oh'] = [];
		app.drums['drum1']['rs'] = [];
		
		app.oscillator = [];

		for(var i=1;i<=app.synthCount;i++){
			app.oscillator['synth' + i] = null;

			//Setup waveforms array
			app.waveform['synth' + i] = 'sawtooth';

			//Init the currently selected pattern and next pattern
			app.patternID['synth' + i] = 1;
			app.nextPattern['synth' + i] = 1;
		}

		app.patternID['drum1']  = 1;
		app.nextPattern['drum1']  = 1;

		//Create the empty patterns for each intrument
		for(var i=1; i<=app.patternCount; i++ ){

			for(var i2=1; i2<=app.synthCount; i2++){
				app.notes['synth' + i2][i] = new Array(app.patternLength);
				app.frequencies['synth' + i2][i] = new Array(app.patternLength);
				app.slides['synth' + i2][i] = new Array(app.patternLength);
				app.accents['synth' + i2][i] = new Array(app.patternLength);
			}

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
					app.gainNode[instrument] = app.context.createGain();

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
				    	app.filter2[instrument].connect(app.gainNode[instrument]);
				    } else {
				    	app.filter[instrument].connect(app.gainNode[instrument]);
				    }


					app.gainNode[instrument].connect(app.context.destination)
					//app.gainNode.connect(app.context.destination);
					//delay.connect(app.context.destination);

					//Attack 
					app.gainNode[instrument].gain.setValueAtTime(0,app.context.currentTime);
					app.gainNode[instrument].gain.linearRampToValueAtTime(app.volume[instrument], app.context.currentTime + 0.01);

					app.oscillator[instrument].type = app.waveform[instrument];
				}

				//Osc settings
				//app.frequency[instrument] = freq;
				
				
				//Slide or just set frequency
				if(slide){
					var speed = 60000 / app.tempo / 4;
					var slideTime = speed / 24  / 100;
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

					//var newFilterCutoff = app.cutoffTempStore[instrument] - filterDecayAmount;
					var newFilterCutoff = 0; 

					//Min value for cutoff
					if(newFilterCutoff < 100){
					//	newFilterCutoff = 100;
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

				app.oscillator[instrument].disconnect(app.filter[instrument]);

				if(app.filter2Active){
					app.filter2[instrument].disconnect(app.gainNode[instrument]);
					app.filter[instrument].disconnect(app.filter2[instrument]);
				} else {
					app.filter[instrument].disconnect(app.gainNode[instrument]);	
				}
				
				//app.gainNode.connect(app.context.destination);

				//console.log('Stopping ' + freq)
				//app.gainNode.gain.setValueAtTime(0,app.context.currentTime);
				app.gainNode[instrument].gain.linearRampToValueAtTime(0, app.context.currentTime + 0.05);
				
				//app.oscillator[instrument].stop();
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


	setInstrumentVolume: function(instrument, value){

		value = value / 100;

		if(instrument === 'drum1'){
			value = value * 4 ;
		}

		app.volume[instrument] = value

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
			//app.filterParams[instrument]['decayAmount'] = value * 100;
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

				//Loop through the synths
				for(var synthID=1; synthID<=app.synthCount; synthID++){

					if( app.patternID['synth' + synthID] !== app.nextPattern['synth' + synthID] ){
						app.patternID['synth' + synthID] = app.nextPattern['synth' + synthID];
						ui.highlightPattern('synth' + synthID, app.patternID['synth' + synthID]);
						ui.updateStepValue('synth' + synthID,app.patternID['synth' + synthID],1);
					}

				}

				if( app.patternID['drum1'] !== app.nextPattern['drum1'] ){
					app.patternID['drum1'] = app.nextPattern['drum1'];
					ui.highlightPattern('drum1', app.patternID['drum1']);
				}

			} //End pattern change check

			var previousFreq = [];
			
			if(i>0){
				for(var synthID=1; synthID<=app.synthCount; synthID++){
					previousFreq['synth' + synthID] = app.frequencies['synth' + synthID][app.patternID['synth' + synthID]][i-1];
				}
			} else {
				for(var synthID=1; synthID<=app.synthCount; synthID++){
					previousFreq['synth' + synthID] = app.frequencies['synth' + synthID][app.patternID['synth' + synthID]][app.patternLength-1];
				}
			}
			
			var currentFreq = [];
			var slide = [];

			//Loop through synths - set current freq and slide
			for(var synthID=1; synthID<=app.synthCount; synthID++){
				currentFreq['synth' + synthID] = app.frequencies['synth' + synthID][app.patternID['synth' + synthID]][i];
				slide['synth' + synthID] = app.slides['synth' + synthID][app.patternID['synth' + synthID]][i];

				if(!previousFreq['synth' + synthID] || i===0){
					slide['synth' + synthID] = false;
				}
			}
			
			//Check if sequence has been stopped			    
			if(!app.sequencePlaying){

				//Stop all synths
				for(var synthID=1; synthID<=app.synthCount; synthID++){
			    	if(previousFreq['synth' + synthID]){
				    	app.stopOscillator('synth' + synthID);
				    }
				}

		    	return;
		    } 

		    //Loop through synths
			for(var synthID=1; synthID<=app.synthCount; synthID++){

		    	//Stop previous note (if slide not activated)
			    if(!slide['synth' + synthID]){
			    	if(app.oscillator['synth' + synthID]){
			    		console.log('Stopping ' + previousFreq['synth' + synthID] );
		    			app.stopOscillator('synth' + synthID);
			    	}
			    }

			    //Play current note
		    	if(currentFreq['synth' + synthID]){
		    		if(!app.mute['synth' + synthID]){
		    			console.log('Playing ' + currentFreq['synth' + synthID] );
		    			app.playFrequency('synth' + synthID, currentFreq['synth' + synthID], slide['synth' + synthID]);
		    		}
		    	}

		    }


	    	//Drums
			playSample = function(key){
				if( app.drums['drum1'][key][app.patternID['drum1']][i] ) {

					app.gainNode['drum1'] = app.context.createGain();
					app.gainNode['drum1'].gain.value = app.volume['drum1'];

					var playSound = app.context.createBufferSource(); // Declare a New Sound
					playSound.buffer = app.samples[key]; // Attatch our Audio Data as it's Buffer
					playSound.connect(app.gainNode['drum1']);
					app.gainNode['drum1'].connect(app.context.destination);  // Link the Sound to the Output
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
		for(var synthID=1; synthID<=app.synthCount; synthID++){
			if(app.oscillator['synth' + synthID]){
				app.oscillator['synth' + synthID].stop();
				delete app.oscillator['synth' + synthID];
			}
		}

		//Stop Drums


	},



}; //End App

//Run!
app.init();