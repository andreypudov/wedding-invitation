const ACCOUNT_NAME = 'peipeiandandreysta';
const IMAGINARIUM_CONTAINER_NAME = 'imaginarium';
const EMPTY_METADATA_JSON = '{russian: "", mandarin: ""}';

async function fetchFiles(containerName) {
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

async function loadImaginariumFiles() {
  return await fetchFiles(IMAGINARIUM_CONTAINER_NAME);
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

async function getCaptionFromMetadata(metadataUrls, imageUrl) {
  const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
  const metadataUrl = metadataUrls.find(url => url.includes(imageName) && url.endsWith('.json'));

  if (!metadataUrl) return EMPTY_METADATA_JSON;

  try {
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      return EMPTY_METADATA_JSON;
    }

    return await response.json();
  } catch (_) {
    return EMPTY_METADATA_JSON;
  }
}

async function createLightbox(imageUrls, metadataUrls) {
  const total = imageUrls.length;

  const entries = await Promise.all(imageUrls.map(async (url, i) => {
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

    let captionJson = EMPTY_METADATA_JSON;
    try {
      captionJson = await getCaptionFromMetadata(metadataUrls, url);
    } catch (_) {
      captionJson = EMPTY_METADATA_JSON;
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';

    const img = document.createElement('img');
    img.src = url;
    img.alt = captionJson.russian || '';
    img.loading = 'lazy';

    imageWrapper.appendChild(img);

    const figcaption = document.createElement('figcaption');
    const russian = document.createElement('div');
    const mandarin = document.createElement('div');

    russian.className = 'russian';
    russian.textContent = truncateWithDots(captionJson.russian || '');
    mandarin.className = 'mandarin';
    mandarin.textContent = truncateWithDots(captionJson.mandarin || '');

    figcaption.appendChild(russian);
    figcaption.appendChild(mandarin);

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
  }));

  return entries;
}

function truncateWithDots(str, maxLength = 128) {
  return str.length > maxLength 
    ? str.slice(0, maxLength - 3) + "..." 
    : str;
}

window.loadImaginariumFiles = loadImaginariumFiles;
window.createGallery = createGallery;
window.createLightbox = createLightbox;