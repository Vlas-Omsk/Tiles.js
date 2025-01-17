<script setup lang="ts">
export interface Props {
  visible: boolean;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  data: any;
}

defineProps<Props>();
</script>

<template>
  <div
    v-if="visible"
    :style="{
      'grid-column': `${column + 1} / ${column + columnSpan + 1}`,
      'grid-row': `${row + 1} / ${row + rowSpan + 1}`
    }"
  >
    <slot v-bind="data"></slot>
  </div>
</template>
