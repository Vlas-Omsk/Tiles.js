<template>
  <div
    v-if="visible"
    :style="{
      'grid-column': `${data.column + 1} / ${data.column + data.columnSpan + 1}`,
      'grid-row': `${data.row + 1} / ${data.row + data.rowSpan + 1}`
    }"
  >
    <slot v-bind="data.data"></slot>
  </div>
</template>

<script setup lang="ts">
import type { TileMapItem } from "@/components/TileMap";

interface Props {
  visible: boolean;
  data: TileMapItem;
}

defineProps<Props>();
</script>
