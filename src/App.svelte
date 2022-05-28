<script lang="ts">
	import Calendar from './Calendar.svelte';
	import { monthList, yearList } from './util'

	var orginAirportInput: string = "GRU";
	var destinationAirportInput: string = "LIS";
	var monthInput: number = 8;
	var yearInput: number = 2022;
	let calendar;
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
				<input
					type="text"
					maxlength="3"
					id="originAirportCode"
					value={orginAirportInput}
					style="width: 80px;"
				/>
				<br />
				<label for="searchDestination">Aeroporto destino:</label>
				<div style="display: none;">
					<input
						type="text"
						id="searchDestination"
						style="width: 200px;"
					/>
				</div>
				<input
					type="text"
					maxlength="3"
					id="destinationAirportCode"
					value={destinationAirportInput}
					style="width: 80px;"
				/>
				<br /><br />
				<button on:click={calendar.searchFares}>Pesquisar</button>
				<br />
				<input type="checkbox" checked id="isTesting" />&nbsp;<label
					for="isTesting">Local only</label
				>
			</div>

			<Calendar
				origin={orginAirportInput}
				destination={destinationAirportInput}
				month={monthInput}
				year={yearInput}
				bind:this={calendar}
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
