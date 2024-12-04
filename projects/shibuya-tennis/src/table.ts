import type { IResponse } from "./fetch"

// テーブルのヘッダーを定義
const headers = ["利用日", "施設名", "エリア名", "開始時間", "終了時間"]

export function createTextTable(data: IResponse[]): string {
  // 行データを格納する配列
  const rows: string[][] = []

  // データから行を抽出
  for (const item of data) {
    for (const contentItem of item.content) {
      if (contentItem.reservable_frames) {
        for (const frame of contentItem.reservable_frames)
          rows.push([
            contentItem.use_date,
            contentItem.facility_name ?? "",
            contentItem.room_area_name ?? "",
            frame.start_time,
            frame.end_time,
          ])
      }
    }
  }

  // 各列の最大幅を計算
  const colWidths = headers.map((header, i) => {
    return Math.max(header.length, ...rows.map((row) => row[i].length))
  })

  // 行を組み立てるための関数
  const buildRow = (rowData: string[]) => {
    return `| ${rowData
      .map((cell, i) => cell.padEnd(colWidths[i], " "))
      .join(" | ")} |`
  }

  // 区切り線を作成
  const separator = `+-${colWidths.map((width) => "-".repeat(width)).join("-+-")}-+`

  // テーブルを組み立てる
  let table = `${separator}\n`
  table += `${buildRow(headers)}\n`
  table += `${separator}\n`
  for (const row of rows) {
    table += `${buildRow(row)}\n`
  }

  table += separator

  return table
}
