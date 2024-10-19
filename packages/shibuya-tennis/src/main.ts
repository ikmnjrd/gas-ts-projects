

function sendPostRequest(): void {
  const url = 'https://www.yoyaku.city.shibuya.tokyo.jp/api/reservations/facilities/room_areas/reservable_frames';
  const payload = {
    "use_type_code": "150080",
    "facility_id": 1004,
    "use_month": getUseMonth(),
    "use_date": "",
    "start_time": "",
    "end_time": ""
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Xsrf-Token": "342901d2-1623-4a27-9516-c8c1eec2f9a9",
    "Cookie": "XSRF-TOKEN=342901d2-1623-4a27-9516-c8c1eec2f9a9; AWSALB=zGaN6tyqEp+7CsdA4E99gBpX0Y+eAgymEGpPO3kskPwy3kwAoEuuyFMqJeBCeIJqn3TwKq5MdgHc0yUlFdDC1ob0WcWUTDuBqQw+/HqzCBlFywC04Rd2KqguVPtl; AWSALBCORS=zGaN6tyqEp+7CsdA4E99gBpX0Y+eAgymEGpPO3kskPwy3kwAoEuuyFMqJeBCeIJqn3TwKq5MdgHc0yUlFdDC1ob0WcWUTDuBqQw+/HqzCBlFywC04Rd2KqguVPtl"
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    const responseData: unknown = JSON.parse(responseText);

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

function getUseMonth(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const nextWeekend = new Date();

  if (dayOfWeek === 6) {
    nextWeekend.setDate(today.getDate() + 1);
  } else if (dayOfWeek === 0) {
    nextWeekend.setDate(today.getDate());
  } else {
    nextWeekend.setDate(today.getDate() + (6 - dayOfWeek));
  }

  const month = nextWeekend.getMonth() + 1;
  const year = nextWeekend.getFullYear();

  return `${year}/${month < 10 ? '0' : ''}${month}`;
}

function processResponse(responseData: any): void {
  if (responseData.content && responseData.content.length > 0) {
    const content = responseData.content[0];
    const reservableFrames = content.reservable_frames;

    reservableFrames.forEach((frame: any) => {
      Logger.log(`Start Time: ${frame.start_time}, End Time: ${frame.end_time}, Vacancy: ${frame.vacancy_amount}, Usage Fee: ${frame.usage_fee}`);
    });
  } else {
    Logger.log("No content found in the response.");
  }
}

