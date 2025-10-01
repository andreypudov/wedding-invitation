const STRINGS = {
  russian: {
    titleHome: "Свадьба Пейпей и Андрея",
    titleRSVP: "Подтверждение участия - Свадьба Пейпей и Андрея",
    title404: "404 - Свадьба Пейпей и Андрея",

    invitationTitle: "Дорогие родные, друзья и близкие!",
    invitationDescription: "С радостью сообщаем, что мы женимся! Мы искренне приглашаем вас разделить с нами этот особенный и важный день. Наша свадьба состоится 14 февраля 2026 года, и для нас будет большой честью и счастьем, если вы будете рядом, чтобы разделить нашу радость и благословить наш союз.",
    invitationLocationName: "Место проведения:",
    invitationLocationValue: "Crowne Plaza Tainan by IHG",
    invitationCeremonyName: "Церемония:",
    invitationCeremonyValue: "16:00",
    invitationDinnerName: "Праздничный банкет:",
    invitationDinnerValue: "18:00",
    invitationDressCodeName: "Дресс-код:",
    invitationDressCodeValue: "официальная одежда",
    invitationConfirmation: "Для лучшей организации мероприятия будем благодарны, если вы сможете подтвердить своё присутствие в ближайшее время. Если вы пока не уверены, пожалуйста, сообщите нам об этом.",
    invitationAnticipation: "Мы с нетерпением ждём встречи и возможности провести вместе этот особенный День святого Валентина! ❤️",

    imaginariumTitle: "Имаджинариум",
    imaginariumClothesPeiPei: "Одежда Пейпей",
    imaginariumClothesPeiPeiPlaceholder: "Свадебное платье",
    imaginariumClothesAndrey: "Одежда Андрея",
    imaginariumClothesAndreyPlaceholder: "Смокинг",
    imaginariumAction: "Чем они заняты...",
    imaginariumActionPlaceholder: "Танцуют вальс",
    imaginariumLocation: "Где они находятся...",
    imaginariumLocationPlaceholder: "В красивом саду",
    imaginariumGenerate: "Покажите нам вашу идею...",
    imaginariumWaiting: "Пожалуйста, подождите, идёт создание...",

    galleryTitle: "Галерея",
    galleryLoading: "Пожалуйста, подождите...",

    notfoundHeader: "Похоже, вы забрели не в тот банкетный зал.",
    notfoundSubheader: "Давайте вернём вас на праздник!",
    notFoundToMain: "На главную",

    peiPei: "Пейпей",
    andrey: "Андрей",
  },
  mandarin: {
    titleHome: "珮珮和安德烈的婚禮",
    titleRSVP: "出席調查 - 珮珮和安德烈的婚禮",
    title404: "404 - 珮珮和安德烈的婚禮",

    invitationTitle: "各位親愛的家人、長輩和朋友們：",
    invitationDescription: "我們要結婚了！ 誠摯地邀請您一同見證我們的重要時刻。婚禮將於 2026年2月14日 舉行，我們希望能與您一同分享這份喜悅與祝福。",
    invitationLocationName: "地點：",
    invitationLocationValue: "台南大員皇冠假日酒店",
    invitationCeremonyName: "證婚儀式：",
    invitationCeremonyValue: "16:00",
    invitationDinnerName: "晚宴：",
    invitationDinnerValue: "18:00",
    invitationDressCodeName: "Dress-code:",
    invitationDressCodeValue: "正式服裝",
    invitationConfirmation: "為了估計人數，若您能盡快回覆，我們將非常感謝。若您還不能確定，也歡迎直接跟我們說聲。",
    invitationAnticipation: "期待與您相聚，共度特別的情人節！",

    imaginariumTitle: "想像世界",
    imaginariumClothesPeiPei: "珮珮的服裝",
    imaginariumClothesPeiPeiPlaceholder: "婚紗",
    imaginariumClothesAndrey: "安德烈的服裝",
    imaginariumClothesAndreyPlaceholder: "燕尾服",
    imaginariumAction: "他們正在做什麼…",
    imaginariumActionPlaceholder: "跳華爾滋",
    imaginariumLocation: "他們在哪裡…",
    imaginariumLocationPlaceholder: "在美麗的花園裡",
    imaginariumGenerate: "展現您的創意…",
    imaginariumWaiting: "請稍候，正在生成…",

    galleryTitle: "相簿",
    galleryLoading: "請稍候，讀取中...",

    notfoundHeader: "看起來你走錯宴會廳了。",
    notfoundSubheader: "讓我們帶你回到派對吧！",
    notFoundToMain: "回到首頁",

    peiPei: "珮珮",
    andrey: "安德烈",
  },
};

function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage;
}

function getSupportedLanguages() {
  const browserLanguage = getBrowserLanguage();

  if (browserLanguage.startsWith("zh")) {
    return "mandarin";
  } else {
    return "russian";
  }
}

function setLanguage(language) {
  localStorage.setItem("language", language);
  window.language = getLanguage();
}

function getLanguage() {
  const language = localStorage.getItem("language");

  if (!language) {
    const browserLanguage = getBrowserLanguage();
    const supportedLanguage = getSupportedLanguages(browserLanguage);
    setLanguage(supportedLanguage);

    return supportedLanguage;
  }

  return language;
}

function getString(key) {
  const language = window.language;
  return STRINGS[language][key] || key;
}

window.language = getLanguage();
window.getString = getString;
window.setLanguage = setLanguage;