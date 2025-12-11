const weddingDate = "2026-02-14T16:00:00+08:00";

function arabicToMandarin(num) {
  const digits = '零一二三四五六七八九';
  const units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿'];

  let str = String(num);
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const n = parseInt(str[i]);
    const u = units[str.length - i - 1];
    if (n === 0) {
      if (i < str.length - 1 && str[i + 1] !== '0') result += digits[n];
    } else {
      result += digits[n] + u;
    }
  }

  return result;
}

function calculateDaysBetweenDates(dateString1, dateString2) {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        console.error("One or both date strings are invalid.");
        return NaN;
    }

    const time1 = date1.getTime();
    const time2 = date2.getTime();

    const differenceMs = Math.abs(time2 - time1);
    const msInDay = 1000 * 60 * 60 * 24;
    const differenceDays = Math.floor(differenceMs / msInDay);

    return differenceDays;
}

function getLeftTranslation(days) {
  if (days % 10 === 1 && days % 100 !== 11) {
    return "остался ";
  } else if (days >= 2 && days <= 4) {
    return "осталось ";
  } else {
    return "осталось ";
  }
}

function getDaysTranslation(days) {
  if (days % 10 === 1 && days % 100 !== 11) {
    return " день";
  } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
    return " дня";
  } else {
    return " дней";
  }
}

function updateCountdown(language) {
  const timeNow = new Date().toUTCString();
  const daysLeft = calculateDaysBetweenDates(timeNow, weddingDate);
  const countdown = document.getElementsByClassName("countdown")[0];

  if (language === "mandarin") {
    countdown.innerText = "倒數" + arabicToMandarin(daysLeft) + "天";
  } else {
    countdown.innerText = "До свадьбы " + getLeftTranslation(daysLeft) + daysLeft + getDaysTranslation(daysLeft);
  }
}

window.updateCountdown = updateCountdown;