const STRINGS = {
  russian: {
    title: "Свадьба Пейпей и Андрея",
    peiPei: "Пейпей",
    andrey: "Андрей",
    rsvp: "Подтверждение участия",
  },
  chinese: {
    title: "珮珮和安德烈的婚禮",
    peiPei: "珮珮",
    andrey: "安德烈",
    rsvp: "敬請回覆",
  },
};

function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage;
}

function getSupportedLanguages() {
  const browserLanguage = getBrowserLanguage();

  if (browserLanguage.startsWith("zh")) {
    return "chinese";
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