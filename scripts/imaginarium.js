const FUNCTION_APP = "imaginarium-peipeiandandrey";
const FUNCTION_NAME = "prompt_validation";

async function generateCouplePhoto(bride_clothes, groom_clothes, location, action) {
  try {
    const response = await fetch(`https://${FUNCTION_APP}.azurewebsites.net/api/${FUNCTION_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bride_clothes,
        groom_clothes,
        location,
        action
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling Azure Function:", error);
    return { status: "error", message: error.message };
  }
}

function displayAccepted() {
  const submission = document.getElementById('submission');
  const accepted = document.getElementById('accepted');

  submission.style.display = 'none';
  accepted.style.display = 'flex';
}

function displayRejected(rejectionReason) {
  const submission = document.getElementById('submission');
  const rejected = document.getElementById('rejected');
  const reason = document.getElementById('rejection-reason');

  submission.style.display = 'none';
  rejected.style.display = 'flex';
  reason.textContent = rejectionReason;
}

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

  peipeiClothes.disabled = true;
  andreyClothes.disabled = true;
  action.disabled = true;
  location.disabled = true;
  button.disabled = true;

  button.textContent = window.getString('imaginariumWaiting');

  generateCouplePhoto(
   peipeiClothes.value,
    andreyClothes.value,
    location.value,
    action.value
  ).then(result => {
    if (result.status === 'success') {
      displayAccepted();
    } else {
      displayRejected(result.reason || '');
    }

    console.log('Azure Function result:', result);
  }).catch(error => {
    displayRejected('');

    console.error('Error processing request:', error);
  });

  return false;
}


window.handleSubmit = handleSubmit;
