<script setup lang="ts">
import type { TileMapItem } from "@/tile/TileMap";

interface Props {
  visible: boolean;
  item: TileMapItem;
}

defineProps<Props>();
</script>

<template>
  <div
    v-if="visible"
    :style="{
      'grid-column': `${item.column + 1} / ${item.column + item.columnSpan + 1}`,
      'grid-row': `${item.row + 1} / ${item.row + item.rowSpan + 1}`
    }"
  >
    <slot v-bind="item.data"></slot>
  </div>
</template>
