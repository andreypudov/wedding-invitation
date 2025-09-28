const ACCOUNT_NAME = 'yourstorageaccount';

async function loadImages(containerName) {
  try {
    if (!containerName) {
      throw new Error('Container name is required');
    }

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
    const fileNames = Array.from(blobs).map(blob => {
      const name = blob.textContent;
      return name.includes('/') ? name.split('/').pop() : name;
    }).filter(name => name); // Remove any empty names

    return fileNames;
  } catch (error) {
    return [];
  }
}

window.loadImages = loadImages;

// Usage example:
// const files = await loadImages('imaginarium');