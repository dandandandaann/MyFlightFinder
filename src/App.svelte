<script lang="ts">
	import Calendar from "./Calendar.svelte";
	import { monthList, yearList } from "./util";

	import AirportSearchInput from "./AirportSearchInput.svelte";

	var orginAirportInput: string = "GRU";
	var destinationAirportInput: string = "LIS";
	var monthInput: number = 8;
	var yearInput: number = 2022;
	let calendar;
	let isRunningLocally = false;
</script>

<div class="wrapper">
	<header class="without-description">
		<h1>MyFlightFinder ✈️</h1>
		<p class="view">
			<a href="https://github.com/dandandandaann/MyFlightFinder"
				>View the Project on GitHub</a
			>
		</p>
		<ul>
			<li>
				<a href="https://github.com/dandandandaann/MyFlightFinder"
					>View On <strong>GitHub</strong></a
				>
			</li>
		</ul>
	</header>
	<section>
		<div id="calendar">
			<div class="input-settings">
				Data:
				<select bind:value={monthInput} style="width: 100px;">
					{#each monthList as month}
						<option value={month.value}>
							{month.text}
						</option>
					{/each}
				</select>

				<select bind:value={yearInput} style="width: 100px;">
					{#each yearList as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
				<br />
				<label for="searchOrigin">Aeroporto origem:</label>
				<AirportSearchInput bind:airportCode={orginAirportInput} />
				<label for="searchDestination">Aeroporto destino:</label>
				<AirportSearchInput bind:airportCode={destinationAirportInput} />

				<br />
				<button on:click={calendar.searchFares}>Pesquisar</button>
				<br />
				{#if isRunningLocally}
					<input type="checkbox" checked id="isTesting" />&nbsp;
					<label for="isTesting"> Local only </label>
				{/if}
			</div>

			<Calendar
				origin={orginAirportInput}
				destination={destinationAirportInput}
				month={monthInput}
				year={yearInput}
				bind:this={calendar}
				bind:isRunningLocally
			/>
		</div>
	</section>
</div>
<footer>
	<p>
		Project maintained by
		<a href="https://github.com/dandandandaann">dandandandaann</a>
	</p>
	<p>
		Hosted on GitHub Pages — Theme by
		<a href="https://github.com/orderedlist">orderedlist</a>
	</p>
</footer>
