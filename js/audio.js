var app = {

	tempo: 130,
	octave: 2,

	song: [],
	songLength:32,
	maxSongLength: 640,
	songMode: false, 

	context: null,
	distortionNode: null,
	distortionEnabled: [],
	delayEnabled: [],

	oscillator: [],
	filter: [],

	filter2: [], //Second filter used to achieve 24db
	filter2Active: true,

	filterParams: [], //To store decay, env.mod, accent values

	cutoffTempStore: [],

	//Delay / feedback
    delay:null,
    feedback:null,

	gainNode: [],
	frequency: 100,
	volume: [],
	tempVolume: [], //To store old value when accenting a note
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

	//DRUMS
	selectedDrum: [],


	testPattern:true, //Rebirth default pattern for testing

	tuna:null,



	//----------------------------------------------------


	init: function(){

		//Create Context
		app.context = new (window.AudioContext || window.webkitAudioContext)();

		app.tuna = new Tuna(app.context);

		//Delay / feedback
	    app.delay = app.context.createDelay();
        app.feedback = app.context.createGain();
        app.delay.delayTime.value = (60000 / app.tempo) / 64 / 100 * 3;
        //app.delay.delayTime.value = 0.20;

        app.feedback.gain.value = 0.4;

		
		//Distortion -----
		app.distortionNode = app.context.createWaveShaper();
		
		function makeDistortionCurve(amount) {
		  	var k = typeof amount === 'number' ? amount : 50,
		    n_samples = 44100,
		    curve = new Float32Array(n_samples),
		    deg = Math.PI / 180,
		    i = 0,
		    x;
			for ( ; i < n_samples; ++i ) {
				x = i * 2 / n_samples - 1;
				curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
				//curve[i] = ( 500 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}
		  	return curve;
		};

		app.distortionNode.curve = makeDistortionCurve(400);
		app.distortionNode.oversample = '4x';

		//-----------






		//Volumes
		app.gainNode['master'] = app.context.createGain();
		app.gainNode['master'].gain.value = 0.6;

		for(var i=1;i<=app.synthCount;i++){
			app.volume['synth' + i] = 0.2;
			app.tempVolume['synth' + i] = app.volume['synth' + i];
			app.mute['synth' + i] = false;

			app.distortionEnabled['synth' + i] = false;
		}

		app.distortionEnabled['synth1'] = true;
		app.delayEnabled['synth2'] = true;

		app.volume['drum1'] = [];
		app.volume['drum1']['master'] = 0.8;
		app.volume['drum1']['bd'] = 1.0;
		app.volume['drum1']['sd'] = 1.0;
		app.volume['drum1']['lt'] = 1.0;
		app.volume['drum1']['mt'] = 1.0;
		app.volume['drum1']['ht'] = 1.0;
		app.volume['drum1']['rs'] = 1.0;
		app.volume['drum1']['cp'] = 1.0;
		app.volume['drum1']['ch'] = 0.4;
		app.volume['drum1']['oh'] = 0.4;
		app.volume['drum1']['cc'] = 1.0;
		app.volume['drum1']['rc'] = 1.0;


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
			app.filterParams['synth' + i]['decayTime'] = 0.7;
			app.filterParams['synth' + i]['decayAmount'] = 10000;
			app.filterParams['synth' + i]['accent'] = 60;

			//Detune
			app.detunePercentage['synth' + i] = 0;

			app.notes['synth' + i] = [];
			app.frequencies['synth' + i] = [];
			app.slides['synth' + i] = [];
			app.accents['synth' + i] = [];
		}

		app.detunePercentage['synth2'] = 1200;

		//Set up the drums array
		app.drums['drum1'] = [];
		app.drums['drum1']['bd'] = [];
		app.drums['drum1']['sd'] = [];
		app.drums['drum1']['lt'] = [];
		app.drums['drum1']['mt'] = [];
		app.drums['drum1']['ht'] = [];
		app.drums['drum1']['rs'] = [];
		app.drums['drum1']['cp'] = [];
		app.drums['drum1']['ch'] = [];
		app.drums['drum1']['oh'] = [];
		app.drums['drum1']['cc'] = [];
		app.drums['drum1']['rc'] = [];
		
		
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
			app.drums['drum1']['bd'][i] = new Array(app.patternLength);
			app.drums['drum1']['sd'][i] = new Array(app.patternLength);
			app.drums['drum1']['lt'][i] = new Array(app.patternLength);
			app.drums['drum1']['mt'][i] = new Array(app.patternLength);
			app.drums['drum1']['ht'][i] = new Array(app.patternLength);
			app.drums['drum1']['rs'][i] = new Array(app.patternLength);
			app.drums['drum1']['cp'][i] = new Array(app.patternLength);
			app.drums['drum1']['ch'][i] = new Array(app.patternLength);
			app.drums['drum1']['oh'][i] = new Array(app.patternLength);
			app.drums['drum1']['cc'][i] = new Array(app.patternLength);
			app.drums['drum1']['rc'][i] = new Array(app.patternLength);

		}

		app.loadSamples();

 		//Test drum pattern
 		app.drums['drum1']['bd'][1][0] = true;
 		app.drums['drum1']['bd'][1][4] = true;
 		app.drums['drum1']['bd'][1][8] = true;
 		app.drums['drum1']['bd'][1][12] = true;

 		app.drums['drum1']['sd'][1][4] = true;
 		app.drums['drum1']['sd'][1][12] = true;


 		app.drums['drum1']['bd'][2][0] = true;
 		app.drums['drum1']['bd'][2][4] = true;
 		app.drums['drum1']['bd'][2][8] = true;
 		app.drums['drum1']['bd'][2][12] = true;

 		app.drums['drum1']['ch'][2][2] = true;
 		app.drums['drum1']['ch'][2][6] = true;
 		app.drums['drum1']['ch'][2][10] = true;
 		app.drums['drum1']['ch'][2][14] = true;

 		app.drums['drum1']['sd'][2][4] = true;
 		app.drums['drum1']['sd'][2][12] = true;



 		app.drums['drum1']['bd'][3][0] = true;
 		app.drums['drum1']['bd'][3][4] = true;
 		app.drums['drum1']['bd'][3][8] = true;
 		app.drums['drum1']['bd'][3][12] = true;

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

 		app.drums['drum1']['bd'][4][0] = true;
 		app.drums['drum1']['bd'][4][2] = true;
 		app.drums['drum1']['bd'][4][4] = true;
 		app.drums['drum1']['bd'][4][11] = true;
 		app.drums['drum1']['bd'][4][14] = true;
 		app.drums['drum1']['bd'][4][15] = true;

 		app.selectedDrum['drum1'] = 'bd';


 		//Init Song
 		for(var i=1;i<=app.synthCount;i++){
 			app.song['synth' + i] = new Array(app.maxSongLength);
 		}
 		app.song['drum1'] = new Array(app.maxSongLength);

 		//Test Song
 		app.song['drum1'][0] = 1;
 		app.song['drum1'][1] = 1;
 		app.song['drum1'][2] = 1;
 		app.song['drum1'][3] = 1;
 		app.song['drum1'][4] = 2;
 		app.song['drum1'][5] = 2;
 		app.song['drum1'][6] = 2;
 		app.song['drum1'][7] = 3;
 		app.song['drum1'][8] = 2;
 		app.song['drum1'][9] = 2;
 		app.song['drum1'][10] = 2;
 		app.song['drum1'][11] = 3;

 		app.song['synth1'][0] = 2;
 		app.song['synth1'][1] = 2;
 		app.song['synth1'][2] = 2;
 		app.song['synth1'][3] = 2;
 		app.song['synth1'][4] = 1;
 		app.song['synth1'][5] = 1;
 		app.song['synth1'][6] = 1;
 		app.song['synth1'][7] = 1;
 		app.song['synth1'][8] = 3;
 		app.song['synth1'][9] = 3;
 		app.song['synth1'][10] = 3;
 		app.song['synth1'][11] = 3;


 		if(app.testPattern){
 			app.setTestPattern();
 		}
		

	},


	//----------------------------------------------------

	setTestPattern: function(){

		//app.notes['synth1'][1] = [null,'c3','c2','','c2',null,'c3',null,'c2','d2','d#2','c2',null,null,null,null];
		//app.slides['synth1'][1] = [null,null,null,true,true,false,false,false,false,true,true,false,false,false,true,true];

		app.notes['synth1'][1] = new Array(app.patternLength);
		app.notes['synth1'][1][0] = 'c2';


		app.notes['synth1'][2] = ['c2','c2','c2','c2','c2','c2','c3','c2','c2','c2','c2','c2','c2','c2','c2','c2'];


		for(var i=0; i<16; i++){
			app.frequencies['synth1'][1][i] = app.getFrequency(app.notes['synth1'][1][i]);
			app.frequencies['synth1'][2][i] = app.getFrequency(app.notes['synth1'][2][i]);

			//Update table
			$('#r' + (i+1) + 'c1').val(app.notes['synth1'][1][i]);
		}



	},

	//----------------------------------------------------

	toggleDistortion: function(instrument){

		if(app.distortionEnabled[instrument]){
			app.distortionEnabled[instrument] = false;
		} else {
			app.distortionEnabled[instrument] = true;
		}

	},

	//----------------------------------------------------

	toggleDelay: function(instrument){

		if(app.delayEnabled[instrument]){
			app.delayEnabled[instrument] = false;
		} else {
			app.delayEnabled[instrument] = true;
		}

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


	playFrequency: function(instrument, freq, slide, accent, noteTime){

		//app.volume[instrument] = app.tempVolume[instrument];

		if(!isNaN(freq)){

				//Set waveform and detune
				app.oscillator[instrument].type = app.waveform[instrument];
				app.oscillator[instrument].detune.value = app.detunePercentage[instrument]; // value in cents

				//Slide or just set frequency
				if(slide){ 
					console.log('SLLLIIDDEE');
					var speed = 60000 / app.tempo / 4;
					var slideTime = speed / 24 / 100;
					slideTime = 0.06;
					app.oscillator[instrument].frequency.linearRampToValueAtTime(freq, app.context.currentTime + slideTime);
				} else {
					//Set freq
					app.oscillator[instrument].frequency.setValueAtTime(freq,app.context.currentTime);

					//Amp Attack!
					app.gainNode[instrument].gain.setValueAtTime(0,app.context.currentTime);
					app.gainNode[instrument].gain.linearRampToValueAtTime(app.volume[instrument], app.context.currentTime + 0.01);
				}


				/*
				if(!slide){

				    //Set volume and env decay for accented notes
					app.tempVolume[instrument] = app.volume[instrument]; //Temp storage for volume value (to reset after accent)
					if(accent && app.volume[instrument] > 0){
						console.log('ACCENT ALERT!!! :D');
						var volumeAddition = (app.filterParams[instrument]['accent'] / 100) / 4;
						volumeAddition = volumeAddition * app.volume[instrument] * 3.2;
						console.log(volumeAddition);

						app.volume[instrument] = app.volume[instrument] + volumeAddition;
					}
					
				}
				*/

				//Fixes problem when creating a new random pattern half way through playing a note
				if(!app.oscillator[instrument]){
					return;
				}
								
				
				//Filter decay
					app.filter[instrument].frequency.cancelScheduledValues(app.context.currentTime);
					app.filter2[instrument].frequency.cancelScheduledValues(app.context.currentTime);

					//Temp copy of current filter cutoff value
					app.filter[instrument].frequency.value = app.cutoffTempStore[instrument];
					app.filter2[instrument].frequency.value = app.cutoffTempStore[instrument];

					var filterDecayAmount = app.filterParams[instrument]['decayAmount'];
					var filterDecayTime = app.filterParams[instrument]['decayTime'];
					var newFilterCutoff = 100;

					//ACCENT
					if(accent){ 
						console.log('ACCENT ALERT!');
						
						//Set Min decay
						newFilterDecayTime = ( 75 - app.filterParams[instrument]['accent'] ) / 100;
						if(newFilterDecayTime < filterDecayTime){
							filterDecayTime = newFilterDecayTime;
						}

						//Cutoff Wow-------------------------
							var riseTime = (app.filterParams[instrument]['accent'] - 10) * 2 / 10000;
							var wowHigh = app.filter2[instrument].frequency.value + 200;
							
							//Cut Drop
							app.filter[instrument].frequency.setValueAtTime(newFilterCutoff, app.context.currentTime);
							app.filter2[instrument].frequency.setValueAtTime(newFilterCutoff, app.context.currentTime);

							//Fast rise
							app.filter[instrument].frequency.linearRampToValueAtTime(wowHigh, app.context.currentTime + riseTime);
							app.filter2[instrument].frequency.linearRampToValueAtTime(wowHigh, app.context.currentTime + riseTime);

							//Drop
							app.filter[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + riseTime + filterDecayTime);
							app.filter2[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + riseTime + filterDecayTime);
						//End Cutoff Wow---------------------

						
					} else {  //No accent

						app.filter[instrument].frequency.setValueAtTime(app.cutoffTempStore[instrument], app.context.currentTime);
						app.filter2[instrument].frequency.setValueAtTime(app.cutoffTempStore[instrument], app.context.currentTime);
						app.filter[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + filterDecayTime);
						app.filter2[instrument].frequency.linearRampToValueAtTime(newFilterCutoff, app.context.currentTime + filterDecayTime);

					}
					
					
				//End filter decay

				//console.log('Playing ' + freq);
				//console.log(app.oscillator);
				//console.log(app.detunePercentage[instrument]);
			
		}

	},
	

	//----------------------------------------------------


	stopOscillator: function(instrument){

		if(app.oscillator[instrument]){

				//app.oscillator[instrument].disconnect(app.filter[instrument]);

				//app.filter2[instrument].disconnect(app.gainNode[instrument]);
				//app.filter[instrument].disconnect(app.filter2[instrument]);

				////app.gainNode[instrument].gain.linearRampToValueAtTime(0, app.context.currentTime + 0.05);

				//app.volume[instrument] = app.tempVolume[instrument]; //reset volume (could be changed by accent)
				
				app.oscillator[instrument].stop();
				//delete app.oscillator[instrument];

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

		console.log(value);

		if(instrument === 'drum1'){
			value = value * 4 ;
			app.volume[instrument]['master'] = value;
			app.tempVolume[instrument]['master'] = value;
		} else {
			app.tempVolume[instrument] = value;
		}

	},


	//----------------------------------------------------


	setControlKnob: function(instrument, controlName, value, drumName){
		console.log('Instrument: ' + instrument);
		console.log('Control: ' + controlName);
		console.log('Value: ' + value);
		console.log('-------------');

		var drumname = drumName || false;

		//Drum Controls
		if(instrument === 'drum1'){
			if(controlName == 'vol'){
				app.volume['drum1'][drumName] = value / 100;
			}
			return;
		}

		var filter = app.filter[instrument];
		var filter2 = app.filter2[instrument];
		
		//Tuning
		if(controlName == 'tune'){
			app.detunePercentage[instrument] = value * 10;
		}

		//Cutoff frequency
		if(controlName == 'cutoff'){

			var cutoffVal = value * 100;

			filter.frequency.value = cutoffVal;
		 	filter2.frequency.value = cutoffVal;

			//Copy of cutoff value - To use when playing note as filter decay will change cutoff - this value is used to reset it 
			app.cutoffTempStore[instrument] = cutoffVal;

		}

		//Resonance
		if(controlName == 'reso'){
			filter.Q.value = value / 8.5;
			filter2.Q.value = value / 8.5;
		}

		if(controlName == 'envmod'){
			app.filterParams[instrument]['decayAmount'] = value * 100;
		}

		if(controlName == 'decay'){
			app.filterParams[instrument]['decayTime'] = value / 100;
		}

		if(controlName == 'accent'){
			app.filterParams[instrument]['accent'] = value;
		}

	},


	//----------------------------------------------------

	connectNodes: function(instrument){

		app.oscillator[instrument] = app.context.createOscillator();
		app.gainNode[instrument] = app.context.createGain();

		//Filter
		app.oscillator[instrument].connect(app.filter[instrument]);
    	app.filter[instrument].connect(app.filter2[instrument]);

    	//Distortion enabled?
	    if(app.distortionEnabled[instrument]){

	    	var overdrive = new app.tuna.Overdrive({
                outputGain: 0.5,         //0 to 1+
                drive: 0.7,              //0 to 1
                curveAmount: 1,          //0 to 1
                algorithmIndex: 3,       //0 to 5, selects one of our drive algorithms
                bypass: 0
            });

            app.filter2[instrument].connect(overdrive.input);
            overdrive.connect(app.gainNode[instrument]);

	    } else {
	    	app.volume[instrument] = app.volume[instrument];
	    	app.filter2[instrument].connect(app.gainNode[instrument]);
	    }


        //Delay Connections
        if(app.delayEnabled[instrument]){
        	app.gainNode[instrument].connect(app.delay);	
            app.delay.connect(app.feedback);
            app.feedback.connect(app.delay);
            app.feedback.connect(app.gainNode['master']);	
        }

        //Set instr to 0 volume and connect to master
        app.gainNode[instrument].gain.value = 0;
        app.gainNode[instrument].connect(app.gainNode['master']);

        app.gainNode['master'].connect(app.context.destination);

	},

	disconnectNodes: function(instrument){

		//app.gainNode['master'].disconnect(app.gainNode[instrument]);

		app.gainNode[instrument].disconnect(app.filter2[instrument]);
		app.filter2[instrument].disconnect(app.filter[instrument]);

		app.filter[instrument].disconnect(app.oscillator[instrument]);

	},

	
	loadSamples: function(){

		var samplePaths = [];
		samplePaths['bd']   = 'bd01.mp3';
		samplePaths['sd']   = 'sd10.mp3';
		samplePaths['lt']   = 'lt01.mp3';
		samplePaths['mt']   = 'mt01.mp3';
		samplePaths['ht']   = 'ht01.mp3';
		samplePaths['rs']   = 'rs01.mp3';
		samplePaths['cp']   = 'cp02.mp3';
		samplePaths['ch']   = 'hh01.mp3';
		samplePaths['oh']   = 'oh01.mp3';
		samplePaths['cc']   = 'cr01.mp3';
		samplePaths['rc']   = 'rd02.mp3';


		loadSample = function(key, path){

				console.log('Loading key: ' + key + ' - sample: ' + path)

				app.samples[key]; // Create the Sound 
				var getSound = new XMLHttpRequest(); // Load the Sound with XMLHttpRequest
				getSound.open("GET", "samples/909/mp3/" + path, true); // Path to Audio File
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
		
		var i = 0;
		var songBar = -1;

		//Create synth oscillators and connections then start oscillators
		for(var synthID=1; synthID<=app.synthCount; synthID++){

			var instrument = 'synth' + synthID;

			app.connectNodes(instrument);
			

			app.oscillator[instrument].start();

		} //End osc and connections creator


		//Play a step, then call function again
		function nextStep() {

			var speed = 60000 / app.tempo / 4;

			//If song mode - change to the correct pattern for the bar
			//Pattern mode - check if current pattern has been changed
			if(i===0){

				if(!app.songMode){

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

				} else { 
					//Song mode enabled

					//Increase songBar counter
					songBar++;						

					//Loop through the synths - set pattern id's
					for(var synthID=1; synthID<=app.synthCount; synthID++){
						if(app.song['synth' + synthID][songBar]){
							app.patternID['synth' + synthID] = app.song['synth' + synthID][songBar];
							ui.highlightPattern('synth' + synthID, app.patternID['synth' + synthID]);
							ui.updateStepValue('synth' + synthID, app.patternID['synth' + synthID],1);
						}
					}

					if(app.song['drum1'][songBar]){
						app.patternID['drum1'] = app.song['drum1'][songBar];
						ui.highlightPattern('drum1', app.patternID['drum1']);
					}

					ui.highlightSongBlock(songBar);
					

				} //End Song mode check

			} //End pattern change check

			
			var currentFreq = [];
			var slide = [];
			var accent = [];

			//Check if sequence has been stopped			    
			if(!app.sequencePlaying){

				//Stop all synths
				for(var synthID=1; synthID<=app.synthCount; synthID++){
				    app.stopOscillator('synth' + synthID);
				}

		    	return;
		    } 

			//Loop through synths
			for(var synthID=1; synthID<=app.synthCount; synthID++){

				//If song mode is set - check that pattern is set for this block
				if(app.songMode){

					//Check synth pattern is set
					if(app.song['synth' + synthID][songBar]){
						var validPattern = true;
					} else {
						var validPattern = false;
					}

					//check drum pattern is set
					if(app.song['drum1'][songBar]){
						var validDrumPattern = true;
					} else {
						var validDrumPattern = false;
					}


				} else {
					var validPattern = true;
					var validDrumPattern = true;
				}


				if(validPattern){

					//set current freq and slide
					currentFreq['synth' + synthID] = app.frequencies['synth' + synthID][app.patternID['synth' + synthID]][i];
					slide['synth' + synthID] = app.slides['synth' + synthID][app.patternID['synth' + synthID]][i];
					accent['synth' + synthID] = app.accents['synth' + synthID][app.patternID['synth' + synthID]][i];

					//No slides for first note
					if(i===0){
						slide['synth' + synthID] = false;
					}

				    //Play current note
			    	if(currentFreq['synth' + synthID]){
			    		if(!app.mute['synth' + synthID]){
			    			var noteTime = 0.0; //When to play the note
			    			console.log('Playing ' + currentFreq['synth' + synthID] );
			    			app.playFrequency('synth' + synthID, currentFreq['synth' + synthID], slide['synth' + synthID], accent['synth' + synthID], noteTime);
			    		}
			    	} else {
			    		//No note here so cut volume
			    		app.gainNode['synth' + synthID].gain.setValueAtTime(0,app.context.currentTime);
			    	}
				
				} else {

					//Not a valid pattern - Set synth's vol to 0
					app.volume[instrument] = 0;

				}//End valid pattern check
				

			}


	    	//Drums
			playSample = function(key){
				if( app.drums['drum1'][key][app.patternID['drum1']][i] ) {

					//Gain Nodes
					app.gainNode['drum1'] = [];
					app.gainNode['drum1']['master'] = app.context.createGain();
					app.gainNode['drum1']['master'].gain.value = app.volume['drum1']['master'];
					
					app.gainNode['drum1'][key] = app.context.createGain();

					var playSound = app.context.createBufferSource(); // Declare a New Sound
					playSound.buffer = app.samples[key]; // Attatch our Audio Data as it's Buffer
					
					//Set drum volume
					playSound.connect(app.gainNode['drum1'][key]);
					app.gainNode['drum1'][key].gain.value = app.volume['drum1'][key];

					
					
					

					//Distortion enabled?
				    if(app.distortionEnabled['drum1']){
				    	app.gainNode['drum1'][key].connect(app.distortionNode);
				    	app.distortionNode.connect(app.gainNode['drum1']['master']);

				    	//Volume boost (volume is lower when distortion is active)
				    	var drumVolume = app.volume['drum1']['master'] - 0.3	;

				    } else {
				    	var drumVolume = app.volume['drum1']['master']
				    	app.gainNode['drum1'][key].connect(app.gainNode['drum1']['master']);
				    }

				    app.gainNode['drum1']['master'].connect(app.gainNode['master']);
					app.gainNode['master'].connect(app.context.destination);  // Link the Sound to the Output






					playSound.start(0); // Play the Sound Immediately
				}
			}

			//Play drum sounds if not muted
			if(!app.mute['drum1'] && validDrumPattern){
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

		//Stop Synths
		for(var synthID=1; synthID<=app.synthCount; synthID++){
				var instrument = 'synth' + synthID;
				app.disconnectNodes(instrument);
				app.oscillator[instrument].stop();
				delete app.oscillator[instrument];
		}

		//Stop Drums


	},



}; //End App

//Run!
app.init();