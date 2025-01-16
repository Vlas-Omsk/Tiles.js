import { TileMap } from "@/tile/TileMap";
import { type Tile } from "@/tile/Tile";

export class TileGrid {
  #map = new TileMap(0);
  #columnsAmount = 0;
  #columnWidth = 0;
  #rowHeight = 0;
  #tiles: Array<Tile> = [];
  #columnsFreeRows: Array<number> = [];

  get map() {
    return this.#map;
  }

  resize(columnsAmount: number, columnWidth: number, rowHeight: number) {
    this.#columnsAmount = columnsAmount;
    this.#columnWidth = columnWidth;
    this.#rowHeight = rowHeight;

    this.#reset();

    for (const tile of this.#tiles) {
      this.#placeTile(tile);
    }
  }

  append(...tiles: Array<Tile>) {
    for (const tile of tiles) {
      this.#tiles.push(tile);

      this.#placeTile(tile);
    }
  }

  clear() {
    this.#tiles = [];

    this.#reset();
  }

  #reset() {
    this.#map = new TileMap(this.#columnsAmount);
    this.#columnsFreeRows = [];

    for (let i = 0; i < this.#columnsAmount; i++) this.#columnsFreeRows.push(0);
  }

  #placeTile(item: Tile) {
    if (this.#columnsAmount === 0) return;

    const span = this.#measureTile(item.width, item.height);

    const nextColumn = this.#findColumnForTile(span.columns);

    let maxFreeRow = 0;

    for (let x = 0; x < span.columns; x++) {
      const freeRow = this.#columnsFreeRows[x + nextColumn] ?? 0;

      if (freeRow > maxFreeRow) maxFreeRow = freeRow;
    }

    this.#map.put(nextColumn, maxFreeRow, span.columns, span.rows, item.data);

    for (let x = 0; x < span.columns; x++) {
      const column = nextColumn + x;

      this.#columnsFreeRows[column] = maxFreeRow + span.rows;
    }
  }

  #findColumnForTile(columnSpan: number) {
    const sortedColumnsFreeRows = [...this.#columnsFreeRows.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    let lowestColumn = 0;
    let lowestColumnFreeRow = sortedColumnsFreeRows[0][1];

    for (const columnFreeRow of sortedColumnsFreeRows) {
      if (
        columnFreeRow[0] + columnSpan <= this.#columnsAmount &&
        (columnFreeRow[1] < lowestColumnFreeRow ||
          columnFreeRow[0] < lowestColumn)
      ) {
        lowestColumn = columnFreeRow[0];
        lowestColumnFreeRow = columnFreeRow[1];
      }
    }

    return lowestColumn;
  }

  #measureTile(width: number, height: number) {
    let columns;
    let rows;

    if (width > height) {
      columns = Math.min(
        Math.max(Math.round(width / height), 1),
        this.#columnsAmount
      );
      rows = Math.round(
        ((height / width) * (columns * this.#columnWidth)) / this.#rowHeight
      );
    } else {
      columns = 1;
      rows = Math.round(
        ((height / width) * this.#columnWidth) / this.#rowHeight
      );
    }

    rows = Math.max(rows, 1);

    return {
      columns,
      rows
    };
  }
}
