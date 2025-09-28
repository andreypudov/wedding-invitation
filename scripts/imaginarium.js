function handleSubmit(event) {
  event.preventDefault();
  
  const peipeiClothes = document.getElementById('peipei-clothes').value;
  const andreyClothes = document.getElementById('andrey-clothes').value;
  const action = document.getElementById('action').value;
  const location = document.getElementById('location').value;
  
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

  return false;
}


window.handleSubmit = handleSubmit;
