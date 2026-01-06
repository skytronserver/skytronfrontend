import { getAxiosInstance } from './axiosInstance';

const shouldUseMock = () => {
  const flag = process.env.REACT_APP_USE_SCHOOLBUS_MOCK;
  if (flag === undefined || flag === null) return true;
  return String(flag).toLowerCase() === 'true';
};

const mockDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeRegNo = (value) => String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const a1 = toNum(lat1);
  const o1 = toNum(lon1);
  const a2 = toNum(lat2);
  const o2 = toNum(lon2);
  if ([a1, o1, a2, o2].some((n) => n === null)) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(a2 - a1);
  const dLon = toRad(o2 - o1);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const aa = s1 * s1 + Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

const nowTimestamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const mockDb = {
  schoolApplications: [
    {
      id: '1',
      schoolName: 'DPS North',
      contactPerson: 'Anil Sharma',
      mobile: '9876543210',
      email: 'admin@dpsnorth.edu',
      address: 'Sector 5, Delhi',
      latitude: '28.6139',
      longitude: '77.2090',
      status: 'Pending',
      remarks: ''
    },
    {
      id: '2',
      schoolName: 'Ryan International',
      contactPerson: 'Meena Singh',
      mobile: '9876543222',
      email: 'contact@ryan.edu',
      address: 'South Zone, Delhi',
      latitude: '28.6200',
      longitude: '77.2150',
      status: 'Approved',
      remarks: 'KYC verified'
    }
  ],
  holidays: [
    { id: '1', date: '2025-01-26', name: 'Republic Day', type: 'Holiday' },
    { id: '2', date: '2025-03-08', name: 'Annual Sports Day', type: 'Event' }
  ],
  reports: {
    unplannedUsage: [
      { id: '1', date: '2025-01-26', vehicleRegNo: 'AS01 EA3426', reason: 'Holiday Trip', distanceKm: 12.2, remarks: 'Unscheduled on holiday' },
      { id: '2', date: '2025-02-02', vehicleRegNo: 'AS01 FQ1901', reason: 'Route Deviation', distanceKm: 5.7, remarks: 'Deviation from planned route' }
    ],
    attendance: [
      { id: '1', date: '2025-02-03', route: 'Route A - North', student: 'Aarav Kumar', pickup: 'Present', drop: 'Present' },
      { id: '2', date: '2025-02-03', route: 'Route A - North', student: 'Diya Sharma', pickup: 'Absent', drop: 'Absent' }
    ],
    tripManagement: [
      { id: '1', date: '2025-02-03', vehicleRegNo: 'AS01 EA3426', route: 'Route A - North', tripType: 'Morning Pickup', status: 'Completed' },
      { id: '2', date: '2025-02-03', vehicleRegNo: 'AS01 FQ1901', route: 'Route B - South', tripType: 'Evening Drop', status: 'Delayed' }
    ],
    traffic: [
      { id: '1', date: '2025-02-03', route: 'Route A - North', avgSpeed: 18, congestionIndex: 'High', delayMinutes: 12 },
      { id: '2', date: '2025-02-03', route: 'Route B - South', avgSpeed: 26, congestionIndex: 'Medium', delayMinutes: 6 }
    ]
  },
  alertsFeed: [
    {
      id: '1',
      time: '2025-02-03 07:42:10',
      vehicleRegNo: 'DL 1PC 1234',
      route: 'Route A - North',
      category: 'Driving',
      type: 'Overspeed',
      severity: 'Warning',
      message: 'Speed exceeded 60 km/h'
    },
    {
      id: '2',
      time: '2025-02-03 08:05:55',
      vehicleRegNo: 'DL 1PB 5678',
      route: 'Route B - South',
      category: 'Trip',
      type: 'Deviation',
      severity: 'Critical',
      message: 'Bus deviated from planned route by 1.2 km'
    },
    {
      id: '3',
      time: '2025-02-03 14:33:22',
      vehicleRegNo: 'DL 1PC 1234',
      route: 'Route A - North',
      category: 'SOS',
      type: 'SOS',
      severity: 'Critical',
      message: 'SOS triggered by driver'
    }
  ],
  taggedVehicles: [
    { id: 1, regNo: 'AS01 EA3426', school: 'DPS North', status: 'Approved', date: '2025-10-15' },
    { id: 2, regNo: 'AS01 FQ1901', school: 'Ryan International', status: 'Pending', date: '2025-12-20' }
  ],
  routes: [{ id: '1', routeName: 'Route A - North', description: 'Morning/Evening North Zone', status: 'Active', stopsCount: 2 }],
  stopsByRouteId: {
    '1': [
      { id: '1', stopName: 'Sector 5 Gates', latitude: '28.6139', longitude: '77.2090', timing: '07:30 AM' },
      { id: '2', stopName: 'Modern School Stop', latitude: '28.6145', longitude: '77.2095', timing: '07:45 AM' }
    ]
  },
  buses: [
    { id: '1', regNo: 'AS01 EA3426', driverName: 'Suresh Kumar' },
    { id: '2', regNo: 'AS01 FQ1901', driverName: 'Amit Singh' }
  ],
  routeOptions: [
    { id: '1', name: 'Route A - North' },
    { id: '2', name: 'Route B - South' }
  ],
  assignments: [
    {
      id: '1',
      busRegNo: 'AS01 EA3426',
      driverName: 'Suresh Kumar',
      routeName: 'Route A - North',
      assignmentDate: '2025-01-10',
      status: 'Active'
    }
  ],
  parents: [
    { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', mobile: '9876543210', address: 'Delhi Sector 5', lat: '28.6139', lon: '77.2090' }
  ],
  students: [
    {
      id: '1',
      name: 'Aarav Kumar',
      class: '5th',
      section: 'A',
      rollNo: '15',
      parentId: '1',
      parentName: 'Rajesh Kumar',
      routeId: '1',
      routeName: 'Route A - North',
      pickupStopId: '1',
      pickupStopName: 'Sector 5 Gates',
      dropStopId: '2',
      dropStopName: 'Modern School Stop'
    }
  ],
  geofenceStateByStudentId: {
    // studentId: { lastDistanceKm: number|null, lastIn3Km: boolean, lastArrived: boolean }
  },
  parentAlertsByStudentId: {
    // studentId: [ { id, type, stop, time, distance } ]
  },
  activeTrips: [
    // Minimal mock trip state. Only trips with status === 'ACTIVE' are trackable.
    // Position is updated slightly on each getParentTracking call to simulate movement.
    {
      id: 'T1',
      routeId: '1',
      busRegNo: 'AS01 EA3426',
      driverName: 'Suresh Kumar',
      driverMobile: '+91 9876543210',
      status: 'ACTIVE',
      lat: 28.6400,
      lon: 77.2300
    }
  ],
  tripHistoryByStudentId: {
    '1': [
      { id: 1, date: '2025-01-26', trip: 'Morning Pickup', startTime: '07:30 AM', endTime: '08:15 AM', status: 'Completed' },
      { id: 2, date: '2025-01-26', trip: 'Evening Drop', startTime: '14:20 PM', endTime: '', status: 'In-Progress' }
    ]
  }
};

const mock = {
  async sendSchoolOnboardingOtp() {
    await mockDelay();
    return { data: { sent: true } };
  },
  async getSchoolApplications() {
    await mockDelay();
    return { data: [...mockDb.schoolApplications] };
  },
  async submitSchoolApplication() {
    await mockDelay();
    const id = String(Date.now());
    const app = {
      id,
      schoolName: 'New School',
      contactPerson: 'Contact',
      mobile: '0000000000',
      email: 'new@school.edu',
      address: 'N/A',
      latitude: '0',
      longitude: '0',
      status: 'Pending',
      remarks: ''
    };
    mockDb.schoolApplications = [app, ...mockDb.schoolApplications];
    return { data: app };
  },
  async reviewSchoolApplication(appId, payload) {
    await mockDelay();
    mockDb.schoolApplications = mockDb.schoolApplications.map((a) =>
      String(a.id) === String(appId)
        ? { ...a, status: payload?.status || a.status, remarks: payload?.remarks ?? a.remarks }
        : a
    );
    return { data: { updated: true } };
  },
  async issueCredentials(appId) {
    await mockDelay();
    mockDb.schoolApplications = mockDb.schoolApplications.map((a) =>
      String(a.id) === String(appId) ? { ...a, credentialLinkSent: true } : a
    );
    return { data: { sent: true } };
  },
  async getHolidays() {
    await mockDelay();
    return { data: [...mockDb.holidays] };
  },
  async createHoliday(payload) {
    await mockDelay();
    const holiday = { id: String(Date.now()), ...payload };
    mockDb.holidays = [holiday, ...mockDb.holidays];
    return { data: holiday };
  },
  async getUnplannedUsageReport() {
    await mockDelay();
    return { data: [...(mockDb.reports?.unplannedUsage || [])] };
  },
  async getAttendanceReport() {
    await mockDelay();
    return { data: [...(mockDb.reports?.attendance || [])] };
  },
  async getTripManagementReport() {
    await mockDelay();
    return { data: [...(mockDb.reports?.tripManagement || [])] };
  },
  async getTrafficReport() {
    await mockDelay();
    return { data: [...(mockDb.reports?.traffic || [])] };
  },
  async getAlertsFeed() {
    await mockDelay();
    return { data: [...mockDb.alertsFeed] };
  },
  async getTaggedVehicles() {
    await mockDelay();
    return { data: [...mockDb.taggedVehicles] };
  },
  async requestTagVehicle(payload) {
    await mockDelay();
    const regNo = normalizeRegNo(payload?.vehicleRegNo);
    const activated = Array.isArray(mockDb.buses)
      ? mockDb.buses.some((b) => normalizeRegNo(b?.regNo) === regNo)
      : false;

    if (!activated) {
      throw new Error(
        'Vehicle is not VLTD activated / uploaded in Skytron. Only pre-activated vehicle registration numbers can be tagged.'
      );
    }

    return { data: { requestId: String(Date.now()), vehicleRegNo: regNo } };
  },
  async validateTagOtp(payload) {
    await mockDelay();
    return { data: { valid: true, ...payload } };
  },
  async uploadTagDocuments() {
    await mockDelay();
    return { data: { uploaded: true } };
  },
  async getRoutes() {
    await mockDelay();
    return { data: [...mockDb.routes] };
  },
  async createRoute(payload) {
    await mockDelay();
    const id = String(Date.now());
    const route = { id, ...payload, stopsCount: 0 };
    mockDb.routes = [route, ...mockDb.routes];
    mockDb.stopsByRouteId[id] = [];
    return { data: route };
  },
  async updateRoute(id, payload) {
    await mockDelay();
    mockDb.routes = mockDb.routes.map((r) => (String(r.id) === String(id) ? { ...r, ...payload } : r));
    return { data: { updated: true } };
  },
  async deleteRoute(id) {
    await mockDelay();
    mockDb.routes = mockDb.routes.filter((r) => String(r.id) !== String(id));
    delete mockDb.stopsByRouteId[String(id)];
    return { data: { deleted: true } };
  },
  async getStops(routeId) {
    await mockDelay();
    return { data: [...(mockDb.stopsByRouteId[String(routeId)] || [])] };
  },
  async addStop(routeId, payload) {
    await mockDelay();
    const stopId = String(Date.now());
    const stop = { id: stopId, ...payload };
    const rid = String(routeId);
    mockDb.stopsByRouteId[rid] = [stop, ...(mockDb.stopsByRouteId[rid] || [])];
    mockDb.routes = mockDb.routes.map((r) => (String(r.id) === rid ? { ...r, stopsCount: (mockDb.stopsByRouteId[rid] || []).length } : r));
    return { data: stop };
  },
  async updateStop(stopId, payload) {
    await mockDelay();
    Object.keys(mockDb.stopsByRouteId).forEach((rid) => {
      mockDb.stopsByRouteId[rid] = (mockDb.stopsByRouteId[rid] || []).map((s) => (String(s.id) === String(stopId) ? { ...s, ...payload } : s));
    });
    return { data: { updated: true } };
  },
  async deleteStop(stopId) {
    await mockDelay();
    Object.keys(mockDb.stopsByRouteId).forEach((rid) => {
      mockDb.stopsByRouteId[rid] = (mockDb.stopsByRouteId[rid] || []).filter((s) => String(s.id) !== String(stopId));
      mockDb.routes = mockDb.routes.map((r) => (String(r.id) === rid ? { ...r, stopsCount: (mockDb.stopsByRouteId[rid] || []).length } : r));
    });
    return { data: { deleted: true } };
  },
  async getBuses() {
    await mockDelay();
    return { data: [...mockDb.buses] };
  },
  async getRouteOptions() {
    await mockDelay();
    return { data: [...mockDb.routeOptions] };
  },
  async getAssignments() {
    await mockDelay();
    return { data: [...mockDb.assignments] };
  },
  async assignBus(payload) {
    await mockDelay();
    const bus = (mockDb.buses || []).find((b) => String(b.id) === String(payload?.busId));
    const route = (mockDb.routeOptions || []).find((r) => String(r.id) === String(payload?.routeId));
    if (!bus) throw new Error('Bus not found');
    if (!route) throw new Error('Route not found');

    const next = {
      id: String(Date.now()),
      busRegNo: bus.regNo,
      driverName: bus.driverName || '',
      routeName: route.name,
      assignmentDate: new Date().toISOString().slice(0, 10),
      status: 'Active'
    };

    // replace existing assignment for same bus (tagging it to a new route)
    mockDb.assignments = [
      next,
      ...(mockDb.assignments || []).filter((a) => String(a.busRegNo) !== String(bus.regNo))
    ];
    return { data: next };
  },
  async reassignBus(busId, payload) {
    await mockDelay();
    const bus = (mockDb.buses || []).find((b) => String(b.id) === String(busId));
    const route = (mockDb.routeOptions || []).find((r) => String(r.id) === String(payload?.routeId));
    if (!bus) throw new Error('Bus not found');
    if (!route) throw new Error('Route not found');

    mockDb.assignments = (mockDb.assignments || []).map((a) =>
      String(a.busRegNo) === String(bus.regNo) ? { ...a, routeName: route.name, status: 'Active' } : a
    );
    return { data: { reassigned: true } };
  },
  async untagBus(busId) {
    await mockDelay();
    const bus = (mockDb.buses || []).find((b) => String(b.id) === String(busId));
    if (!bus) throw new Error('Bus not found');

    mockDb.assignments = (mockDb.assignments || []).filter((a) => String(a.busRegNo) !== String(bus.regNo));
    return { data: { untagged: true } };
  },
  async getParents() {
    await mockDelay();
    return { data: [...mockDb.parents] };
  },
  async createParent(payload) {
    await mockDelay();
    const parent = { id: String(Date.now()), ...payload };
    mockDb.parents = [parent, ...mockDb.parents];
    return { data: parent };
  },
  async updateParent(parentId, payload) {
    await mockDelay();
    mockDb.parents = mockDb.parents.map((p) => (String(p.id) === String(parentId) ? { ...p, ...payload } : p));
    return { data: { updated: true } };
  },
  async deleteParent(parentId) {
    await mockDelay();
    mockDb.parents = mockDb.parents.filter((p) => String(p.id) !== String(parentId));
    return { data: { deleted: true } };
  },
  async getStudents() {
    await mockDelay();
    return { data: [...mockDb.students] };
  },
  async createStudent(payload) {
    await mockDelay();
    const parent = (mockDb.parents || []).find((p) => String(p.id) === String(payload?.parentId));
    const route = (mockDb.routes || []).find((r) => String(r.id) === String(payload?.routeId));
    const routeStops = mockDb.stopsByRouteId?.[String(payload?.routeId)] || [];
    const pickupStop = routeStops.find((s) => String(s.id) === String(payload?.pickupStopId));
    const dropStop = routeStops.find((s) => String(s.id) === String(payload?.dropStopId));

    const student = {
      id: String(Date.now()),
      ...payload,
      parentName: parent?.name || '',
      routeName: route?.routeName || route?.name || '',
      pickupStopName: pickupStop?.stopName || '',
      dropStopName: dropStop?.stopName || ''
    };
    mockDb.students = [student, ...mockDb.students];
    return { data: student };
  },
  async updateStudent(studentId, payload) {
    await mockDelay();
    mockDb.students = mockDb.students.map((s) => (String(s.id) === String(studentId) ? { ...s, ...payload } : s));
    return { data: { updated: true } };
  },
  async deleteStudent(studentId) {
    await mockDelay();
    mockDb.students = mockDb.students.filter((s) => String(s.id) !== String(studentId));
    return { data: { deleted: true } };
  },
  async getParentTracking(studentId) {
    await mockDelay();

    const sid = String(studentId);
    const student = (mockDb.students || []).find((s) => String(s.id) === sid);
    if (!student) {
      return { data: { studentId, live: null, alerts: [], tripHistory: [] } };
    }

    const designatedStopId = student.pickupStopId || student.dropStopId;
    const routeStops = mockDb.stopsByRouteId?.[String(student.routeId)] || [];
    const designatedStop = routeStops.find((s) => String(s.id) === String(designatedStopId));

    const trip = (mockDb.activeTrips || []).find(
      (t) => String(t.routeId) === String(student.routeId) && String(t.status).toUpperCase() === 'ACTIVE'
    );

    const tripHistory = Array.isArray(mockDb.tripHistoryByStudentId?.[sid]) ? [...mockDb.tripHistoryByStudentId[sid]] : [];
    const hasActiveTrip = Boolean(trip);

    // Enforce system restriction: no live tracking when there is no active trip.
    if (!hasActiveTrip) {
      return {
        data: {
          studentId,
          live: null,
          alerts: Array.isArray(mockDb.parentAlertsByStudentId?.[sid]) ? [...mockDb.parentAlertsByStudentId[sid]] : [],
          tripHistory
        }
      };
    }

    // Simulate movement: nudge the vehicle slightly on each poll.
    trip.lat = (toNum(trip.lat) ?? 0) - 0.001;
    trip.lon = (toNum(trip.lon) ?? 0) - 0.001;

    const distanceKm = designatedStop ? haversineKm(trip.lat, trip.lon, designatedStop.latitude, designatedStop.longitude) : null;
    const etaMinutes = distanceKm === null ? null : Math.max(1, Math.round((distanceKm / 25) * 60));

    const prev = mockDb.geofenceStateByStudentId[sid] || { lastDistanceKm: null, lastIn3Km: false, lastArrived: false };
    const in3Km = distanceKm !== null ? distanceKm <= 3 : false;
    const arrived = distanceKm !== null ? distanceKm <= 0.1 : false;

    const alerts = Array.isArray(mockDb.parentAlertsByStudentId[sid]) ? [...mockDb.parentAlertsByStudentId[sid]] : [];
    const pushAlert = (type) => {
      const stopName = designatedStop?.stopName || student.pickupStopName || student.dropStopName || 'Designated Stop';
      const distLabel = distanceKm === null ? 'N/A' : `${distanceKm.toFixed(1)} KM`;
      alerts.unshift({
        id: Date.now(),
        type,
        stop: stopName,
        time: nowTimestamp(),
        distance: distLabel
      });
    };

    // Geofence Alerts (only for designated stop)
    if (!prev.lastIn3Km && in3Km) pushAlert('Within 3 KM');
    if (!prev.lastArrived && arrived) pushAlert('Arrival');
    if (prev.lastArrived && !arrived) pushAlert('Departure');

    mockDb.geofenceStateByStudentId[sid] = { lastDistanceKm: distanceKm, lastIn3Km: in3Km, lastArrived: arrived };
    mockDb.parentAlertsByStudentId[sid] = alerts;

    return {
      data: {
        studentId,
        live: {
          vehicleRegNo: trip.busRegNo,
          driverName: trip.driverName || '',
          driverMobile: trip.driverMobile || '',
          studentName: student.name || '',
          studentClass: student.class || '',
          studentSection: student.section || '',
          stopName: designatedStop?.stopName || student.pickupStopName || student.dropStopName || '',
          distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
          etaMinutes,
          lat: trip.lat,
          lon: trip.lon
        },
        alerts,
        tripHistory
      }
    };
  }
};

const api = {
  sendSchoolOnboardingOtp(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/schools/applications/send-otp', data);
  },
  getSchoolApplications() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/schools/applications');
  },
  submitSchoolApplication(formData) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/schools/applications', formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    });
  },
  reviewSchoolApplication(appId, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/schools/applications/${appId}/review`, data);
  },
  issueCredentials(appId) {
    const http = getAxiosInstance();
    return http.post(`/api/schoolbus/schools/applications/${appId}/issue-credentials`);
  },
  getHolidays() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/holidays');
  },
  createHoliday(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/holidays', data);
  },
  getUnplannedUsageReport() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/reports/unplanned-usage');
  },
  getAttendanceReport() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/reports/attendance');
  },
  getTripManagementReport() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/reports/trips');
  },
  getTrafficReport() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/reports/traffic');
  },
  getAlertsFeed() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/alerts/feed');
  },
  getTaggedVehicles() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/tagged-vehicles');
  },
  requestTagVehicle(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/tag/request', data);
  },
  validateTagOtp(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/tag/validate-otp', data);
  },
  uploadTagDocuments(formData) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/tag/upload-documents', formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    });
  },
  getRoutes() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/routes');
  },
  createRoute(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/routes', data);
  },
  updateRoute(id, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/routes/${id}`, data);
  },
  deleteRoute(id) {
    const http = getAxiosInstance();
    return http.delete(`/api/schoolbus/routes/${id}`);
  },
  getStops(routeId) {
    const http = getAxiosInstance();
    return http.get(`/api/schoolbus/routes/${routeId}/stops`);
  },
  addStop(routeId, data) {
    const http = getAxiosInstance();
    return http.post(`/api/schoolbus/routes/${routeId}/stops`, data);
  },
  updateStop(stopId, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/stops/${stopId}`, data);
  },
  deleteStop(stopId) {
    const http = getAxiosInstance();
    return http.delete(`/api/schoolbus/stops/${stopId}`);
  },
  getBuses() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/buses');
  },
  getRouteOptions() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/routes/options');
  },
  getAssignments() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/assignments');
  },
  assignBus(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/assign', data);
  },
  reassignBus(busId, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/reassign/${busId}`, data);
  },
  untagBus(busId) {
    const http = getAxiosInstance();
    return http.delete(`/api/schoolbus/untag/${busId}`);
  },
  getParents() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/parents');
  },
  createParent(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/parents', data);
  },
  updateParent(parentId, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/parents/${parentId}`, data);
  },
  deleteParent(parentId) {
    const http = getAxiosInstance();
    return http.delete(`/api/schoolbus/parents/${parentId}`);
  },
  getStudents() {
    const http = getAxiosInstance();
    return http.get('/api/schoolbus/students');
  },
  createStudent(data) {
    const http = getAxiosInstance();
    return http.post('/api/schoolbus/students', data);
  },
  updateStudent(studentId, data) {
    const http = getAxiosInstance();
    return http.put(`/api/schoolbus/students/${studentId}`, data);
  },
  deleteStudent(studentId) {
    const http = getAxiosInstance();
    return http.delete(`/api/schoolbus/students/${studentId}`);
  },
  getParentTracking(studentId) {
    const http = getAxiosInstance();
    return http.get(`/api/schoolbus/tracking/${studentId}`);
  },
  getParentAlerts(parentId) {
    const http = getAxiosInstance();
    return http.get(`/api/schoolbus/alerts/${parentId}`);
  }
};

const SchoolBusService = {
  sendSchoolOnboardingOtp: (...args) => (shouldUseMock() ? mock.sendSchoolOnboardingOtp(...args) : api.sendSchoolOnboardingOtp(...args)),
  getSchoolApplications: (...args) => (shouldUseMock() ? mock.getSchoolApplications(...args) : api.getSchoolApplications(...args)),
  submitSchoolApplication: (...args) => (shouldUseMock() ? mock.submitSchoolApplication(...args) : api.submitSchoolApplication(...args)),
  reviewSchoolApplication: (...args) => (shouldUseMock() ? mock.reviewSchoolApplication(...args) : api.reviewSchoolApplication(...args)),
  issueCredentials: (...args) => (shouldUseMock() ? mock.issueCredentials(...args) : api.issueCredentials(...args)),

  getHolidays: (...args) => (shouldUseMock() ? mock.getHolidays(...args) : api.getHolidays(...args)),
  createHoliday: (...args) => (shouldUseMock() ? mock.createHoliday(...args) : api.createHoliday(...args)),

  getUnplannedUsageReport: (...args) => (shouldUseMock() ? mock.getUnplannedUsageReport(...args) : api.getUnplannedUsageReport(...args)),
  getAttendanceReport: (...args) => (shouldUseMock() ? mock.getAttendanceReport(...args) : api.getAttendanceReport(...args)),
  getTripManagementReport: (...args) => (shouldUseMock() ? mock.getTripManagementReport(...args) : api.getTripManagementReport(...args)),
  getTrafficReport: (...args) => (shouldUseMock() ? mock.getTrafficReport(...args) : api.getTrafficReport(...args)),
  getAlertsFeed: (...args) => (shouldUseMock() ? mock.getAlertsFeed(...args) : api.getAlertsFeed(...args)),

  getTaggedVehicles: (...args) => (shouldUseMock() ? mock.getTaggedVehicles(...args) : api.getTaggedVehicles(...args)),
  requestTagVehicle: (...args) => (shouldUseMock() ? mock.requestTagVehicle(...args) : api.requestTagVehicle(...args)),
  validateTagOtp: (...args) => (shouldUseMock() ? mock.validateTagOtp(...args) : api.validateTagOtp(...args)),
  uploadTagDocuments: (...args) => (shouldUseMock() ? mock.uploadTagDocuments(...args) : api.uploadTagDocuments(...args)),

  getRoutes: (...args) => (shouldUseMock() ? mock.getRoutes(...args) : api.getRoutes(...args)),
  createRoute: (...args) => (shouldUseMock() ? mock.createRoute(...args) : api.createRoute(...args)),
  updateRoute: (...args) => (shouldUseMock() ? mock.updateRoute(...args) : api.updateRoute(...args)),
  deleteRoute: (...args) => (shouldUseMock() ? mock.deleteRoute(...args) : api.deleteRoute(...args)),

  getStops: (...args) => (shouldUseMock() ? mock.getStops(...args) : api.getStops(...args)),
  addStop: (...args) => (shouldUseMock() ? mock.addStop(...args) : api.addStop(...args)),
  updateStop: (...args) => (shouldUseMock() ? mock.updateStop(...args) : api.updateStop(...args)),
  deleteStop: (...args) => (shouldUseMock() ? mock.deleteStop(...args) : api.deleteStop(...args)),

  getBuses: (...args) => (shouldUseMock() ? mock.getBuses(...args) : api.getBuses(...args)),
  getRouteOptions: (...args) => (shouldUseMock() ? mock.getRouteOptions(...args) : api.getRouteOptions(...args)),
  getAssignments: (...args) => (shouldUseMock() ? mock.getAssignments(...args) : api.getAssignments(...args)),
  assignBus: (...args) => (shouldUseMock() ? mock.assignBus(...args) : api.assignBus(...args)),
  reassignBus: (...args) => (shouldUseMock() ? mock.reassignBus(...args) : api.reassignBus(...args)),
  untagBus: (...args) => (shouldUseMock() ? mock.untagBus(...args) : api.untagBus(...args)),

  getParents: (...args) => (shouldUseMock() ? mock.getParents(...args) : api.getParents(...args)),
  createParent: (...args) => (shouldUseMock() ? mock.createParent(...args) : api.createParent(...args)),
  updateParent: (...args) => (shouldUseMock() ? mock.updateParent(...args) : api.updateParent(...args)),
  deleteParent: (...args) => (shouldUseMock() ? mock.deleteParent(...args) : api.deleteParent(...args)),

  getStudents: (...args) => (shouldUseMock() ? mock.getStudents(...args) : api.getStudents(...args)),
  createStudent: (...args) => (shouldUseMock() ? mock.createStudent(...args) : api.createStudent(...args)),
  updateStudent: (...args) => (shouldUseMock() ? mock.updateStudent(...args) : api.updateStudent(...args)),
  deleteStudent: (...args) => (shouldUseMock() ? mock.deleteStudent(...args) : api.deleteStudent(...args)),

  getParentTracking: (...args) => (shouldUseMock() ? mock.getParentTracking(...args) : api.getParentTracking(...args)),
  getParentAlerts: (...args) => (shouldUseMock() ? Promise.resolve({ data: [] }) : api.getParentAlerts(...args))
};

export default SchoolBusService;
