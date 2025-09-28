function handleSubmit(event) {
  event.preventDefault();
  
  const peipeiClothes = document.getElementById('peipei-clothes');
  const andreyClothes = document.getElementById('andrey-clothes');
  const action = document.getElementById('action');
  const location = document.getElementById('location');
  const button = document.getElementById('submit-button');
  
  if (!peipeiClothes || !andreyClothes || !action || !location) {
    alert('Please fill in all fields');
    return;
  }
  
  console.log('Form data:', {
    peipeiClothes,
    andreyClothes,
    action,
    location
  });

  peipeiClothes.disabled = true;
  andreyClothes.disabled = true;
  action.disabled = true;
  location.disabled = true;
  button.disabled = true;

  button.textContent = window.getString('imaginariumWaiting');

  return false;
}


window.handleSubmit = handleSubmit;
