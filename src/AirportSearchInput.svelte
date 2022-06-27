<script lang="ts">
    import Select from "svelte-select";
    import Item from "./AirportSearchResult.svelte";

    export function getAirports(filterText): Promise<any[]> {
        filterText = filterText ?? "";

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(
                "GET",
                // `https://interline.tudoazul.com/catalog/api/v1/airport?searchAirport=${filterText}`
                `https://airports-prd.smiles.com.br/v1/airports?size=10&q=description:*${filterText}*`
            );
            xhr.send();

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setTimeout(() => resolve(JSON.parse(xhr.response)), 2000);
                } else {
                    reject();
                }
            };
        });
    }

    export let airportCode: string;

    const optionIdentifier = "code";
    const getOptionLabel = (option) => option.code;
    const getSelectionLabel = (option) => `${option.description}`;
    // const getSelectionLabel = (option) => `${option.code} - ${option.name}`;
    const loadOptions = (filterText) => getAirports(filterText);

    function handleSelect(event) {
        if (event.detail) {
            airportCode = event.detail.code;
        }
    }
</script>

<Select
    {loadOptions}
    {optionIdentifier}
    {getSelectionLabel}
    {getOptionLabel}
    {Item}
    on:select={handleSelect}
    containerClasses="input-airport"
    noOptionsMessage=""
    placeholder={airportCode}
/>
<!-- bind:value={airportCode} -->
