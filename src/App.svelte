<script lang="ts">
	import { onMount } from 'svelte';
	import { searchFares, Main } from './old_main';
	
	onMount(async () => {
    	Main();
	});
</script>


<div class="wrapper">
	<header class="without-description">
		<h1>MyFlightFinder ✈️</h1>
		<p class="view">
			<a href="https://github.com/dandandandaann/MyFlightFinder">View the Project on GitHub</a>
		</p>
		<ul>
			<li><a href="https://github.com/dandandandaann/MyFlightFinder">View On <strong>GitHub</strong></a></li>
		</ul>
	</header>
	<section>
		<div id="calendar">
			<div class="input-settings">
				Data:
				<select id="monthInput" style="width: 100px;">
					<option value="01">Janeiro</option>
					<option value="02">Feveriro</option>
					<option value="03">Março</option>
					<option value="04">Abril</option>
					<option value="05">Maio</option>
					<option value="06">Junho</option>
					<option value="07">Julho</option>
					<option selected value="08">Agosto</option>
					<option value="09">Setembro</option>
					<option value="10">Outubro</option>
					<option value="11">Novembro</option>
					<option value="12">Dezembro</option>
				</select>
				<select id="yearInput" style="width: 100px;">
					<option selected value="2022">2022</option>
					<option value="2023">2023</option>
					<option value="2024">2024</option>
					<option value="2025">2025</option>
					<option value="2026">2026</option>
					<option value="2027">2027</option>
				</select>
				<br />
				<label for="searchOrigin">Aeroporto origem:</label>
				<div style="display: none;">
					<input type="text" id="searchOrigin" style="width: 200px;">
					<ol id="originOptions" style="display:inline; float:left; padding-top:50px">
						<li>Biarritz-Anglet- Bayonne - França</li>
						<li>Clermont-Ferrand Auvergne Airport - França</li>
						<li>Frankfurt - Alemanha</li>
					</ol>
				</div>
				<input type="text" maxlength="3" id="originAirportCode" value="GRU" style="width: 80px;">
				<br />
				<label for="searchDestination">Aeroporto destino:</label>
				<div style="display: none;">
					<input type="text" id="searchDestination" style="width: 200px;">
				</div>
				<input type="text" maxlength="3" id="destinationAirportCode" value="LIS" style="width: 80px;">
				<br /><br />
				<button on:click="{searchFares}">Pesquisar</button>
				<br />
				<input type="checkbox" checked id="isTesting"><label for="isTesting">Local only</label>
			</div>
			<div>
				<h1 class="calendar-title">
					<a id="left" class="left-arrow" href="#">🡨</a>
					<span id="month"></span>
					<span id="year"></span>
					<a id="right" class="right-arrow" href="#">🡪</a>
				</h1>
			</div>
			<div class="">
				<div class="">
					<table class="calendar-table"></table>
				</div>
			</div>
		</div>

	</section>
</div>
<footer>
	<p>Project maintained by <a href="https://github.com/dandandandaann">dandandandaann</a></p>
	<p>Hosted on GitHub Pages — Theme by <a href="https://github.com/orderedlist">orderedlist</a></p>
</footer>