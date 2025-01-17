import { TileMap, type TileMapItem } from "@/tile/TileMap";
import { type Tile } from "@/tile/Tile";

export class TileGrid {
  #map = new TileMap(0);
  #columnsAmount = 0;
  #columnWidth = 0;
  #rowHeight = 0;
  #indexItemMap: Array<TileMapItem> = [];
  #tiles: Array<Tile> = [];

  get map() {
    return this.#map;
  }

  resize(columnsAmount: number, columnWidth: number, rowHeight: number) {
    if (columnsAmount < 0) throw new Error("Columns amount must be positive");

    if (columnWidth < 0) throw new Error("Column width must be positive");

    if (rowHeight < 0) throw new Error("Row height must be positive");

    this.#columnsAmount = columnsAmount;
    this.#columnWidth = columnWidth;
    this.#rowHeight = rowHeight;

    this.#reset();

    if (this.#columnsAmount === 0) return;

    let index = 0;

    for (const tile of this.#tiles) {
      this.#indexItemMap[index++] = this.#placeTile(tile);
    }
  }

  push(...tiles: Array<Tile>) {
    for (const tile of tiles) {
      const index = this.#tiles.push(tile) - 1;

      if (this.#columnsAmount === 0) continue;

      this.#indexItemMap[index] = this.#placeTile(tile);
    }
  }

  pop() {
    if (this.#tiles.pop() == null) return;

    const mapItem = this.#indexItemMap.pop()!;

    this.#map.remove(
      mapItem.column,
      mapItem.row,
      mapItem.columnSpan,
      mapItem.rowSpan
    );
  }

  clear() {
    this.#tiles = [];

    this.#reset();
  }

  #reset() {
    this.#map = new TileMap(this.#columnsAmount);
    this.#indexItemMap = [];
  }

  #placeTile(item: Tile) {
    const span = this.#measureTile(item.width, item.height);

    const nextColumn = this.#findColumnForTile(span.columns);

    let maxVertex = 0;

    for (let x = 0; x < span.columns; x++) {
      const columnVertex = this.#map.columnVertexMap[x + nextColumn] ?? 0;

      if (columnVertex > maxVertex) maxVertex = columnVertex;
    }

    const mapItem = this.#map.put(
      nextColumn,
      maxVertex,
      span.columns,
      span.rows,
      item.data
    );

    return mapItem;
  }

  #findColumnForTile(columnSpan: number) {
    const sortedColumnVertexes = [...this.#map.columnVertexMap.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    let lowestColumn = 0;
    let lowestColumnVertex = sortedColumnVertexes[0][1];

    for (const columnVertex of sortedColumnVertexes) {
      if (
        columnVertex[0] + columnSpan <= this.#columnsAmount &&
        (columnVertex[1] < lowestColumnVertex || columnVertex[0] < lowestColumn)
      ) {
        lowestColumn = columnVertex[0];
        lowestColumnVertex = columnVertex[1];
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
