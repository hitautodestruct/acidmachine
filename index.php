<?php
$notes=explode(',','C,C#,D,D#,E,F,F#,G,G#,A,A#,B,C');
?>
<html>
<title>Audio Test</title>
<head>
<link rel="stylesheet" type="text/css" href="css/reset.css">
<link rel="stylesheet" type="text/css" href="css/bootstrap_grid.min.css">
<link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>

	<div class="container">

		<div class="row">
			<div class="col-xs-3 options transport-options container-padding">
				<div class="btn ib" id="play_button">Play</div><div class="btn ib" id="stop_button">Stop</div>
			</div>
			<div class="col-xs-9">
				
			</div>
		</div>

		<div class="row" style="margin-top:16px;">
			
			<!--Synth 1 Pattern Selector-->
			<div class="col-xs-2">
				
			</div>

			<!--Synth 1 Main-->
			<div class="col-xs-8 synth-main">
				
				<!--Controls Row-->
				<div class="row synth-controls-row">
					
					<div class="col-xs-2 border-right">
						Waveform
					</div>

					<div class="col-xs-8 border-right knobs">

						<div class="row">

							<div class="col-xs-2">
								Tune
								<input type="text" value="64" class="dial">
							</div>

							<div class="col-xs-2">
								Cutoff
								<input type="text" value="64" class="dial">
							</div>

							<div class="col-xs-2">
								Reso
								<input type="text" value="64" class="dial">
							</div>

							<div class="col-xs-2">
								Env.Mod
								<input type="text" value="64" class="dial">
							</div>

							<div class="col-xs-2">
								Decay
								<input type="text" value="0" class="dial">
							</div>

							<div class="col-xs-2">
								Accent
								<input type="text" value="0" class="dial">
							</div>

						</div>

					</div>
					
					<div class="col-xs-2 current-step-container">
						Current Step
						<div class="synth-lcd ib" id="synth1_step">1</div><div class="ib">
							<div class="btn-synth btn-small js-synth-step-up"  data-instrument-name="synth1">UP</div>
							<div class="btn-synth btn-small js-synth-step-down"  data-instrument-name="synth1">DN</div>
						</div>
					</div>

				</div><!--End Controls Row-->
				
				<!--Keyboard Row-->
				<div class="row keyboard-row">
						
					<div class="col-xs-2">
						Randomize
						<div class="btn-synth btn-randomize" data-instrument-name="synth1">

						</div>
					</div>
					
					<div class="col-xs-8">

						<div class="keyboard-container">
							<?php for($i=0;$i<count($notes);$i++) :

								$btnBlack = '';

								//If this is a sharp note
								if(strlen($notes[$i])>1){
									$btnBlack = ' btn-note-black ';
								}
								
								?><div class="btn-synth btn-note <?=$btnBlack;?> ib" data-instrument-name="synth1" id="synth1_<?=strtolower($notes[$i]);?>"><?=$notes[$i];?></div><?php

							endfor; ?>
						</div>

					</div>

					<div class="col-xs-3">
					</div>

				</div><!--End Keyboard Row-->

			</div><!--End Synth 1 Main-->

		</div><!--End Row-->


		<!--Note Storage Table-->
		<div class="row" style="margin-top:32px;">
			<div class="col-xs-8">
				<table class="channel-container">
				
					<thead>
						<tr>
							<td class="channel-row-count"></td>
							<td>CH 1</td>
							<td>CH 2</td>
							<td>CH 3</td>
							<td>CH 4</td>
						</tr>
					</thead>
					
					<tbody class="js-channel-notes">
						
						<?php for($i=1;$i<=16;$i++) : 

						$divide4 = '';
						if(($i-1)%4 === 0){
							$divide4 = ' divide4 ';
						}

						?>
						<tr class="<?=$divide4;?>">
							<td class="channel-row-count"><?=$i;?></td>
							<td class="channel-note" id="<?=$i;?>-1"><input class="js-note-input" val="" id="r<?=$i;?>c1"></td>
							<td class="channel-note" id="<?=$i;?>-2"><input class="js-note-input" val="" id="r<?=$i;?>c2"></td>
							<td class="channel-note" id="<?=$i;?>-3"><input class="js-note-input" val="" id="r<?=$i;?>c3"></td>
							<td class="channel-note" id="<?=$i;?>-4"><input class="js-note-input" val="" id="r<?=$i;?>c4"></td>
						</tr>
						<?php endfor; ?>

					</tbody>
					
				</table>
			</div>
		</div>
		<!--End Note Storage Table-->


	</div><!--End Main Container-->



<script src="js/jquery-2.1.3.min.js"></script>
<script src="js/jquery_knob.js"></script>
<script src="js/audio.js"></script>
<script src="js/ui.js"></script>
</body>