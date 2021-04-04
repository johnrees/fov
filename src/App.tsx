import React, { useEffect, useRef } from "react";

const SIGHT_RADIUS = 10;
const BLOCK = 1;
const VISIBLE = 2;

interface Player {
  x: number;
  y: number;
}

function scan_arc(
  map: Map,
  player: Player,
  distance: number,
  min: number,
  max: number,
  rotate: (x: number, y: number) => [number, number]
) {
  // we're finished scanning either when the distance is too far
  // or when the angle between the two ends of the arc is 0
  if (distance >= SIGHT_RADIUS || min >= max) return;
  // iterate over all integers between min and max
  for (var i = Math.ceil(distance * min); i <= distance * max; i++) {
    // (distance, i) forms an offset from the player representing our current cell.
    // we rotate it by a multiple of 90 degrees so we can scan in 4 directions
    var x = player.x + rotate(distance, i)[0];
    var y = player.y + rotate(distance, i)[1];
    console.log({ x, y });
    // if our line of sight is blocked,
    // recursively scan at depth + 1 to the side of the block.
    if (map.get(x, y) === BLOCK) {
      scan_arc(map, player, distance + 1, min, (i - 0.5) / distance, rotate);
      min = (i + 0.5) / distance;
    } else {
      // if the current cell is open, we mark it as visible
      map.set(x, y, VISIBLE);
    }
  }
  // when we finish scanning a row, continue by scanning the next row
  scan_arc(map, player, distance + 1, min, max, rotate);
}

class Map {
  private data: any;

  constructor(private mapview: HTMLTableElement, private N: any, pairs: any) {
    this.N = N;
    this.data = new Array(N).fill(0).map(() => new Array(N).fill(0));
    for (var p of pairs) {
      this.data[p[0]][p[1]] = 1;
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0, tr = this.mapview.insertRow(); j < N; j++) {
        tr.insertCell();
      }
    }
  }

  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.N || y >= this.N) return 0;
    return this.data[x][y];
  }

  set(x: number, y: number, val: any) {
    if (x < 0 || y < 0 || x >= this.N || y >= this.N) return;
    this.data[x][y] = val;
  }

  show() {
    for (let N = this.data.length, i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        this.mapview.rows[i].cells[j].className = "cell" + this.data[i][j];
      }
    }
  }
}

function Grid() {
  const ref = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const player: Player = { x: 4, y: 5 };

    const map = new Map(ref.current, 50, [
      [3, 3],
      [4, 3],
      [5, 3],
      [8, 7],
      [8, 5],
      [6, 9],
      [6, 10],
      [6, 11],
      [7, 11],
      [7, 10],
      [7, 9],
    ]);

    scan_arc(map, player, 0, -1, 1, (x, y) => [x, y]);
    scan_arc(map, player, 0, -1, 1, (x, y) => [y, -x]);
    scan_arc(map, player, 0, -1, 1, (x, y) => [-x, -y]);
    scan_arc(map, player, 0, -1, 1, (x, y) => [-y, x]);
    map.set(player.x, player.y, "player");
    map.show();

    return () => {
      ref.current!.innerHTML = "";
    };
  }, []);
  return <table ref={ref} />;
}

export default Grid;
