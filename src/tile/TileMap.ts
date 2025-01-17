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
  #columnVertexMap: Array<number> = [];
  #rowsAmount = 0;

  constructor(columnsAmount: number) {
    if (columnsAmount < 0) throw new Error("Columns amount must be positive");

    this.#columnsAmount = columnsAmount;

    for (let i = 0; i < this.#columnsAmount; i++) this.#columnVertexMap.push(0);
  }

  get columnsAmount() {
    return this.#columnsAmount;
  }

  get rowsAmount() {
    return this.#rowsAmount;
  }

  get columnVertexMap() {
    return this.#columnVertexMap;
  }

  getRows(row: number, rowSpan: number) {
    if (row + rowSpan > this.#rowsAmount)
      throw new Error("Position out of map");

    if (row < 0) throw new Error("Position out of map");

    const tiles: TileMapItem[] = [];
    const indexes: boolean[] = [];

    let index = row * this.#columnsAmount;

    for (let y = 0; y < rowSpan; y++) {
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

    if (row > this.#rowsAmount) throw new Error("Position out of map");

    if (column < 0 || row < 0) throw new Error("Position out of map");

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
    if (column + columnSpan > this.#columnsAmount)
      throw new Error("Position out of map");

    if (column < 0 || row < 0) throw new Error("Position out of map");

    const item = {
      row,
      column,
      columnSpan,
      rowSpan,
      data
    };

    for (let y = 0; y < rowSpan; y++) {
      let index = (row + y) * this.#columnsAmount + column;

      for (let x = 0; x < columnSpan; x++) {
        if (this.#map[index]) throw new Error("Cell already contains tile");

        this.#map[index] = item;

        index++;
      }
    }

    for (let x = 0; x < columnSpan; x++) {
      const currentColumn = column + x;

      this.#columnVertexMap[currentColumn] = Math.max(
        row + rowSpan,
        this.#columnVertexMap[currentColumn]
      );
    }

    this.#updateRowsAmount();

    return item;
  }

  remove(column: number, row: number, columnSpan: number, rowSpan: number) {
    if (column + columnSpan > this.#columnsAmount)
      throw new Error("Position out of map");

    if (row + rowSpan > this.#rowsAmount)
      throw new Error("Position out of map");

    if (column < 0 || row < 0) throw new Error("Position out of map");

    for (let y = 0; y < rowSpan; y++) {
      let index = (row + y) * this.#columnsAmount + column;

      for (let x = 0; x < columnSpan; x++) {
        delete this.#map[index];

        index++;
      }
    }

    if (row + rowSpan === this.#rowsAmount) {
      for (let x = 0; x < columnSpan; x++) {
        const currentColumn = column + x;

        this.#columnVertexMap[currentColumn] = row;
      }

      this.#updateRowsAmount();
    }
  }

  #updateRowsAmount() {
    this.#rowsAmount = Math.max(...this.#columnVertexMap);
  }
}
