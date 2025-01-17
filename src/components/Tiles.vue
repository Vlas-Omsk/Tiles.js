<script setup lang="ts">
import TileView, {
  type Props as TileViewProps
} from "@/components/TileView.vue";

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

const props = withDefaults(defineProps<Props>(), {
  columnGap: 0,
  rowGap: 0
});

const emit = defineEmits(["onScrollNearEnd"]);

const root = useTemplateRef("root");
const wrapper = useTemplateRef("wrapper");

const currentColumnsAmount = shallowRef(0);

const currentRowHeight = computed(() => props.rowHeight + props.rowGap);

const topRowsMargin = shallowRef(0);
const bottomRowsMargin = shallowRef(0);

const visibleRowsAmount = shallowRef(0);

const topMargin = computed(() => topRowsMargin.value * currentRowHeight.value);
const bottomMargin = computed(
  () => bottomRowsMargin.value * currentRowHeight.value - props.rowGap
);

const grid = new TileGrid();

grid.push(...props.items);

let lastItemsLength = props.items.length;

const viewsPool = ref<TileViewProps[]>([]);
let hiddenViews: TileViewProps[] = [];
let visibleViews: TileViewProps[] = [];

let renderedRowsRange = { top: 0, bottom: 0 };
let renderedGap = { columnGap: 0, rowGap: 0 };

function updateSize() {
  if (root.value == null || wrapper.value == null) return;

  const rect = wrapper.value.getBoundingClientRect();

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

  const visibleRowsRange = getVisibleRowsRange();

  const showRowsRange = expandRowsRange(
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );

  showViewsInRange(
    showRowsRange.top,
    showRowsRange.bottom,
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );
}

function updatePosition() {
  if (root.value == null || wrapper.value == null) return;

  const visibleRowsRange = getVisibleRowsRange();

  if (
    wrapper.value.scrollHeight -
      wrapper.value.clientHeight -
      wrapper.value.scrollTop <
    wrapper.value.clientHeight
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

  const showRowsRange = expandRowsRange(
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );

  showViewsInRange(
    showRowsRange.top,
    showRowsRange.bottom,
    visibleRowsRange.top,
    visibleRowsRange.bottom
  );
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
  const top = wrapper.value!.scrollTop;
  const bottom = top + wrapper.value!.clientHeight;

  const topRows = Math.floor(top / currentRowHeight.value);
  const bottomRows = Math.ceil(bottom / currentRowHeight.value);

  const visibleRows = bottomRows - topRows;

  return {
    top: Math.min(topRows, grid.map.rowsAmount - visibleRows),
    bottom: Math.min(bottomRows, grid.map.rowsAmount)
  };
}

function hideAllViews() {
  for (const view of visibleViews) {
    view.visible = false;
  }

  hiddenViews.push(...visibleViews);

  visibleViews = [];
}

function showViewsInRange(
  topRow: number,
  bottomRow: number,
  visibleTopRow: number,
  visibleBottomRow: number
) {
  renderedRowsRange = {
    top: topRow,
    bottom: bottomRow
  };

  const tiles = grid.map.getRows(topRow, bottomRow - topRow);

  topRowsMargin.value = Math.min(...tiles.map((x) => x.row));
  bottomRowsMargin.value =
    grid.map.rowsAmount -
    topRowsMargin.value -
    (visibleBottomRow - visibleTopRow);

  visibleRowsAmount.value = bottomRow - topRowsMargin.value;

  for (const tile of tiles) {
    showView(tile);
  }
}

function showView(item: TileMapItem) {
  let view = hiddenViews.pop();

  if (!view) {
    view = reactive<TileViewProps>({
      visible: true,
      column: item.column,
      columnSpan: item.columnSpan,
      row: item.row - topRowsMargin.value,
      rowSpan: item.rowSpan,
      data: item.data
    });

    viewsPool.value.push(view);
  } else {
    view.column = item.column;
    view.columnSpan = item.columnSpan;
    view.row = item.row - topRowsMargin.value;
    view.rowSpan = item.rowSpan;
    view.data = item.data;
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
  wrapper.value!.addEventListener("scroll", onRootScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  wrapper.value!.removeEventListener("scroll", onRootScroll);
});

watch(
  () => props.items,
  (newValue, oldValue) => {
    hideAllViews();

    if (newValue === oldValue) {
      console.log("update grid");

      while (newValue.length > lastItemsLength) {
        const item = newValue[lastItemsLength];

        grid.push(item);

        lastItemsLength++;
      }

      while (newValue.length < lastItemsLength) {
        grid.pop();

        lastItemsLength--;
      }
    } else {
      console.log("rebuild grid");

      grid.clear();
      grid.push(...newValue);

      lastItemsLength = newValue.length;
    }

    const visibleRowsRange = getVisibleRowsRange();

    const showRowsRange = expandRowsRange(
      visibleRowsRange.top,
      visibleRowsRange.bottom
    );

    showViewsInRange(
      showRowsRange.top,
      showRowsRange.bottom,
      visibleRowsRange.top,
      visibleRowsRange.bottom
    );
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
  <div ref="wrapper" class="wrapper">
    <div
      ref="root"
      class="root"
      :style="{
        'grid-template-columns': `repeat(${currentColumnsAmount}, 1fr)`,
        'grid-template-rows': `repeat(${visibleRowsAmount}, ${rowHeight}px)`,
        'column-gap': `${columnGap}px`,
        'row-gap': `${rowGap}px`,
        'margin-top': `${topMargin}px`,
        'margin-bottom': `${bottomMargin}px`
      }"
    >
      <!-- Without this element, scrolling will be triggered when moving tiles -->
      <div
        :style="{
          'grid-column': `1 / ${currentColumnsAmount + 1}`,
          'grid-row': `1 / ${visibleRowsAmount + 1}`
        }"
      ></div>

      <TileView v-for="view of viewsPool" v-bind="view">
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
  overflow: auto;
}

.root {
  display: grid;
  height: 100%;
  width: 100%;
}
</style>
