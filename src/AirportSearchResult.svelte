<script lang="ts">
	export let item: any;
</script>

<style>
.customItem {
    display: flex;
    align-items: center;
}

.customItem_title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.customItem_name {
    display: inline-block;
    font-weight: 700;
    margin-right: 10px;
}
</style>

<div class="customItem">
  <div class="customItem_title">
    <div class="customItem_name">{item.description}</div>
  </div>
</div>