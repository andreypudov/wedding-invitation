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
  return imageUrls.map((url, index) => {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    const img = document.createElement('img');

    link.id = `imaginarium-grid-${index + 1}`;
    link.href = `#lightbox-imaginarium-${index + 1}`;
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';

    figure.appendChild(link);
    link.appendChild(img);

    return figure;
  });
}

function createLightbox(imageUrls) {
  const total = imageUrls.length;
  return imageUrls.map((url, i) => {
    const index = i + 1;
    const prevIndex = index === 1 ? total : index - 1;
    const nextIndex = index === total ? 1 : index + 1;

    const entry = document.createElement('div');
    entry.className = 'lightbox-entry';
    entry.id = `lightbox-imaginarium-${index}`;

    const header = document.createElement('div');
    header.className = 'header';

    const counter = document.createElement('span');
    counter.className = 'counter';
    counter.textContent = `${index} / ${total}`;

    const close = document.createElement('a');
    close.href = `#imaginarium-grid-${index}`;
    close.className = 'close';
    close.innerHTML = '&times;';

    header.appendChild(counter);
    header.appendChild(close);

    const content = document.createElement('div');
    content.className = 'content';

    const prev = document.createElement('a');
    prev.href = `#lightbox-imaginarium-${prevIndex}`;
    prev.className = 'nav prev';
    prev.innerHTML = '&#10094;';

    const figure = document.createElement('figure');

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';

    const imageBorder = document.createElement('div');
    imageBorder.className = 'image-border';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Image description.';
    img.loading = 'lazy';

    imageBorder.appendChild(img);
    imageWrapper.appendChild(imageBorder);

    const figcaption = document.createElement('figcaption');
    figcaption.appendChild(document.createTextNode('Some caption here - will be defined later'));
    const small = document.createElement('small');
    small.textContent = 'Image description.';
    figcaption.appendChild(document.createTextNode(' '));
    figcaption.appendChild(small);

    figure.appendChild(imageWrapper);
    figure.appendChild(figcaption);

    const next = document.createElement('a');
    next.href = `#lightbox-imaginarium-${nextIndex}`;
    next.className = 'nav next';
    next.innerHTML = '&#10095;';

    content.appendChild(prev);
    content.appendChild(figure);
    content.appendChild(next);

    entry.appendChild(header);
    entry.appendChild(content);

    return entry;
  });
}

window.loadImaginariumImages = loadImaginariumImages;
window.createGallery = createGallery;
window.createLightbox = createLightbox;