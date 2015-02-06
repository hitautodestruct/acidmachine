var ui = {

	init: function(){

		var currentStep,clickedNote,octave,patternID;

		octave = 1;
		patternID = 1;

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
		$(function() {
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
       			'fgColor':'#333333'
       		});
    	});

		//Step Up / Down
		$('#synth1_step_up').click(function(){
			currentStep = parseInt($('#synth1_step').html());
			if( (currentStep) < 16 ){
				$('#synth1_step').html(currentStep + 1);
			}
			currentStep = parseInt($('#synth1_step').html());

			//Update the selected key for this step
			ui.updateStepValue('synth1', patternID, currentStep);

		});

		$('#synth1_step_down').click(function(){
			currentStep = parseInt($('#synth1_step').html());
			if( (currentStep) > 1 ){
				$('#synth1_step').html(currentStep - 1);
			}
			currentStep = parseInt($('#synth1_step').html());

			//Update the selected key for this step
			ui.updateStepValue('synth1', patternID, currentStep);
		});

		//Note Clicked
    	$('.btn-note').click(function(){

    		//Highlight Note
    		$('.btn-note').not(this).removeClass('btn-note-highlight');
    		$(this).toggleClass('btn-note-highlight');

    		//Add note to table at current step
    		clickedNote = $(this).html() + octave;
   			currentStep = $('#synth1_step').html()
   			$('#r' + currentStep + 'c1').val(clickedNote);

   			//Create note array for this pattern if it does not exist
   			if(typeof app.notes['synth1'][patternID] == 'undefined' || !(app.notes['synth1'][patternID] instanceof Array) ){
   				app.notes['synth1'][patternID] = new Array(app.patternLength);
   			}

   			//Create frequency array for this pattern if it does not exist
   			if(typeof app.frequencies['synth1'][patternID] == 'undefined' || !(app.frequencies['synth1'][patternID] instanceof Array) ){
   				app.frequencies['synth1'][patternID] = new Array(app.patternLength);
   			}

   			//Add note and frequency to arrays
   			app.notes['synth1'][patternID][currentStep-1] = $(this).html();
   			app.frequencies['synth1'][patternID][currentStep-1] = app.getFrequency(clickedNote.toLowerCase());

   			


    	});
	

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

}; //End ui


ui.init();