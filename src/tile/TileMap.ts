export interface TileMapItem {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  data: any;
}

export class TileMap {
  #map: Array<TileMapItem> = [];
  #columnsAmount: number;
  #rowsAmount = 0;

  constructor(columnsAmount: number) {
    this.#columnsAmount = columnsAmount;
  }

  get columnsAmount() {
    return this.#columnsAmount;
  }

  get rowsAmount() {
    return this.#rowsAmount;
  }

  getRows(row: number, count: number) {
    const tiles: TileMapItem[] = [];
    const indexes: boolean[] = [];

    let index = row * this.#columnsAmount;

    for (let y = 0; y < count; y++) {
      for (let x = 0; x < this.#columnsAmount; x++) {
        const tile = this.#map[index];

        if (tile != null) {
          const tileIndex = tile.row * this.#columnsAmount + tile.column;

          if (indexes[tileIndex] !== true) {
            tiles.push(tile);
            indexes[tileIndex] = true;
          }
        }

        index++;
      }
    }

    return tiles;
  }

  get(column: number, row: number) {
    if (column > this.#columnsAmount) throw new Error("Position out of map");

    const index = row * this.#columnsAmount + column;

    return this.#map[index];
  }

  put(
    column: number,
    row: number,
    columnSpan: number,
    rowSpan: number,
    data: any
  ) {
    if (this.#columnsAmount === 0) return;

    if (column + columnSpan > this.#columnsAmount)
      throw new Error("Position out of map");

    for (let y = 0; y < rowSpan; y++) {
      let index = (row + y) * this.#columnsAmount + column;

      for (let x = 0; x < columnSpan; x++) {
        if (this.#map[index]) throw new Error("Cell already contains tile");

        this.#map[index] = {
          row,
          column,
          columnSpan,
          rowSpan,
          data
        };

        index++;
      }
    }

    row += rowSpan;

    if (row > this.#rowsAmount) this.#rowsAmount = row;
  }
}
