<template>
  <div
    ref="root"
    class="root"
    :style="{
      'grid-template-columns': `repeat(${currentColumnsAmount}, 1fr)`,
      'grid-template-rows': `repeat(${currentRowsAmount}, ${rowHeight}px)`
    }"
  >
    <div
      :style="{
        'grid-column': `1 / ${currentColumnsAmount + 1}`,
        'grid-row': `1 / ${currentRowsAmount + 1}`
      }"
    ></div>

    <TileView
      v-for="view of viewsPool"
      :visible="view.visible"
      :data="view.data"
    >
      <template #default="data">
        <slot v-bind="data"></slot>
      </template>
    </TileView>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, ref, reactive } from "vue";
import type Tile from "@/components/Tile";
import TileMap, { type TileMapItem } from "@/components/TileMap";
import TileView from "@/components/TileView.vue";

interface Props {
  columnWidth: number;
  rowHeight: number;
  items: Array<Tile>;
}

interface View {
  visible: boolean;
  data: TileMapItem;
}

const props = defineProps<Props>();

const root = useTemplateRef("root");

let currentColumnsAmount = ref(0);
let currentColumnWidth = 0;
let currentRowsAmount = ref(0);

let map: TileMap;

let columnsFreeRows: Array<number> = [];
let nextColumn = 0;
let nextItemIndex = 0;

const viewsPool = reactive<View[]>([]);
let hiddenViews: View[] = [];
let visibleViews: View[] = [];

let renderedRowsRange = { top: 0, bottom: 0 };

function updateSize() {
  const previousColumnsAmount = currentColumnsAmount.value;

  const rect = root.value!.getBoundingClientRect();

  currentColumnsAmount.value = Math.floor(rect.width / props.columnWidth);
  currentColumnWidth = rect.width / currentColumnsAmount.value;

  if (previousColumnsAmount === currentColumnsAmount.value) return;

  console.log("update size");

  hideAllViews();
  resetGrid();
  updateGrid();

  let visibleRows = getVisibleRowsRange();

  visibleRows = expandRowsRange(visibleRows.top, visibleRows.bottom);

  showViewsInRange(visibleRows.top, visibleRows.bottom);
}

function updatePosition() {
  let visibleRows = getVisibleRowsRange();

  if (
    renderedRowsRange.bottom - visibleRows.bottom < 1 ||
    visibleRows.top - renderedRowsRange.top < 1
  ) {
    console.log("update position");

    updateGrid();
    hideAllViews();

    visibleRows = expandRowsRange(visibleRows.top, visibleRows.bottom);

    showViewsInRange(visibleRows.top, visibleRows.bottom);
  }
}

function expandRowsRange(top: number, bottom: number) {
  const visibleHeight = bottom - top;

  top = top - visibleHeight;
  bottom = bottom + visibleHeight;

  return {
    top,
    bottom
  };
}

function getVisibleRowsRange() {
  let top = root.value!.scrollTop;
  let bottom = top + window.innerHeight;

  return {
    top: Math.floor(top / props.rowHeight),
    bottom: Math.ceil(bottom / props.rowHeight)
  };
}

function hideAllViews() {
  for (let view of visibleViews) {
    view.visible = false;
  }

  hiddenViews.push(...visibleViews);

  visibleViews = [];
}

function showViewsInRange(topRow: number, bottomRow: number) {
  renderedRowsRange = {
    top: topRow,
    bottom: bottomRow
  };

  const tiles = map.getRows(topRow, bottomRow - topRow);

  for (let tile of tiles) {
    showView(tile);
  }
}

function showView(data: TileMapItem) {
  let view = hiddenViews.pop();

  if (view == null) {
    view = reactive({
      visible: true,
      data
    });

    viewsPool.push(view);
  } else {
    view.data = data;
    view.visible = true;
  }

  visibleViews.push(view);
}

function resetGrid() {
  map = new TileMap(currentColumnsAmount.value);
  columnsFreeRows = [];
  nextColumn = 0;
  nextItemIndex = 0;
}

function updateGrid() {
  while (true) {
    if (nextItemIndex >= props.items.length) return;

    const item = props.items[nextItemIndex];

    putItem(item);

    nextItemIndex++;
  }
}

function putItem(item: Tile) {
  const span = getSpan(item.width, item.height);

  if (nextColumn + span.columns > currentColumnsAmount.value) nextColumn = 0;

  let maxFreeRow = 0;

  for (let x = 0; x < span.columns; x++) {
    let freeRow = columnsFreeRows[x + nextColumn] ?? 0;

    if (freeRow > maxFreeRow) maxFreeRow = freeRow;
  }

  map.put(nextColumn, maxFreeRow, span.columns, span.rows, item.data);

  for (let x = 0; x < span.columns; x++) {
    let column = nextColumn + x;

    columnsFreeRows[column] = maxFreeRow + span.rows;
  }

  currentRowsAmount.value = Math.max(...columnsFreeRows.map((x) => x ?? 0));

  nextColumn += span.columns;
}

function getSpan(width: number, height: number) {
  let columns;
  let rows;

  if (width > height) {
    columns = Math.min(
      Math.max(Math.round(width / height), 1),
      currentColumnsAmount.value
    );
    rows = Math.round(
      ((height / width) * (columns * currentColumnWidth)) / props.rowHeight
    );
  } else {
    columns = 1;
    rows = Math.round(
      ((height / width) * currentColumnWidth) / props.rowHeight
    );
  }

  rows = Math.max(rows, 1);

  return {
    columns,
    rows
  };
}

let updateSizeTimeout: number;

onMounted(() => {
  updateSize();

  window.addEventListener("resize", function () {
    clearTimeout(updateSizeTimeout);
    updateSizeTimeout = setTimeout(updateSize, 100);
  });
  root.value!.addEventListener("scroll", function () {
    updatePosition();
  });
});
</script>

<style lang="scss" scoped>
.root {
  display: grid;
  overflow: auto;
}
</style>
