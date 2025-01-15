export interface TileMapItem {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  data: any;
}

export default class TileMap {
  map: Array<TileMapItem> = [];
  width: number;

  constructor(width: number) {
    this.width = width;
  }

  getRows(row: number, count: number) {
    const tiles: TileMapItem[] = [];
    const indexes: boolean[] = [];

    let index = row * this.width;

    for (let y = 0; y < count; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.map[index];

        if (tile != null) {
          const tileIndex = tile.row * this.width + tile.column;

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
    if (column > this.width) throw new Error("Tile out of map");

    const index = row * this.width + column;

    return this.map[index];
  }

  put(
    column: number,
    row: number,
    columnSpan: number,
    rowSpan: number,
    data: any
  ) {
    if (column + columnSpan > this.width) throw new Error("Tile out of map");

    for (let y = 0; y < rowSpan; y++) {
      let index = (row + y) * this.width + column;

      for (let x = 0; x < columnSpan; x++) {
        if (this.map[index]) throw new Error("Cell already contains tile");

        this.map[index] = {
          row,
          column,
          columnSpan,
          rowSpan,
          data
        };

        index++;
      }
    }
  }
}
