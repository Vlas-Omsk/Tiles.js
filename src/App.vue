<template>
  <main class="main">
    <Tiles
      :column-width="220"
      :row-height="10"
      :items="tiles"
      style="height: 100vh"
    >
      <template #default="data">
        <div
          style="display: flex; height: 100%"
          :style="{ 'background-color': data.color }"
        >
          {{ data }}
        </div>
      </template>
    </Tiles>
  </main>
</template>

<script setup lang="ts">
import Tiles from "@/components/Tiles.vue";
import type Tile from "@/components/Tile";

const origTiles: Array<Tile> = [
  {
    width: 1920,
    height: 1080,
    data: {
      color: "#ff0000"
    }
  },
  {
    width: 1080,
    height: 1920,
    data: {
      color: "#00ff00"
    }
  },
  {
    width: 1080,
    height: 1080,
    data: {
      color: "#0000ff"
    }
  },
  {
    width: 4000,
    height: 1080,
    data: {
      color: "#ff0000"
    }
  },
  {
    width: 1080,
    height: 1080,
    data: {
      color: "#0000ff"
    }
  }
];

const tiles: Array<Tile> = [];

for (let i = 0; i <= 300; i++) {
  for (let tile of origTiles) {
    const newTile = Object.assign({}, tile);

    newTile.data = {
      color:
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    };

    tiles.push(newTile);
  }
}
</script>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
}
</style>
