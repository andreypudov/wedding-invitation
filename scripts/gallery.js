const ACCOUNT_NAME = 'peipeiandandreysta';
const IMAGINARIUM_CONTAINER_NAME = 'imaginarium';

async function fetchImages(containerName) {
  try {
    const baseUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${containerName}`;
    const url = `${baseUrl}?restype=container&comp=list`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-ms-version': '2023-11-03'
      }
    });

    if (!response.ok) {
      throw new Error(`Azure Blob Storage API request failed: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse Azure Blob Storage response XML');
    }

    const blobs = xmlDoc.querySelectorAll('Blob Name');
    const imageUrls = Array.from(blobs).map(blob => {
      const blobName = blob.textContent;
      console.log(blob);
      return `${baseUrl}/${blobName}`;
    }).filter(url => url);

    return imageUrls;
  } catch (error) {
    return [];
  }
}

async function loadImaginariumImages() {
  return await fetchImages(IMAGINARIUM_CONTAINER_NAME);
}

function createGallery(imageUrls) {
  const template = `<figure>
      <a id="imaginarium-grid-<id>" href="#lightbox-imaginarium-<id>">
          <img src="<url>" alt="" />
      </a>
    </figure>`;
  return imageUrls.map((url, index) => {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    const img = document.createElement('img');

    link.id = `imaginarium-grid-${index + 1}`;
    link.href = `#lightbox-imaginarium-${index + 1}`;
    img.src = url;
    img.alt = '';

    figure.appendChild(link);
    link.appendChild(img);

    return figure;
  });
}

window.loadImaginariumImages = loadImaginariumImages;
window.createGallery = createGallery;