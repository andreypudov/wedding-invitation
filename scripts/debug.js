/**
 * 💍 Hey there, curious coder!  
 * You’ve officially hacked into the source code of our wedding. 
 * Sadly, no cheat codes for free cake are hidden here.  
 * But if you scroll deep enough, you *might* unlock eternal love. 😉
 */

const monoStyle = [
  'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  'white-space: pre',
  'font-variant-ligatures: none',
  'line-height: 1.1'
].join(';');

console.log(`%c
    *****     *****
  ********* *********
  *******************
  *****************
    *************
      *********
        *****
          *
`, monoStyle + "; color: pink; font-weight: bold;"); 

console.log("%cWedding Debug Mode Activated 🛠️", "color: #b61c2b; font-size: 16px; font-weight: bold;");
console.log("Type %cacceptInvite()%c in the console to RSVP! 🎊", "color: green; font-weight: bold;", "");
// console.log("Type %cgodMode()%c to unlock God Mode! 🛠️", "color: orange; font-weight: bold;", "");
console.log("Type %cenableFirework()%c to light up the sky! 🎆", "color: purple; font-weight: bold;", "");

function acceptInvite() {
  console.log("🎉 Yay! You're virtually invited to celebrate love with us. 🎉");

  console.log("\n💌 Don't forget to follow our journey here:");
  console.log("%c👉 VK:        https://vk.com/peipeiandandrey", monoStyle);
  console.log("%c👉 Instagram: https://www.instagram.com/peipeiandandrey", monoStyle);
  console.log("%c👉 Facebook:  https://www.facebook.com/peipeiandandrey", monoStyle);

  window.gtag('event', 'accept_invite', {
    method: 'console'
  });
}

function godMode() {
  if (window.location.href.includes('imaginarium')) {
    const inputs = document.querySelectorAll('input, textarea');

    inputs.forEach(input => {
      input.setAttribute('maxlength', '1000');
    });
  }

  console.log("🛠️ God Mode Activated.");
  localStorage.setItem('debugMode', 'true');

  window.gtag('event', 'god_mode', {
    method: 'console'
  });
}

function enableFirework() {
  const firework = document.querySelector('.firework-container');
  if (firework) {
    firework.classList.add('enabled');
    console.log("🎆 Fireworks Enabled!");
  }
}

window.acceptInvite = acceptInvite;
window.godMode = godMode;
window.enableFirework = enableFirework;

if (localStorage.getItem('debugMode') === 'true') {
  godMode();
}