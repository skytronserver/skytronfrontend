import { getAxiosInstance } from './axiosInstance';

// ─── Step 1 — Create Entry (Vahan) ───────────────────────────────────────────
const createEntry = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step1/', data);
};

// ─── Step 2 — eSIM / M2M Check ───────────────────────────────────────────────
const checkESim = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step2/', { id });
};

// ─── Step 3 — Dealer OTP ─────────────────────────────────────────────────────
const resendDealerOtp = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step3/resend/', { id });
};

const verifyDealerOtp = (id, otp) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step3/verify/', { id, otp });
};

// ─── Step 4 — GPS Packet Health Check ────────────────────────────────────────
const checkGpsPackets = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step4/', { id });
};

// ─── Step 5 — Owner OTP + Final Commit ───────────────────────────────────────
const sendOwnerOtp = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step5/send/', { id });
};

const resendOwnerOtp = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step5/resend/', { id });
};

const verifyOwnerOtp = (id, otp) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/v2/step5/verify/', { id, otp });
};

// ─── Supporting APIs ─────────────────────────────────────────────────────────

/** GET all non-deleted entries for the current dealer with step status.
 *  @param {object} params  e.g. { step: 3 }  (optional filter by step)
 */
const getMyEntries = (params = {}) => {
  const http = getAxiosInstance();
  return http.get('/api/tag/v2/my-entries/', { params });
};

/** GET manufacturer → model → eSIM provider tree for Step 1 dropdowns */
const getManufacturerTree = () => {
  const http = getAxiosInstance();
  return http.get('/api/tag/v2/my-manufacturers/');
};

const NewTaggingService = {
  createEntry,
  checkESim,
  resendDealerOtp,
  verifyDealerOtp,
  checkGpsPackets,
  sendOwnerOtp,
  resendOwnerOtp,
  verifyOwnerOtp,
  getMyEntries,
  getManufacturerTree,
};

export default NewTaggingService;
