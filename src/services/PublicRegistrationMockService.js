const STORAGE_KEY = "skytron_public_registration_requests_v1";

const nowIso = () => new Date().toISOString();

const pad = (num, size) => String(num).padStart(size, "0");

const formatRefDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  return `${yyyy}${mm}${dd}`;
};

const generateReferenceNumber = () => {
  const d = new Date();
  const datePart = formatRefDate(d);
  const rand = pad(Math.floor(Math.random() * 10000), 4);
  return `SKY-REG-${datePart}-${rand}`;
};

const safeJsonParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const loadAll = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeJsonParse(raw, []);
};

const saveAll = (items) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const addStatus = (req, message) => {
  const statusEntry = {
    message,
    at: nowIso(),
  };
  return {
    ...req,
    statusHistory: [...(req.statusHistory || []), statusEntry],
    currentStatus: message,
    updatedAt: statusEntry.at,
  };
};

const createRequest = (payload) => {
  const all = loadAll();
  const referenceNumber = generateReferenceNumber();
  const createdAt = nowIso();

  let req = {
    referenceNumber,
    role: payload.role,
    applicant: payload.applicant,
    organization: payload.organization,
    roleDetails: payload.roleDetails || {},
    documents: payload.documents || [],
    remarks: "",
    credentials: null,
    createdAt,
    updatedAt: createdAt,
    currentStatus: "",
    statusHistory: [],
  };

  req = addStatus(req, `Form Submitted – dated ${new Date().toLocaleString()}`);
  req = addStatus(
    req,
    `New User Request Submitted for Further Processing – dated ${new Date().toLocaleString()}`
  );

  if (payload.role === "Others") {
    req = addStatus(
      req,
      `Details forwarded to support@skytron.in – dated ${new Date().toLocaleString()}`
    );
  }

  saveAll([req, ...all]);

  return { referenceNumber };
};

const getRequestByReference = (referenceNumber) => {
  const all = loadAll();
  return all.find((x) => x.referenceNumber === referenceNumber) || null;
};

const listRequests = () => loadAll();

const approveRequest = (referenceNumber) => {
  const all = loadAll();
  const idx = all.findIndex((x) => x.referenceNumber === referenceNumber);
  if (idx === -1) throw new Error("Request not found");

  const username = `user_${referenceNumber.slice(-4)}`;
  const password = Math.random().toString(36).slice(2, 10);

  let req = all[idx];
  req = {
    ...req,
    remarks: "",
    credentials: { username, password },
  };
  req = addStatus(
    req,
    `User Created – Credentials Shared via Email & SMS – dated ${new Date().toLocaleString()}`
  );

  const updated = [...all];
  updated[idx] = req;
  saveAll(updated);
  return req;
};

const rejectRequest = (referenceNumber, remarks) => {
  const all = loadAll();
  const idx = all.findIndex((x) => x.referenceNumber === referenceNumber);
  if (idx === -1) throw new Error("Request not found");

  let req = all[idx];
  req = {
    ...req,
    remarks: remarks || "",
    credentials: null,
  };

  req = addStatus(
    req,
    `New User Request Rejected – dated ${new Date().toLocaleString()}`
  );

  const updated = [...all];
  updated[idx] = req;
  saveAll(updated);
  return req;
};

const clearAll = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

const PublicRegistrationMockService = {
  createRequest,
  getRequestByReference,
  listRequests,
  approveRequest,
  rejectRequest,
  clearAll,
};

export default PublicRegistrationMockService;
