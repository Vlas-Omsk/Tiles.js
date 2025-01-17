<script setup lang="ts">
import TileView from "@/components/TileView.vue";

import {
  useTemplateRef,
  onMounted,
  reactive,
  shallowRef,
  ref,
  nextTick,
  watch,
  computed,
  onBeforeUnmount
} from "vue";

import { type Tile } from "@/tile/Tile";
import { type TileMapItem } from "@/tile/TileMap";
import { TileGrid } from "@/tile/TileGrid";

interface Props {
  columnWidth: number;
  rowHeight: number;
  columnGap?: number;
  rowGap?: number;
  items: Array<Tile>;
}

interface View {
  visible: boolean;
  item: TileMapItem;
}

const props = withDefaults(defineProps<Props>(), {
  columnGap: 0,
  rowGap: 0
});

const emit = defineEmits(["onScrollNearEnd"]);

const root = useTemplateRef("root");

const currentColumnsAmount = shallowRef(0);
const currentRowsAmount = shallowRef(0);

const currentRowHeight = computed(() => props.rowHeight + props.rowGap);

const grid = new TileGrid();

grid.push(...props.items);

let lastItemsLength = props.items.length;

const viewsPool = ref<View[]>([]);
let hiddenViews: View[] = [];
let visibleViews: View[] = [];

let renderedRowsRange = { top: 0, bottom: 0 };
let renderedGap = { columnGap: 0, rowGap: 0 };

function updateSize() {
  if (root.value == null) return;

  const rect = root.value.getBoundingClientRect();

  const newColumnsAmount = Math.floor(rect.width / props.columnWidth);
  const newColumnWidth = rect.width / newColumnsAmount;

  if (
    props.columnGap === renderedGap.columnGap &&
    props.rowGap === renderedGap.rowGap &&
    newColumnsAmount === currentColumnsAmount.value
  )
    return;

  console.log("update size");

  currentColumnsAmount.value = newColumnsAmount;

  renderedGap.columnGap = props.columnGap;
  renderedGap.rowGap = props.rowGap;

  hideAllViews();

  grid.resize(
    currentColumnsAmount.value,
    newColumnWidth,
    currentRowHeight.value
  );

  currentRowsAmount.value = grid.map.rowsAmount;

  let visibleRowsRange = getVisibleRowsRange();

  visibleRowsRange = expandRowsRange(
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );

  showViewsInRange(visibleRowsRange.top, visibleRowsRange.bottom);
}

function updatePosition() {
  if (root.value == null) return;

  let visibleRowsRange = getVisibleRowsRange();

  if (
    root.value.scrollHeight - root.value.clientHeight - root.value.scrollTop <
    root.value.clientHeight
  ) {
    emit("onScrollNearEnd");
  }

  if (
    !(
      renderedRowsRange.bottom - visibleRowsRange.bottom < 1 ||
      visibleRowsRange.top - renderedRowsRange.top < 1
    )
  )
    return;

  console.log("update position");

  hideAllViews();

  visibleRowsRange = expandRowsRange(
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );

  showViewsInRange(visibleRowsRange.top, visibleRowsRange.bottom);
}

function expandRowsRange(top: number, bottom: number) {
  const visibleHeight = bottom - top;

  top = top - visibleHeight;
  bottom = bottom + visibleHeight;

  return {
    top: Math.max(top, 0),
    bottom: Math.min(bottom, grid.map.rowsAmount)
  };
}

function getVisibleRowsRange() {
  const top = root.value!.scrollTop;
  const bottom = top + root.value!.clientHeight;

  return {
    top: Math.floor(top / currentRowHeight.value),
    bottom: Math.ceil(bottom / currentRowHeight.value)
  };
}

function hideAllViews() {
  for (const view of visibleViews) {
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

  const tiles = grid.map.getRows(topRow, bottomRow - topRow);

  for (const tile of tiles) {
    showView(tile);
  }
}

function showView(item: TileMapItem) {
  let view = hiddenViews.pop();

  if (!view) {
    view = reactive({
      visible: true,
      item
    });

    viewsPool.value.push(view);
  } else {
    view.item = item;
    view.visible = true;
  }

  visibleViews.push(view);
}

let updateSizeTimeout: number;

function onWindowResize() {
  clearTimeout(updateSizeTimeout);
  updateSizeTimeout = setTimeout(updateSize, 100);
}

function onRootScroll() {
  updatePosition();
}

onMounted(async () => {
  await nextTick();

  updateSize();

  window.addEventListener("resize", onWindowResize);
  root.value!.addEventListener("scroll", onRootScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  root.value!.removeEventListener("scroll", onRootScroll);
});

watch(
  () => props.items,
  (newValue, oldValue) => {
    hideAllViews();

    if (newValue === oldValue) {
      console.log("update grid");

      while (newValue.length > lastItemsLength) {
        const item = newValue[lastItemsLength++];

        grid.push(item);
      }

      while (newValue.length < lastItemsLength) {
        grid.pop();

        lastItemsLength--;
      }
    } else {
      console.log("rebuild grid");

      grid.clear();
      grid.push(...newValue);
    }

    currentRowsAmount.value = grid.map.rowsAmount;

    let visibleRowsRange = getVisibleRowsRange();

    visibleRowsRange = expandRowsRange(
      visibleRowsRange.top,
      visibleRowsRange.bottom
    );

    showViewsInRange(visibleRowsRange.top, visibleRowsRange.bottom);
  },
  {
    deep: true
  }
);

watch(
  () => [props.columnWidth, props.columnGap, props.rowHeight, props.rowHeight],
  () => {
    updateSize();
  },
  {
    flush: "post"
  }
);
</script>

<template>
  <div class="wrapper">
    <div
      ref="root"
      class="root"
      :style="{
        'grid-template-columns': `repeat(${currentColumnsAmount}, 1fr)`,
        'grid-template-rows': `repeat(${currentRowsAmount}, ${rowHeight}px)`,
        'column-gap': `${columnGap}px`,
        'row-gap': `${rowGap}px`
      }"
    >
      <!-- Without this element, scrolling will be triggered when moving tiles -->
      <div
        :style="{
          'grid-column': `1 / ${currentColumnsAmount + 1}`,
          'grid-row': `1 / ${currentRowsAmount + 1}`
        }"
      ></div>

      <TileView
        v-for="view of viewsPool"
        :visible="view.visible"
        :item="view.item"
      >
        <template #default="data">
          <slot v-bind="data"></slot>
        </template>
      </TileView>
    </div>
  </div>
</template>

<style lang="css" scoped>
.wrapper {
  display: flex;
  height: 100%;
}

.root {
  display: grid;
  overflow: auto;
  height: 100%;
  width: 100%;
}
</style>
