var ui = {

	patternID: [],

	init: function(){

		var currentStep,clickedNote,octave;

		octave = 1;

		ui.patternID['synth1'] = 1;

		//Key Press - Play note - if not already playing 
		window.addEventListener("keydown", function(e){			
			
			var keyCode = (typeof e.which == "number") ? e.which : e.keyCode;

			if(keyCode == 32){ //Space Bar - Start/Stop
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


		});

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

		//Create Knobs
   		$(".dial").knob({
   			'min':0,
   			'max':127,
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


		//Step Up
		$('.js-synth-step-up').click(function(){

			var instrumentName = $(this).data('instrument-name');

			currentStep = parseInt($('#' + instrumentName + '_step').html());

			if( (currentStep) < 16 ){
				$('#' + instrumentName + '_step').html(currentStep + 1);
			}
			currentStep = parseInt($('#' + instrumentName + '_step').html());

			//Update the selected key for this step
			ui.updateStepValue(instrumentName, ui.patternID[instrumentName], currentStep);

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
			ui.updateStepValue(instrumentName, ui.patternID[instrumentName], currentStep);
		});



		//Randomize
		$('.btn-randomize').mousedown(function(){

			ui.randomize( $(this).data('instrument-name') );

			$(this).addClass('btn-note-highlight');

		});

		$('.btn-randomize').mouseup(function(){
			$(this).removeClass('btn-note-highlight');
		});


		//Note Clicked
    	$('.btn-note').click(function(){

    		var instrumentName = $(this).data('instrument-name');

    		//Highlight Note
    		$('.btn-note').not(this).removeClass('btn-note-highlight');
    		$(this).toggleClass('btn-note-highlight');

   			currentStep = $('#' + instrumentName + '_step').html()

    		//Check note is highlighted
    		if( $(this).hasClass('btn-note-highlight') ){

    			//Add note to table at current step
	    		clickedNote = $(this).html() + octave;
	   			$('#r' + currentStep + 'c1').val(clickedNote);

	   			//Add note and frequency to arrays
	   			app.notes[instrumentName][ui.patternID[instrumentName]][currentStep-1] = $(this).html();
	   			app.frequencies[instrumentName][ui.patternID[instrumentName]][currentStep-1] = app.getFrequency(clickedNote.toLowerCase());

    		} else {
    			//Note was un-highlighted - Clear array element for note and frequency
    			$('#r' + currentStep + 'c1').val('');
	   			app.notes[instrumentName][ui.patternID[instrumentName]][currentStep-1] = null;
	   			app.frequencies[instrumentName][ui.patternID[instrumentName]][currentStep-1] = null;
    		}

   			console.log(app.notes[instrumentName][ui.patternID[instrumentName]]);
   			console.log(app.frequencies[instrumentName][ui.patternID[instrumentName]]);

    	}); //End Note Clicked

		

	},

	//----------------------------------------------------

	updateStepValue: function(instrument, patternID, currentStep){

		//Get the note for the selected instument, pattern Id and current step
		var highlightNote = app.notes[instrument][patternID][currentStep-1];

		//If there is a note - highlight it
		if(highlightNote){
			
			highlightNote = highlightNote.replace('#','\\#');
			$('.btn-note').removeClass('btn-note-highlight');
   			$('#' + instrument + '_' + highlightNote).toggleClass('btn-note-highlight');

		} else {
			$('.btn-note').removeClass('btn-note-highlight');
		}

	},

	//----------------------------------------------------

	//Randomize the notes in an instrument (Randomizes in blocks of 4, randomly decides whether to use current or previous block)
	randomize: function(instrument){

		//Split pattern length into 4 chunks
		var chunks = [];
		var patternChunkLength = app.patternLength / 4;
		var randomNotes = [];
		var noteOctave = 1;

		//Loop through the 4 chunks
		for(var chunk=0; chunk<4; chunk++){

			chunks[chunk] = []; 

			//Loop through the steps in this chunk
			for(var i=0; i<patternChunkLength; i++){

				//Get a random number to select a note ( higher number used than available notes so that we sometimes get a blank note)
				var randomNumber = Math.floor( Math.random() * 18);
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
				app.notes[instrument][ui.patternID[instrument]][i] = randomNotes[i];
				app.frequencies[instrument][ui.patternID[instrument]][i] = app.getFrequency(randomNotes[i]+noteOctave);	
				$('#r' + (i+1) + 'c1').val(randomNotes[i]+noteOctave);
			} else {
				app.notes[instrument][ui.patternID[instrument]][i] = null;
				app.frequencies[instrument][ui.patternID[instrument]][i] = null;	
				$('#r' + (i+1) + 'c1').val(null);
			}
		}
		

		//Highlight the correct note at the current step
		var currentStep = parseInt($('#' + instrument + '_step').html());
		ui.updateStepValue(instrument, ui.patternID[instrument], currentStep);

		console.log(app.notes[instrument][ui.patternID[instrument]]);
		console.log(app.frequencies[instrument][ui.patternID[instrument]]);

	} //End randomize

}; //End ui


ui.init();