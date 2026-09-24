export function TimingsConversion(timeRange) {
    const now = new Date();
    let start_time, end_time;
    if (timeRange === "today") {
      start_time = new Date(now);
      start_time.setHours(0, 0, 0, 0);
      end_time = new Date(now);
    } else if (timeRange === "last24h") {
        start_time = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours
        end_time = new Date(now);
    } else if (timeRange === "yesterday") {
      start_time = new Date(now);
      start_time.setDate(now.getDate() - 1);
      start_time.setHours(0, 0, 0, 0);
      end_time = new Date(now);
      end_time.setDate(now.getDate() - 1);
      end_time.setHours(23, 59, 59, 999);
    } else if (timeRange === "WTD") {
      const sundayBeforeNow = new Date(now);
      sundayBeforeNow.setDate(now.getDate() - now.getDay());
      sundayBeforeNow.setHours(0, 0, 0, 0);
      start_time = new Date(sundayBeforeNow);
      end_time = new Date(now);
    } else if (timeRange === "MTD") {
      start_time = new Date(now);
      start_time.setDate(1);
      start_time.setHours(0, 0, 0, 0);
      end_time = new Date(now);
    } else if (timeRange === "YTD") {
      start_time = new Date(now);
      start_time.setMonth(0);
      start_time.setDate(1);
      start_time.setHours(0, 0, 0, 0);
      end_time = new Date(now);
    }
    else if (timeRange === "1minute") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setMinutes(start_time.getMinutes() - 1);
        end_time = new Date(roundedHour);
      } else if (timeRange === "5minutes") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setMinutes(start_time.getMinutes() - 5);
        end_time = new Date(roundedHour);
      }else if (timeRange === "10minutes") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setMinutes(start_time.getMinutes() - 10);
        end_time = new Date(roundedHour);
      }else if (timeRange === "15minutes") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setMinutes(start_time.getMinutes() - 15);
        end_time = new Date(roundedHour);
      }else if (timeRange === "30minutes") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setMinutes(start_time.getMinutes() - 30);
        end_time = new Date(roundedHour);
      }else if (timeRange === "1hour") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setHours(start_time.getHours() - 1);
        end_time = new Date(roundedHour);
      }else if (timeRange === "4hours") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setHours(start_time.getHours() - 4);
        end_time = new Date(roundedHour);
      }else if (timeRange === "8hours") {
        const roundedHour = new Date(now);
        start_time = new Date(now);  
      start_time.setHours(start_time.getHours() - 8);
        end_time = new Date(roundedHour);
      } else {
        start_time = new Date(now);
        start_time.setHours(0, 0, 0, 0);
        end_time = new Date(now);
    }
    // Format dates to the desired string format
    const formatDate = date =>
      `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
 
    return [formatDate(start_time), formatDate(end_time)];
  }