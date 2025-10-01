const FUNCTION_APP = "imaginarium-peipeiandandrey";
const FUNCTION_NAME = "prompt_validation";

async function generateCouplePhoto({ bride_clothes, groom_clothes, location, action }) {
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

  const request = {
    bride_clothes: peipeiClothes.value,
    groom_clothes: andreyClothes.value,
    action: action.value,
    location: location.value
  }

  logRequest(request);

  generateCouplePhoto(request).then(result => {
    if (result.status === 'approved') {
      displayAccepted();
    } else {
      displayRejected(result.reason || '');
    }
  }).catch(error => {
    console.error('Error:', error);
    displayRejected('');
  });

  return false;
}

function logRequest(requestData) {
  const maxEntries = 100;

  const logs = JSON.parse(localStorage.getItem("imaginarium-logs") || "[]");

  logs.push({
    timestamp: new Date().toISOString(),
    ...requestData
  });

  window.gtag('event', 'imaginarium_request', requestData);

  const trimmedLogs = logs.slice(-maxEntries);

  localStorage.setItem("imaginarium-logs", JSON.stringify(trimmedLogs));
}

window.handleSubmit = handleSubmit;
