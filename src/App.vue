<script setup lang="ts">
import Tiles from "@/components/Tiles.vue";
import { type Tile } from "@/tile/Tile";
import { reactive } from "vue";

const tilesPack1: Array<Tile> = [
  {
    width: 1920,
    height: 1080,
    data: {
      src: "#ff0000"
    }
  },
  {
    width: 1080,
    height: 1920,
    data: {
      src: "#00ff00"
    }
  },
  {
    width: 1080,
    height: 1080,
    data: {
      src: "#0000ff"
    }
  },
  {
    width: 4000,
    height: 1080,
    data: {
      src: "#ff0000"
    }
  },
  {
    width: 1080,
    height: 1080,
    data: {
      src: "#0000ff"
    }
  }
];

const tilesPack2: Array<Tile> = [
  {
    width: 336,
    height: 433,
    data: {
      src: "url(/images/p-1.jpg)"
    }
  },
  {
    width: 336,
    height: 300,
    data: {
      src: "url(/images/p-2.jpg)"
    }
  },
  {
    width: 336,
    height: 488,
    data: {
      src: "url(/images/p-3.jpg)"
    }
  }
];

const tiles = reactive<Tile[]>([]);

function addTiles() {
  tiles.push(...tilesPack2);
}

for (let i = 0; i < 100; i++) addTiles();

// setTimeout(() => {
//   tiles.pop();
// }, 10000);
</script>

<template>
  <main class="main">
    <Tiles
      :column-width="220"
      :row-height="50"
      :items="tiles"
      :column-gap="10"
      :row-gap="10"
      style="flex: 1"
      @--on-scroll-near-end="addTiles"
    >
      <template #default="data">
        <div
          style="
            display: flex;
            height: 100%;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            border-radius: 10px;
          "
          :style="{
            background: data.src
          }"
        >
          {{ data }}
        </div>
      </template>
    </Tiles>
  </main>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  width: 100%;
  height: 100vh;
}
</style>
