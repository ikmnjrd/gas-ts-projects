import { DateValue, getHolidays, getUseMonth } from "./date"
import { type IContentItem, sendPostRequest } from "./fetch"

function main(): void {
  const month = getUseMonth()
  console.log({ month })
  const firstRes = sendPostRequest(month)

  const dateValue = new DateValue(month)
  const holidays = getHolidays(dateValue)
  console.log({ holidays })
  // 土日祝日だけを候補として抽出
  const contentItems = firstRes.content.reduce((acc, curr) => {
    const found = holidays.find((holiday) =>
      holiday.equals(new DateValue(curr.use_date)),
    )
    if (!found) {
      return acc
    }
    acc.push(curr)
    return acc
  }, [] as IContentItem[])

  const ress = contentItems.map((item) => sendPostRequest(month, item.use_date))

  // 通知する
  console.log({ ress })
  const email = PropertiesService.getScriptProperties().getProperty("EMAIL")
  if (!email) return

  GmailApp.sendEmail(email, "予約可能な時間帯があります", JSON.stringify(ress))
}

// GASから参照したい変数はglobalオブジェクトに渡してあげる必要がある
// @ts-expect-error
global.main = main
