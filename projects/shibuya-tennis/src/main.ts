import dayjs from "dayjs"
import { surveyAt } from "./fetch"

function main(): void {
  const thisMonth = dayjs().format("YYYY/MM")
  const nextMonth = dayjs().add(1, "month").format("YYYY/MM")
  const thisMonthRes = surveyAt(thisMonth)
  const nextMonthRes = surveyAt(nextMonth)

  const result = [...thisMonthRes, ...nextMonthRes]
  if (result.length === 0) {
    console.log("予約可能な時間帯はありませんでした")
    return
  }

  const email = PropertiesService.getScriptProperties().getProperty("EMAIL")
  if (!email) return

  GmailApp.sendEmail(
    email,
    "予約可能な時間帯があります",
    JSON.stringify(result),
  )
}

// GASから参照したい変数はglobalオブジェクトに渡してあげる必要がある
// @ts-ignore
global.main = main
