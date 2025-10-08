const ACCOUNT_NAME = 'peipeiandandreysta';
const IMAGINARIUM_CONTAINER_NAME = 'imaginarium';
const EMPTY_METADATA_JSON = '{russian: "", mandarin: "", width: "auto", height: "auto"}';

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

async function loadMetadata(metadataUrls) {
  const metadataList = await Promise.all(metadataUrls.map(url => fetch(url).then(response => {
    if (!response.ok) {
      return EMPTY_METADATA_JSON;
    }
    return response.json();
  }).catch(() => EMPTY_METADATA_JSON)));

  return metadataList.reduce((acc, metadata, index) => {
    const fileName = metadataUrls[index].substring(metadataUrls[index].lastIndexOf('/') + 1, metadataUrls[index].lastIndexOf('.'));
    acc[fileName] = metadata;
    return acc;
  }, {});
}

function createGallery(imageUrls, metadata) {
  return imageUrls.map((url, index) => {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    const img = document.createElement('img');

    const fileName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    const fileMetadata = metadata[fileName] || {};

    link.id = `imaginarium-grid-${index + 1}`;
    link.href = `#lightbox-imaginarium-${index + 1}`;
    img.src = url;
    img.loading = 'lazy';
    img.width = fileMetadata.width || 'auto';
    img.height = fileMetadata.height || 'auto';

    figure.appendChild(link);
    link.appendChild(img);

    return figure;
  });
}

function createLightbox(imageUrls, metadata) {
  const total = imageUrls.length;

  const entries = imageUrls.map((url, i) => {
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

    const fileName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    const fileMetadata = metadata[fileName] || {};

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';

    const img = document.createElement('img');
    img.src = url;
    img.alt = fileMetadata.russian || '';
    img.loading = 'lazy';
    img.width = fileMetadata.width || 'auto';
    img.height = fileMetadata.height || 'auto';

    imageWrapper.appendChild(img);

    const figcaption = document.createElement('figcaption');
    const russian = document.createElement('div');
    const mandarin = document.createElement('div');

    russian.className = 'russian';
    russian.textContent = truncateWithDots(fileMetadata.russian || '');
    mandarin.className = 'mandarin';
    mandarin.textContent = truncateWithDots(fileMetadata.mandarin || '');

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
  });

  return entries;
}

function truncateWithDots(str, maxLength = 128) {
  return str.length > maxLength 
    ? str.slice(0, maxLength - 3) + "..." 
    : str;
}

window.loadImaginariumFiles = loadImaginariumFiles;
window.loadMetadata = loadMetadata;
window.createGallery = createGallery;
window.createLightbox = createLightbox;