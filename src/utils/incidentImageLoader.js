/**
 * Utility for securely loading incident images from API
 * Uses authentication token and POST request for security
 */

const API_URL = `${process.env.REACT_APP_BASE_URL}api/download/`;

/**
 * Fetches an incident image securely using the authenticated API
 * @param {string} filePath - The file path from incident data (e.g., "fileuploads/incidents/xxxxx.png")
 * @param {string} authToken - The authentication token from session storage
 * @returns {Promise<Blob>} - The image/video blob data
 */
export const fetchSecureIncidentMedia = async (filePath, authToken) => {
  if (!filePath || !authToken) {
    throw new Error("File path and auth token are required");
  }

  const payload = {
    file_path: filePath,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error fetching secure incident media:", error);
    throw error;
  }
};

/**
 * Converts a blob to an object URL for rendering
 * @param {Blob} blob - The media blob
 * @returns {string} - Object URL that can be used as src
 */
export const createMediaUrl = (blob) => {
  return URL.createObjectURL(blob);
};

/**
 * Checks if a file path is a video based on extension
 * @param {string} filePath - The file path to check
 * @returns {boolean} - True if it's a video, false if it's an image
 */
export const isVideoFile = (filePath) => {
  return /\.(mp4|webm|ogg|mov)$/i.test(filePath);
};

/**
 * Loads incident image/video and renders it securely
 * @param {string} filePath - The file path from incident data
 * @param {string} containerId - The ID of the DOM element to render into
 * @param {Object} options - Optional configuration
 * @returns {Promise<void>}
 */
export const renderSecureIncidentMedia = async (filePath, containerId, options = {}) => {
  const {
    maxWidth = "100%",
    maxHeight = "160px",
    borderRadius = "6px",
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container with ID "${containerId}" not found`);
    return;
  }

  try {
    // Show loading state
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 160px; background: #f5f5f5; border-radius: ${borderRadius}; border: 1px solid #eee; font-size: 12px; color: #999;">
        Loading...
      </div>
    `;

    // Get auth token from session storage
    const authToken = sessionStorage.getItem("oAuthToken");
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    // Fetch the media blob
    const mediaBlob = await fetchSecureIncidentMedia(filePath, authToken);
    const mediaUrl = createMediaUrl(mediaBlob);

    // Determine if it's video or image
    const isVideo = isVideoFile(filePath);

    // Render appropriate element
    if (isVideo) {
      container.innerHTML = `
        <video 
          src="${mediaUrl}" 
          controls 
          style="
            width: ${maxWidth}; 
            max-height: ${maxHeight}; 
            border-radius: ${borderRadius}; 
            border: 1px solid #eee; 
            display: block;
          "
        ></video>
      `;
    } else {
      container.innerHTML = `
        <img 
          src="${mediaUrl}" 
          alt="Incident Media" 
          style="
            width: ${maxWidth}; 
            max-height: ${maxHeight}; 
            object-fit: cover; 
            border-radius: ${borderRadius}; 
            border: 1px solid #eee; 
            display: block;
          "
        />
      `;
    }
  } catch (error) {
    console.error("Error rendering secure incident media:", error);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="padding: 10px; color: #e53935; font-size: 12px; background: #fef2f2; border-radius: ${options.borderRadius || '6px'}; border: 1px solid #fecaca;">
          Failed to load media
        </div>
      `;
    }
  }
};

/**
 * Generates HTML string for incident media without DOM manipulation
 * Useful for building HTML before insertion (e.g., in popup HTML)
 * @param {string} filePath - The file path from incident data
 * @param {Object} options - Style options
 * @returns {Promise<string>} - HTML string for the media
 */
export const buildSecureIncidentMediaHtml = async (filePath, options = {}) => {
  const {
    maxWidth = "100%",
    maxHeight = "160px",
    borderRadius = "6px",
  } = options;

  try {
    const authToken = sessionStorage.getItem("oAuthToken");
    if (!authToken) {
      return '';
    }

    const mediaBlob = await fetchSecureIncidentMedia(filePath, authToken);
    const mediaUrl = createMediaUrl(mediaBlob);
    const isVideo = isVideoFile(filePath);

    if (isVideo) {
      return `
        <div style="margin-top: 8px;">
          <video 
            src="${mediaUrl}" 
            controls 
            style="
              width: ${maxWidth}; 
              max-height: ${maxHeight}; 
              border-radius: ${borderRadius}; 
              border: 1px solid #eee; 
              display: block;
            "
          ></video>
        </div>
      `;
    }

    return `
      <div style="margin-top: 8px;">
        <img 
          src="${mediaUrl}" 
          alt="Incident Media" 
          style="
            width: ${maxWidth}; 
            max-height: ${maxHeight}; 
            object-fit: cover; 
            border-radius: ${borderRadius}; 
            border: 1px solid #eee; 
            display: block;
          "
        />
      </div>
    `;
  } catch (error) {
    console.error("Error building secure incident media HTML:", error);
    return '';
  }
};

const incidentImageLoader = {
  fetchSecureIncidentMedia,
  createMediaUrl,
  isVideoFile,
  renderSecureIncidentMedia,
  buildSecureIncidentMediaHtml,
};

export default incidentImageLoader;
