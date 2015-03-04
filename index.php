<?php
$notes=explode(',','C,C#,D,D#,E,F,F#,G,G#,A,A#,B,C');
$sequencerBarLimit = 640;
?>
<html>
<title>Audio Test</title>
<head>
<link rel="stylesheet" type="text/css" href="css/reset.css">
<link rel="stylesheet" type="text/css" href="css/bootstrap_grid.min.css">
<link rel="stylesheet" type="text/css" href="css/style.css">
<link rel="stylesheet" type="text/css" href="css/jquery-ui.css">
</head>
<body>

	<div class="container">

		<div class="row top-row">
			
						
			<div class="col-xs-2 options transport-options container-padding">
				<div class="btn ib" id="play_button">Play</div><!--
			 --><div class="btn ib" id="stop_button">Stop</div>
			</div>
			<div class="col-xs-2 title-block">
				<div class="" style="margin:0 !important;">
					<label>Tempo</label><br>
					<input type="number" min="1" max="500" class="js-tempo" value="">
				</div>
			</div>
			<div class="col-xs-6 title-block">
				<span class="pull-right" style="padding-right:32px;">ACID MACHINE</span>
			</div>
			<div class="col-xs-2 title-block">
				<div class="pull-right">
					<?php for($i=1; $i<=4; $i++) : ?><div class="ib tempo-light <?=($i==1 ? 'tempo-light-on' : '');?>"></div><?php endfor;?>
				</div>
			</div>
		</div>

		<div class="spacer-vertical"></div>

		<?php for($synthID=1;$synthID<=2;$synthID++) : ?>

		<div class="row">
			
			<!--Synth <?=$synthID;?> Pattern Selector-->
			<div class="col-xs-2 panel-bg">
				<div id="muteSynth" class="panel-light" style="display:none;"></div>
				<?php for($i=1;$i<=8;$i++) : ?>
					<div class="ib pattern-select-btn btn-note btn-synth js-pattern-select" data-instrument-name="synth<?=$synthID;?>" data-pattern-number="<?=$i;?>" id="pattern_synth<?=$synthID;?>_<?=$i;?>"><?=$i;?></div>
				<?php endfor; ?>
			</div>

			<!--Synth <?=$synthID;?> Main-->
			<div class="col-xs-8 synth-main instrument-shadow">
				
				<!--Controls Row-->
				<div class="row synth-controls-row">
					
					<div class="col-xs-2 border-right waveform-toggle-container">
						Waveform

						<br>
						
						<span class="ib">Sw</span>
						<div class="toggle-switch-bg js-waveform-toggle ib" data-instrument-name="synth<?=$synthID;?>">
							<div class="toggle-switch-h"></div>
						</div>
						<span class="ib">Sq</span>

					</div>

					<div class="col-xs-8 border-right knobs">

						<div class="row">

							<div class="col-xs-2">
								Tune
								<input type="text" value="<?=($synthID==2 ? '120' : '0');?>" class="dial" name="synth<?=$synthID;?>_tune" data-min="-120" data-max="120">
							</div>

							<div class="col-xs-2">
								Cutoff
								<input type="text" value="100" class="dial" name="synth<?=$synthID;?>_cutoff" data-min="5" data-max="100">
							</div>

							<div class="col-xs-2">
								Reso
								<input type="text" value="15" class="dial" name="synth<?=$synthID;?>_reso"  data-min="0" data-max="90">
							</div>

							<div class="col-xs-2">
								Env.Mod
								<input type="text" value="75" class="dial" name="synth<?=$synthID;?>_envmod" data-min="1" data-max="100">
							</div>

							<div class="col-xs-2">
								Decay
								<input type="text" value="70" class="dial" name="synth<?=$synthID;?>_decay" data-min="10" data-max="70">
							</div>

							<div class="col-xs-2">
								Accent
								<input type="text" value="0" class="dial" name="synth<?=$synthID;?>_accent" data-min="0" data-max="100">
							</div>

						</div>

					</div>
					
					<div class="col-xs-2 current-step-container">
						Current Step
						<div class="synth-lcd ib" id="synth<?=$synthID;?>_step">1</div><div class="ib">
							<div class="btn-synth btn-small js-synth-step-up"  data-instrument-name="synth<?=$synthID;?>">UP</div>
							<div class="btn-synth btn-small js-synth-step-down"  data-instrument-name="synth<?=$synthID;?>">DN</div>
						</div>
					</div>

				</div><!--End Controls Row-->
				
				<div class="row" style="">
					<div class="col-xs-2 synth-label-bg"></div>
					<div class="col-xs-7 tiny-text synth-label-bg" style="padding-left:2px;">Notes</div>
					<div class="col-xs-3 tiny-text synth-label-bg">
						<div class="row">
							<div class="col-xs-6">Octave</div>
							<div class="col-xs-6">Accent / Slide</div>
						</div>
					</div>
				</div>

				<!--Keyboard Row-->
				<div class="row keyboard-row">
						
					<div class="col-xs-2">
						Randomize
						<div class="btn-synth btn-randomize" data-instrument-name="synth<?=$synthID;?>">

						</div>
					</div>
					
					<div class="col-xs-7" style="padding:0;">

						<div class="keyboard-container" style="">
							<?php for($i=0;$i<count($notes);$i++) :

								$btnBlack = '';

								//If this is a sharp note
								if(strlen($notes[$i])>1){
									$btnBlack = ' btn-note-black ';
								}
								
								?><div class="btn-synth btn-note js-note <?=$btnBlack;?> ib" data-instrument-name="synth<?=$synthID;?>" data-note="<?=$notes[$i];?>" id="synth<?=$synthID;?>_<?=strtolower($notes[$i]);?>"><?=$notes[$i];?></div><?php

							endfor; ?>
						</div>

					</div>

					<div class="col-xs-3">
						<div class="row">
							<div class="synth-octave-container col-xs-6 ib">
								<div class="btn-synth btn-note tiny-text js-octave-btn js-octave-btn-down ib" data-instrument-name="synth<?=$synthID;?>" data-direction="down">DN</div><?php
								?><div class="btn-synth btn-note tiny-text js-octave-btn js-octave-btn-up ib" data-instrument-name="synth<?=$synthID;?>" data-direction="up">UP</div>
							</div>

							<div class="synth-octave-container col-xs-6 ib" style="">
								<div class="btn-synth btn-note tiny-text ib" data-instrument-name="synth<?=$synthID;?>">AC</div><?php
								?><div class="btn-synth btn-note tiny-text js-slide-btn ib" data-instrument-name="synth<?=$synthID;?>">SL</div>
							</div>
						</div>

					</div>

				</div><!--End Keyboard Row-->

			</div><!--End Synth <?=$synthID;?> Main-->

			<div class="col-xs-2 vol-container" style="vertical-align:bottom;">
				<div data-instrument-name="synth<?=$synthID;?>" class="js-instrument-dist-btn btn-synth ib btn-distortion"></div><span class="ib mix-label">Dist.</span><br>
				<div data-instrument-name="synth<?=$synthID;?>" class="js-instrument-delay-btn btn-synth ib btn-distortion"></div><span class="ib mix-label">Delay</span><br>
				<div data-instrument-name="synth<?=$synthID;?>" class="js-instrument-vol-slider ib"></div><span class="ib mix-label">Vol.</span>
				
			</div>

		</div><!--End Row-->

		<div class="spacer-vertical"></div>

		<?php endfor //End synth loop ;?>







		<div class="row">

			<!--Drum 1 Pattern Selector-->
			<div class="col-xs-2">
				<!--<div id="muteDrums" class="panel-light" style="display:none;"></div>-->
				<?php for($i=1;$i<=8;$i++) : ?>
					<div class="ib pattern-select-btn btn-note btn-synth js-pattern-select" data-instrument-name="drum1" data-pattern-number="<?=$i;?>" id="pattern_drum1_<?=$i;?>"><?=$i;?></div>
				<?php endfor; ?>
			</div>

			<!--Drum 1 Main-->
			<div class="col-xs-8 drum1-main instrument-shadow">
				
				<!--Controls Row-->
				<div class="row">

					<div class="col-xs-1"></div>

					<div class="col-xs-11">

						<?php
						$drum1_drums = array('bd', 'sd', 'lt', 'mt', 'ht', 'rs/cp', 'ch/oh', 'cc/rc');
						$drum1_step = 0;
						foreach($drum1_drums as $drum) : 

							//Loop through each drum and create controls

							?><div class="drum-controls-container ib">
								<div class="drum-title"><?=strtoupper($drum);?></div>

								<label>Level</label>
								<div><input type="text" value="0" class="dial-drum js-dial-drum" name="drum1_<?=$drum;?>_vol" data-width="16" data-min="0" data-max="100" style="width:1px;"></div>
								
								<?php 
								$drumSplit = explode('/',$drum);
								if( count($drumSplit) > 1 ) : ?>
									<div class="btn-drum-selector btn-drum-selector-half ib" data-instrument-name="drum1" data-drum-name="<?=$drumSplit[0];?>"><?=strtoupper($drumSplit[0]);?></div><!--
								 --><div class="btn-drum-selector btn-drum-selector-half btn-drum-selector-half2 ib" data-instrument-name="drum1" data-drum-name="<?=$drumSplit[1];?>"><?=strtoupper($drumSplit[1]);?></div>
								<?php else : ?>
									<div class="btn-drum-selector" data-instrument-name="drum1" data-drum-name="<?=$drum;?>"><?=strtoupper($drum);?></div>
								<?php endif; ?>
								
								<div class="btn-drum ib js-drumpad js-drumpad-<?=$drum1_step; ?>" data-instrument-name="drum1" data-drum-step="<?=$drum1_step;?>"></div><!--
							--><div class="btn-drum ib js-drumpad js-drumpad-<?=$drum1_step + 1;?>" data-instrument-name="drum1" data-drum-step="<?=$drum1_step + 1;?>"></div>
							</div><?php $drum1_step = $drum1_step+2; endforeach; ?>


					</div>
					
				</div><!--End Controls Row-->

				<div class="row" style="margin-top:64px;">
					<div class="col-xs-1"></div>
					<div class="col-xs-11">
						<?php for($i=1;$i<=16;$i++) : ?><div class="ib drum-step-numbers <?=(in_array($i,array(1,5,9,13)) ? ' drum-step-numbers-highlight ' : '');?>"><?=$i;?></div><?php endfor;?>
					</div>
				</div>

				<div class="row"><!--Drum Pads Row-->
					<div class="col-xs-1"></div>
					<div class="col-xs-11">
						<!--<?php for($i=0;$i<16;$i++) : ?><div class="btn-drum ib"></div><?php endfor;?>-->
					</div>
				</div>

				<div class="row">
				</div>

			</div>
			
			<div class="col-xs-2">
				<div data-instrument-name="drum1" class="btn-synth ib btn-distortion js-instrument-dist-btn"></div><span class="ib mix-label">Dist.</span><br>
				<div data-instrument-name="drum1" class="js-instrument-vol-slider ib"></div><span class="ib mix-label">Vol.</span>
			</div>
		</div>		


	<div class="spacer-vertical"></div>

	<!--Sequencer-->
	<div class="row" style="display:none;">
		<div class="col-xs-12 sequencer instrument-shadow">
			<div class="row">

				<div class="col-xs-2" style="overflow:none;">
					<table class="table sequencer-table sequencer-table-titles">
						<tr>
							<td>303 Synth 1</td>
						</tr>

						<tr>
							<td>303 Synth 2</td>
						</tr>

						<tr>
							<td>Drum Machine 1</td>
						</tr>
					</table>
				</div>

				<div class="col-xs-8" style="overflow:auto;padding-left:0;">
					<table class="sequencer-table sequencer-table-main">
						<tr>
							<?php for($i=0;$i<$sequencerBarLimit;$i++) : ?>
							<td id="seq_synth1_<?=$i;?>" class="seq-block js-seq-column-<?=$i;?> js-seq-block" data-song-bar="<?=$i;?>" data-instrument-name="synth1"></td>
							<?php endfor;?>
						</tr>

						<tr>
							<?php for($i=0;$i<$sequencerBarLimit;$i++) : ?>
							<td id="seq_synth2_<?=$i;?>" class="seq-block js-seq-column-<?=$i;?> js-seq-block" data-song-bar="<?=$i;?>" data-instrument-name="synth2"></td>
							<?php endfor;?>
						</tr>

						<tr>
							<?php for($i=0;$i<$sequencerBarLimit;$i++) : ?>
							<td id="seq_drum1_<?=$i;?>" class="seq-block js-seq-column-<?=$i;?> js-seq-block" data-song-bar="<?=$i;?>" data-instrument-name="drum1"></td>
							<?php endfor;?>
						</tr>
					</table>
				</div>


			</div><!--End row-->
		</div><!--End col-xs-12-->
	</div><!--End Row-->
	<!--End Sequencer-->


	</div><!--End Main Container-->



<script src="js/tuna.js"></script>
<script src="js/jquery-2.1.3.min.js"></script>
<script src="js/jquery_knob.js"></script>
<script src="js/jquery-ui.min.js"></script>
<script src="js/audio.js"></script>
<script src="js/ui.js"></script>
</body>