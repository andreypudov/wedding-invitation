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

function acceptInvite() {
  console.log("🎉 Yay! You're virtually invited to celebrate love with us. 🎉");

  console.log("\n💌 Don't forget to follow our journey here:");
  console.log("%c👉 VK:        https://vk.com/peipeiandandrey", monoStyle);
  console.log("%c👉 Instagram: https://www.instagram.com/peipeiandandrey", monoStyle);
  console.log("%c👉 Facebook:  https://www.facebook.com/peipeiandandrey", monoStyle);
}

window.acceptInvite = acceptInvite;