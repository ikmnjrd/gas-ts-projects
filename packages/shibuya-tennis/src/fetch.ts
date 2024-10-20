interface IResponseReservableFrames {
  warns: unknown[];
  message: unknown[];
  errors: unknown[];
  content: {
    use_date: string;
    facility_name: string | null;
    room_area_id: number | null;
    room_area_name: string | null;
    reservable: boolean;
    tel: string | null;
    code: string;
    reservable_period: boolean;
    reservable_frames:
      | {
          id: number;
          start_time: string; // "9:00", "13:00"
          end_time: string; // "11:00", "15:00"
          room_area_code_names: null; // 使われてるところを見たことがない
          vacancy_amount: number;
          usage_fee: number;
        }[]
      | null;
  }[];
}

/**
 * use_month=あり,use_date=なし: 予約可能な時間帯があるものがcontentにある, 予約不可能なものはcontentの配列に含まれない
 * use_month=あり,use_date=あり: content.lengthは1, reservable_frames
 */
export function sendPostRequest(useMonth: string, useDate?: string): void {
  const url =
    "https://www.yoyaku.city.shibuya.tokyo.jp/api/reservations/facilities/room_areas/reservable_frames";
  const payload = {
    use_type_code: "150080",
    facility_id: 1004,
    use_month: useMonth,
    use_date: useDate,
    start_time: "",
    end_time: "",
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Xsrf-Token": "342901d2-1623-4a27-9516-c8c1eec2f9a9",
    Cookie:
      "XSRF-TOKEN=342901d2-1623-4a27-9516-c8c1eec2f9a9; AWSALB=zGaN6tyqEp+7CsdA4E99gBpX0Y+eAgymEGpPO3kskPwy3kwAoEuuyFMqJeBCeIJqn3TwKq5MdgHc0yUlFdDC1ob0WcWUTDuBqQw+/HqzCBlFywC04Rd2KqguVPtl; AWSALBCORS=zGaN6tyqEp+7CsdA4E99gBpX0Y+eAgymEGpPO3kskPwy3kwAoEuuyFMqJeBCeIJqn3TwKq5MdgHc0yUlFdDC1ob0WcWUTDuBqQw+/HqzCBlFywC04Rd2KqguVPtl",
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    const responseData: IResponseReservableFrames = JSON.parse(responseText);

    Logger.log({ responseData });

    if (responseCode === 200) {
      Logger.log("Request was successful.");
      processResponse(responseData);
    } else {
      Logger.log(`Request failed with status: ${responseCode}`);
      Logger.log(responseText);
    }
  } catch (error) {
    Logger.log(`An error occurred: ${error}`);
  }
}

function processResponse(responseData: IResponseReservableFrames): void {
  if (responseData?.content && responseData.content.length > 0) {
    const content = responseData.content.at(0);
    const reservableFrames = content?.reservable_frames;

    if (!reservableFrames) {
      Logger.log("No reservable frames found.");
      return;
    }

    for (const frame of reservableFrames) {
      Logger.log(
        `Start Time: ${frame.start_time}, End Time: ${frame.end_time}, Vacancy: ${frame.vacancy_amount}, Usage Fee: ${frame.usage_fee}`,
      );
    }
  } else {
    Logger.log("No content found in the response.");
  }
}
