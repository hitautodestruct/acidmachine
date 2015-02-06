var app = {

	context: null,
	oscillator: [],
	gainNode: null,
	frequency: 100,
	volume: 0.08,
	waveform: 'square',
	octave: 5,
	detunePercentage: 0,
	keyCode: 1,
	keyDown: false,
	soundPlaying: false,
	keyboardPlaying: [],
	sequencePlaying: false,
	currentCell: '0-1',
	patternLength: 16,
	rowSkip: 1, //Rows to jump after adding a note
	lastFrequency: [],
	notes:[], //To store patterns
	frequencies:[], //To store frequencies



	//----------------------------------------------------


	init: function(){

		//Create Context
		app.context = new (window.AudioContext || window.webkitAudioContext)();

		app.notes['synth1'] = [];
		app.frequencies['synth1'] = [];

		
		app.oscillator[0] = [];
		app.oscillator[1] = null;
		app.oscillator[2] = null;
		app.oscillator[3] = null;
		app.oscillator[4] = null;
		

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

		return noteFreq[note];

	},


	//----------------------------------------------------


	playFrequency: function(freq){

		if(!isNaN(freq)){



				app.oscillator[col] = app.context.createOscillator();
				app.gainNode = app.context.createGain();

				//Connect oscillator to gainNode to speakers
				app.oscillator[col].connect(app.gainNode);
				app.gainNode.connect(app.context.destination);

				//Osc settings
				app.frequency[col] = freq;
				app.gainNode.gain.value = app.volume;
				app.oscillator[col].type = app.waveform;
				app.oscillator[col].frequency.value = freq; // value in hertz
				app.oscillator[col].detune.value = app.detunePercentage; // value in cents
				app.oscillator[col].start();

				//console.log('Playing ' + freq);

			
		}

	},
	

	//----------------------------------------------------


	stopFrequency: function(freq){


		if(!isNaN(freq)){
			
			if(app.oscillator[col]){

					app.oscillator[col].disconnect(app.gainNode);
					app.gainNode.connect(app.context.destination);

					//console.log('Stopping ' + freq)
					app.oscillator[col].stop();
					delete app.oscillator[col];

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


	playSequence: function(){

		//Do nothing if already playing
		if(app.sequencePlaying){
			return;
		}

		app.sequencePlaying = true;
		var speed = 100;
		var i = 0;

		//Play a row, then call function again
		function nextRow() {

			i++;

		    //Check if sequence has been stopped
		    if(!app.sequencePlaying){

		    	for(var col=1; col<=4; col++){
		    		app.stopFrequency(lastFrequency[col]);
		    		lastFrequency[col] = false;
		    	}
		    	return;	
		    } 
			

	    	//Stop previous note 
		    if(app.frequencies['synth1'][1][i-1]){
		    		app.stopFrequency(app.frequencies['synth1'][1][i-1]);
		    }

	    	if(app.frequencies['synth1'][1][i]){
	    		app.playFrequency(frequency);
	    	}


		    //Next row
		    if(i<app.patternLength) {
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

		for(var i=1;i<=4;i++){
			if(app.oscillator[i]){
				app.oscillator[i].stop();
			}
			delete app.oscillator[i];
		}	

	},



}; //End App

//Run!
app.init();