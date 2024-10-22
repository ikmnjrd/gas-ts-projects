import * as HolidayJp from "@holiday-jp/holiday_jp"

export class DateValue {
  public year: number
  public month: number
  public day?: number // 日付はオプショナル

  /**
   * コンストラクタは "YYYY/M/D" または "YYYY/M" の形式の文字列を受け取ります。
   * @param dateString フォーマットされた日付文字列
   */
  constructor(dateString: string) {
    const parts = dateString.split("/")

    if ([2, 3].includes(parts.length) === false) {
      throw new Error(
        '日付文字列の形式が正しくありません。"YYYY/M/D" または "YYYY/M" の形式で指定してください。',
      )
    }

    this.year = Number.parseInt(parts[0], 10)
    this.month = Number.parseInt(parts[1], 10)

    if (Number.isNaN(this.year) || Number.isNaN(this.month)) {
      throw new Error("年と月は数値で指定してください。")
    }

    if (parts.length === 3) {
      this.day = Number.parseInt(parts[2], 10)
      if (Number.isNaN(this.day)) {
        throw new Error("日付は数値で指定してください。")
      }
    }
  }

  /**
   * 日付を "YYYY/M" または "YYYY/M/D" の形式で文字列に変換します。
   */
  toString(): string {
    if (this.day !== undefined) {
      return `${this.year}/${this.month}/${this.day}`
    }
    return `${this.year}/${this.month}`
  }

  /**
   * 他の DateValue オブジェクトと値が等しいかを判定します。
   * @param other 比較対象の DateValue オブジェクト
   * @returns 等しい場合は true、そうでない場合は false
   */
  equals(other: DateValue): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    )
  }

  static jsDateToDateValueConstructor(date: Date): string {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }
}

export function getUseMonth(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const nextWeekend = new Date()

  if (dayOfWeek === 6) {
    nextWeekend.setDate(today.getDate() + 1)
  } else if (dayOfWeek === 0) {
    nextWeekend.setDate(today.getDate())
  } else {
    nextWeekend.setDate(today.getDate() + (6 - dayOfWeek))
  }

  const month = nextWeekend.getMonth() + 1
  const year = nextWeekend.getFullYear()

  return `${year}/${month < 10 ? "0" : ""}${month}`
}

export function getNationalHolidays(date: DateValue): DateValue[] {
  const monthIndex = date.month - 1

  // 指定した月の最終日を取得
  const lastDay = new Date(date.year, date.month, 0).getDate()

  return HolidayJp.between(
    new Date(date.year, monthIndex, 1),
    new Date(date.year, monthIndex, lastDay),
  ).map((holiday) => {
    return new DateValue(
      DateValue.jsDateToDateValueConstructor(new Date(holiday.date)),
    )
  })
}

export function getWeekends(dateValue: DateValue): DateValue[] {
  // JavaScriptのDateオブジェクトでは月が0から始まるので調整
  const monthIndex = dateValue.month - 1

  // 指定した月の最終日を取得
  const lastDay = new Date(dateValue.year, dateValue.month, 0).getDate()

  const days: DateValue[] = []
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(dateValue.year, monthIndex, day)
    const dayOfWeek = date.getDay() // 0(日曜)から6(土曜)

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const formattedDate = DateValue.jsDateToDateValueConstructor(date)
      days.push(new DateValue(formattedDate))
    }
  }

  return days
}

export function getHolidays(target: DateValue): DateValue[] {
  const weekends = getWeekends(target)
  const nationalHolidays = getNationalHolidays(target)
  const holydays = mergeAndSortDateValues(weekends, nationalHolidays)

  return holydays
}

function mergeAndSortDateValues(
  array1: DateValue[],
  array2: DateValue[],
): DateValue[] {
  // 2つの配列を結合
  const combinedArray = [...array1, ...array2]

  // 日付順に並び替え
  combinedArray.sort((a, b) => {
    // 年、月、日を比較
    if (a.year !== b.year) {
      return a.year - b.year
    }
    if (a.month !== b.month) {
      return a.month - b.month
    }

    // 日付が undefined の場合の扱いを定義
    const dayA = a.day !== undefined ? a.day : 0 // 日付がない場合は0とする（他の日付より前に来る）
    const dayB = b.day !== undefined ? b.day : 0

    return dayA - dayB
  })

  return combinedArray
}
