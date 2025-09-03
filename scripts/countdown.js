const weddingDate = "2026-02-14";

function arabicToChinese(num) {
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

function daysUntil(targetDateStr) {
  const today = new Date();
  const targetDate = new Date(targetDateStr);

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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
  } else if (days >= 2 && days <= 4) {
    return " дня";
  } else {
    return " дней";
  }
}

function updateCountdown(language) {
  const daysLeft = daysUntil(weddingDate);
  const countdown = document.getElementsByClassName("countdown")[0];

  if (language === "chinese") {
    countdown.innerText = "倒數" + arabicToChinese(daysLeft) + "天";
  } else {
    countdown.innerText = "До свадьбы " + getLeftTranslation(daysLeft) + daysLeft + getDaysTranslation(daysLeft);
  }
}

window.updateCountdown = updateCountdown;