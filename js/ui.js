var ui = {

	patternID: [],

	mouseDown: false,

	init: function(){

		//Disable highlighting of text etc
		$(document).bind('selectstart dragstart', function(evt){ 
			evt.preventDefault(); 
			return false; 
		});


		var currentStep,clickedNote,octave;

		octave = app.octave;

		//Key Press  
		window.addEventListener("keydown", function(e){			
			
			var keyCode = (typeof e.which == "number") ? e.which : e.keyCode;

			if(keyCode == 32){ //Space Bar - Start/Stop

				e.preventDefault();

				if(app.sequencePlaying){
					app.stopSequence();
					$('#play_button').removeClass('btn-pushed');
					$('#stop_button').addClass('btn-pushed');
					setTimeout(function(){ 
						$('#stop_button').removeClass('btn-pushed');
					}, 100);

				}  else {
					$('#play_button').addClass('btn-pushed');
					app.playSequence();
				}
			}


			//Temp mute keys---
			//D
			if(keyCode == 68){
				muteDrums();
			}
			//S
			if(keyCode == 83){
				muteSynth();
			}
			//R - randomise
			if(keyCode == 82){
				ui.randomize('synth1');
			}
			//---


		}); //End Keyboard Listener


		//Play Button
		$('#play_button').click(function(){ 
			app.playSequence();
			$('#play_button').addClass('btn-pushed');
		});

		//Stop Button
		$('#stop_button').mousedown(function(){ 
			app.stopSequence();
			$('#play_button').removeClass('btn-pushed');
			$('.channel-row-highlight').removeClass('channel-row-highlight');
			$('#stop_button').addClass('btn-pushed');
		});

		$('#stop_button').mouseup(function(){ 
			$(this).removeClass('btn-pushed');
		});


		//Detect and set var for mousedown - used for dragging across pads on drum machine		
		$(document).mousedown(function() {
		    ui.mouseDown = true;
		}).mouseup(function() {
		    ui.mouseDown = false;  
		});

		//Temp Mute functions------

		//Temp mute drums function
		function muteDrums(){
			$('#muteDrums').toggleClass('btn-note-highlight');
			if(!app.mute['drum1']){
				app.mute['drum1'] = true;
			} else {
				app.mute['drum1'] = false;
			}
		}

		$('#muteDrums').click(function(){
			muteDrums();
		});

		//Temp mute synth function
		function muteSynth(){
			$('#muteSynth').toggleClass('btn-note-highlight');
			if(!app.mute['synth1']){
				app.mute['synth1'] = true;
			} else {
				app.mute['synth1'] = false;
			}
		}

		$('#muteSynth').click(function(){
			muteSynth();
		});
		//End mute functions


		//Create Knobs
   		$(".dial").knob({
   			'angleOffset':-125,
   			'angleArc':250,
   			'width':48,
   			'height':48,
   			'thickness':0.7,
   			'displayInput':false,
   			'bgColor':'#aaaaaa',	
   			'fgColor':'#333333',

   			'change' : function(v){
   				var value = v;

   				//Get the input name (contains instrument name and control name)
   				var inputName = this.$.context.name;

   				inputName = inputName.split('_');

   				var instrumentName = inputName[0];
   				var controlName = inputName[1];

   				app.setControlKnob(instrumentName, controlName, value);
   				
   			}
   			

   		});

   		//Create Knobs
   		$(".dial-drum").knob({
   			'angleOffset':-125,
   			'angleArc':250,
   			'width':32,
   			'height':32,
   			'thickness':0.7,
   			'displayInput':false,
   			'bgColor':'#aaaaaa',	
   			'fgColor':'#333333',

   			'change' : function(v){
   				var value = v;

   				//Get the input name (contains instrument name)
   				var inputName = this.$.context.name;

   				inputName = inputName.split('_');

   				var instrumentName = inputName[0];
   				var drumName = inputName[1];
   				var controlName = inputName[2];

   				app.setControlKnob(instrumentName, controlName, value, drumName);
   				
   			}
   			

   		});


   		//Create Sliders
		$( ".js-instrument-vol-slider" ).slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 20,
			value: 18,
			slide: function( event, ui ) {
				var instrumentName = $(this).data('instrument-name');
				app.setInstrumentVolume(instrumentName, ui.value);
			}
		});


   		//Highlight init patterns
   		$('#pattern_synth1_' + app.patternID['synth1']).addClass('btn-note-highlight');
   		$('#pattern_synth2_' + app.patternID['synth2']).addClass('btn-note-highlight');

   		$('#pattern_drum1_' + app.patternID['drum1']).addClass('btn-note-highlight');


		//Step Up
		$('.js-synth-step-up').click(function(){

			var instrumentName = $(this).data('instrument-name');

			currentStep = parseInt($('#' + instrumentName + '_step').html());

			if( (currentStep) < 16 ){
				$('#' + instrumentName + '_step').html(currentStep + 1);
			}
			currentStep = parseInt($('#' + instrumentName + '_step').html());

			//Update the selected key for this step
			ui.updateStepValue(instrumentName, app.patternID[instrumentName], currentStep);

		});

		//Step Down
		$('.js-synth-step-down').click(function(){

			var instrumentName = $(this).data('instrument-name');

			currentStep = parseInt($('#' + instrumentName + '_step').html());

			if( (currentStep) > 1 ){
				$('#' + instrumentName + '_step').html(currentStep - 1);
			}
			currentStep = parseInt($('#' + instrumentName + '_step').html());

			//Update the selected key for this step
			ui.updateStepValue(instrumentName, app.patternID[instrumentName], currentStep);
		});



		//Randomize
		$('.btn-randomize').mousedown(function(){

			ui.randomize( $(this).data('instrument-name') );

			$(this).addClass('btn-note-highlight');

		});

		$('.btn-randomize').mouseup(function(){
			$(this).removeClass('btn-note-highlight');
		});


		//Waveform selection
		$('.js-waveform-toggle').click(function(){
			$(this).children('.toggle-switch-h').toggleClass('toggle-switch-h-right');
			var instrumentName = $(this).data('instrument-name');
			app.toggleWaveform(instrumentName);
		});


		//Note Clicked
    	$('.js-note').click(function(){

    		var instrumentName = $(this).data('instrument-name');
    		var noteOctave = app.octave;

    		//Check if one of the octave buttons is pressed
    		if( $('.js-octave-btn-up').hasClass('btn-note-highlight') ){
    			noteOctave = noteOctave + 1;
    		} else if ( $('.js-octave-btn-down').hasClass('btn-note-highlight') ) {
    			noteOctave = noteOctave - 1;
    		}

    		//Highlight Note
    		$('.js-note[data-instrument-name="' + instrumentName + '"]').not(this).removeClass('btn-note-highlight');
    		$(this).toggleClass('btn-note-highlight');

   			currentStep = $('#' + instrumentName + '_step').html()

    		//Check note is highlighted
    		if( $(this).hasClass('btn-note-highlight') ){

    			//Add note to table at current step
	    		clickedNote = $(this).html() + noteOctave;
	   			$('#r' + currentStep + 'c1').val(clickedNote);

	   			//Add note and frequency to arrays
	   			app.notes[instrumentName][app.patternID[instrumentName]][currentStep-1] = $(this).data('note').toLowerCase() + noteOctave;
	   			app.frequencies[instrumentName][app.patternID[instrumentName]][currentStep-1] = app.getFrequency(clickedNote.toLowerCase());

    		} else {
    			//Note was un-highlighted - Clear array element for note and frequency
    			$('#r' + currentStep + 'c1').val('');
	   			app.notes[instrumentName][app.patternID[instrumentName]][currentStep-1] = null;
	   			app.frequencies[instrumentName][app.patternID[instrumentName]][currentStep-1] = null;
    		}

   			console.log(app.notes[instrumentName][app.patternID[instrumentName]]);
   			console.log(app.frequencies[instrumentName][app.patternID[instrumentName]]);

    	}); //End Note Clicked


		//Octave up / down buttons
		$('.js-octave-btn').click(function(){
			//Remove highlight from other button when clicked
			$('.js-octave-btn').not(this).removeClass('btn-note-highlight');
			
			//Add highlight to this button
			$(this).toggleClass('btn-note-highlight');

			//Re-set the note and frequency for this step
			var instrumentName = $(this).data('instrument-name');
			var currentStep = $('#' + instrumentName + '_step').html();
			var oldNote = app.notes[instrumentName][app.patternID[instrumentName]][currentStep-1];
			oldNote = oldNote.slice(0, -1); //Remove the octave from the old note
			
			//Check if up or down was pressed
			if( $(this).data('direction') === 'up') {
				
				if( $(this).hasClass('btn-note-highlight') ){
					var noteOctave = app.octave + 1;
				} else {
					var noteOctave = app.octave;
				}

			} else {

				if( $(this).hasClass('btn-note-highlight') ){
					var noteOctave = app.octave - 1;
				} else {
					var noteOctave = app.octave;
				}

			}
			
			//Note with new octave number tagged onto end
			var newNote = oldNote + noteOctave;

			//Set note and frequency
   			app.notes[instrumentName][app.patternID[instrumentName]][currentStep-1] = newNote;
   			app.frequencies[instrumentName][app.patternID[instrumentName]][currentStep-1] = app.getFrequency(newNote);

   			//Update note table
   			$('#r' + currentStep + 'c1').val(newNote);

		}); //End octave up/down buttons

		
		//Slide button
		$('.js-slide-btn').click(function(){
			$('.js-slide-btn').not(this).removeClass('btn-note-highlight');
			$(this).toggleClass('btn-note-highlight');
			var instrumentName = $(this).data('instrument-name');
			var currentStep = $('#' + instrumentName + '_step').html();

			var slide = false;
			
			if( $(this).hasClass('btn-note-highlight') ){
				var slide = true;
			}

			//Update slides array
			app.slides[instrumentName][app.patternID[instrumentName]][currentStep-1] = slide;

			console.log(app.slides);

		});


		//Pattern select
		$('.js-pattern-select').click(function(){
			var instrumentName = $(this).data('instrument-name');
			var patternNumber =  $(this).data('pattern-number');
			var currentStep = $('#' + instrumentName + '_step').html();
			app.nextPattern[instrumentName] = patternNumber;

			$('.js-pattern-select[data-instrument-name="' + instrumentName + '"]').removeClass('btn-pattern-waiting');
			
			//Set button to waiting mode if playing otherwise - highlight instantly
			if(app.sequencePlaying){
				$(this).addClass('btn-pattern-waiting');
			} else {
				$('.js-pattern-select[data-instrument-name="' + instrumentName + '"]').removeClass('btn-note-highlight');
				$(this).addClass('btn-note-highlight');

				if(instrumentName==='drum1'){
					ui.updateDrumPads(patternNumber);
				}
				
				ui.updateStepValue(instrumentName,patternNumber,currentStep);
				
			}

		});

		//Distortion click
		$('.js-instrument-dist-btn').click(function(){
			var instrument = $(this).data('instrument-name');
			app.toggleDistortion(instrument);
			$(this).toggleClass('btn-note-highlight');
		});

		//Delay click
		$('.js-instrument-delay-btn').click(function(){
			var instrument = $(this).data('instrument-name');
			app.toggleDelay(instrument);
			$(this).toggleClass('btn-note-highlight');
		});

		//Drum Pad Click
		$('.js-drumpad').mousedown(function(){
			ui.drumpadClick(this);
		});

		//Drum Pad drag over
		$('.js-drumpad').mouseover(function(){
			if(ui.mouseDown){
				ui.drumpadClick(this);
			}
		});

		//Update currently selected drum
		$('.btn-drum-selector').click(function(){
			
			if( !$(this).hasClass('btn-drum-selector-highlight') ){
				var instrument = $(this).data('instrument-name');
				$('.btn-drum-selector').removeClass('btn-drum-selector-highlight');
				$(this).addClass('btn-drum-selector-highlight');
				app.selectedDrum[instrument] = $(this).data('drum-name');
				ui.updateDrumPads(app.patternID['drum1']);
			}

		});

		//Highlight initial drum selection
		$('.btn-drum-selector[data-drum-name="' + app.selectedDrum['drum1'] + '"]').addClass('btn-drum-selector-highlight');
		ui.updateDrumPads(app.patternID['drum1']);



		//Update drum volume knobs
		for(key in app.drums['drum1']){
			ui.updateDrumVolKnob(key);
		}	

		$('.js-seq-block').click(function(){
			ui.sequencerBlockClick(this);
		});

		//Tempo
		$('.js-tempo').val(app.tempo);
		$('.js-tempo').change(function(){
			var newTempo = parseInt( $(this).val() );
			if(!isNaN(newTempo)){
				app.tempo = newTempo;
			}
		});

		ui.initSong();


	},

	//----------------------------------------------------

	initSong: function(){
		for(var i=0; i<app.songLength;i++){

			//Loop through synths and create song blocks
			for(var synthID=1; synthID<=app.synthCount; synthID++){
				var patternID = app.song['synth' + synthID][i];
				if(patternID){
					$('#seq_synth' + synthID + '_' + i).
					removeClass('seq-block').
					addClass('sequencer-block').
					addClass('btn-note-highlight').
					html(patternID);	

				}

				//Init distortion button for this synth
				if(app.distortionEnabled['synth' + synthID]){
					$('.js-instrument-dist-btn[data-instrument-name="synth' + synthID + '"]').addClass('btn-note-highlight');
				}

				//Init delay button for this synth
				if(app.delayEnabled['synth' + synthID]){
					$('.js-instrument-delay-btn[data-instrument-name="synth' + synthID + '"]').addClass('btn-note-highlight');
				}


			}	

			//Create drum song blocks
			var patternID = app.song['drum1'][i];
			if(patternID){
				$('#seq_drum1_' + i).
				removeClass('seq-block').
				addClass('sequencer-block').
				addClass('btn-note-highlight').
				html(patternID);	
			}

		}
	},

	//----------------------------------------------------

	sequencerBlockClick: function(that){
		var songBar = $(that).data('song-bar');
		var instrumentName = $(that).data('instrument-name');

		if( $(that).hasClass('sequencer-block') ){
			app.song[instrumentName][songBar] = null;

			$(that).
			addClass('seq-block').
			removeClass('sequencer-block').
			removeClass('btn-note-highlight').
			html('');	

		} else {

			app.song[instrumentName][songBar] = app.patternID[instrumentName];

			$(that).
			removeClass('seq-block').
			addClass('sequencer-block').
			addClass('btn-note-highlight').
			html(app.patternID[instrumentName]);
		
		}

	},

	//----------------------------------------------------

	highlightSongBlock: function(blockID){

		$('.sequencer-block-darken').removeClass('sequencer-block-darken');
		$('.js-seq-column-' + blockID).addClass('sequencer-block-darken');

	},

	//----------------------------------------------------

	updateDrumVolKnob: function(key){
		var value = app.volume['drum1'][key] * 100;
		$('.dial-drum[name="drum1_' + key + '_vol"]').val(value).trigger('change');
	},

	//----------------------------------------------------

	drumpadClick: function(that){

		$(that).toggleClass('btn-drum-highlight-2');

		//Update drum pattern
		var instrument = $(that).data('instrument-name');
		var selectedDrum = app.selectedDrum[instrument];
		var step = $(that).data('drum-step');

		if( $(that).hasClass('btn-drum-highlight-2') ){
			app.drums[instrument][selectedDrum][app.patternID[instrument]][step] = true;
		} else if (app.drums[instrument][selectedDrum][app.patternID[instrument]][step]){
			app.drums[instrument][selectedDrum][app.patternID[instrument]][step] = false;
		}

	},

	//----------------------------------------------------

	updateDrumPads: function(patternID){

		var instrument = 'drum1';
		var selectedDrum = app.selectedDrum[instrument];
		var currentDrumStep = app.drums[instrument][selectedDrum][patternID];

		$('.btn-drum-highlight-2').removeClass('btn-drum-highlight-2');
		$('.btn-drum-highlight-1').removeClass('btn-drum-highlight-1');

		//Loop through pattern steps
		for(var i=0; i<16; i++){

			if(currentDrumStep[i]){
				console.log('js-drumpad-' + i );
				$('.js-drumpad-' + i ).addClass('btn-drum-highlight-2');
			}

		}

	},

	//----------------------------------------------------	

	updateStepValue: function(instrument, patternID, currentStep){

		//Do nothing for drums
		if(instrument === 'drum1'){
			return;
		}

		//Get the note for the selected instument, pattern Id and current step
		var highlightNote = app.notes[instrument][patternID][currentStep-1];

		//If there is a note - highlight it
		if(highlightNote){

			//Get the octave of this note (last char)
			var noteOctave = highlightNote.slice(-1);

			//If octave is different than main octave - highlight the relevant octave button
			if(noteOctave > app.octave){
				$('.js-octave-btn[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
				$('.js-octave-btn-up[data-instrument-name="' + instrument + '"]').addClass('btn-note-highlight');
			} else if(noteOctave < app.octave){
				$('.js-octave-btn[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
				$('.js-octave-btn-down[data-instrument-name="' + instrument + '"]').addClass('btn-note-highlight');
			} else {
				$('.js-octave-btn[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
			}

			//Remove octave from end
			highlightNote = highlightNote.slice(0, -1); 
			
			highlightNote = highlightNote.replace('#','\\#');
			$('.js-note[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
   			$('#' + instrument + '_' + highlightNote).toggleClass('btn-note-highlight');

		} else {
			$('.js-note[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
			$('.js-octave-btn[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
		}

		//Set slide button
		var slide = app.slides[instrument][patternID][currentStep-1];
		if(slide){
			$('.js-slide-btn[data-instrument-name="' + instrument + '"]').addClass('btn-note-highlight');
		} else {
			$('.js-slide-btn[data-instrument-name="' + instrument + '"]').removeClass('btn-note-highlight');
		}

	},

	//----------------------------------------------------

	//Randomize the notes in an instrument (Randomizes in blocks of 4, randomly decides whether to use current or previous block)
	randomize: function(instrument){

		//Split pattern length into 4 chunks
		var chunks = [];
		var patternChunkLength = app.patternLength / 4;
		var randomNotes = [];
		var noteOctave = app.octave;

		//Loop through the 4 chunks
		for(var chunk=0; chunk<4; chunk++){

			chunks[chunk] = []; 

			//Loop through the steps in this chunk
			for(var i=0; i<patternChunkLength; i++){

				//Get a random number to select a note ( higher number used than available notes so that we sometimes get a blank note)
				var randomNumber = Math.floor( Math.random() * (app.availableNotes.length + 6) );
				var randomNote = app.availableNotes[randomNumber];

				if(randomNote){
					chunks[chunk][i] = randomNote;
				} else {
					chunks[chunk][i] = null;
				}

			}

			//Randomly decide if this or the previous chunk should be added to the random array 
			var selectedChunk = chunk;
			
			if(chunk>0){
				if( Math.floor( Math.random() *2 ) == 1){
					selectedChunk = chunk-1;
				}
			}

			//Join this chunk to the main array
			randomNotes = randomNotes.concat(chunks[selectedChunk]);

		}


		//Loop through each step and set the note
		for(i=0; i<app.patternLength; i++){
			if(randomNotes[i]){

				//Randomise octave up or down
				var octaveRand = Math.floor( Math.random() * 10);
				if( octaveRand == 1){
					noteOctave = app.octave + 1;
				} else if ( octaveRand == 2 ){
					noteOctave = app.octave - 1;
				} else {
					noteOctave = app.octave;
				}

				//Randomise Slide
				var slideRand = Math.floor( Math.random() * 10 );
				var slide = false;
				if(slideRand < 3){
					slide = true;
				} 

				app.slides[instrument][app.patternID[instrument]][i] = slide;

				app.notes[instrument][app.patternID[instrument]][i] = randomNotes[i] + noteOctave;
				app.frequencies[instrument][app.patternID[instrument]][i] = app.getFrequency(randomNotes[i]+noteOctave);	
				$('#r' + (i+1) + 'c1').val(randomNotes[i]+noteOctave);
			} else {
				app.notes[instrument][app.patternID[instrument]][i] = null;
				app.frequencies[instrument][app.patternID[instrument]][i] = null;	
				$('#r' + (i+1) + 'c1').val(null);
			}
		}
		

		//Highlight the correct note at the current step
		var currentStep = parseInt($('#' + instrument + '_step').html());
		ui.updateStepValue(instrument, app.patternID[instrument], currentStep);

		console.log(app.notes[instrument][app.patternID[instrument]]);
		console.log(app.frequencies[instrument][app.patternID[instrument]]);

	}, //End randomize

	//----------------------------------------------------

	highlightPattern: function(instrumentName, patternID){
		$('.js-pattern-select[data-instrument-name="' + instrumentName + '"]').removeClass('btn-note-highlight');
		$('.js-pattern-select[data-instrument-name="' + instrumentName + '"]').removeClass('btn-pattern-waiting');
		$('#pattern_' + instrumentName + '_' + patternID).addClass('btn-note-highlight');
		
		if(instrumentName === 'drum1') {
			ui.updateDrumPads(patternID);
		}
	}


}; //End ui


ui.init();