// Mock data store using sessionStorage
const mockDataStore = {
  get: (key) => JSON.parse(sessionStorage.getItem(key) || '[]'),
  set: (key, data) => sessionStorage.setItem(key, JSON.stringify(data)),
};

// Initialize some mock data if empty
if (!sessionStorage.getItem('mockBusStops')) {
  mockDataStore.set('mockBusStops', []);
}
if (!sessionStorage.getItem('mockBusRoutes')) {
  mockDataStore.set('mockBusRoutes', []);
}
if (!sessionStorage.getItem('mockBusSchedules')) {
  mockDataStore.set('mockBusSchedules', []);
}

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const PISService = {
  // ================= BUS STOPS =================
  createBusStop: async (stopData) => {
    await simulateDelay();
    const stops = mockDataStore.get('mockBusStops');
    const newStop = {
      ...stopData,
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
      status: stopData.status || 'active',
      activationDate: stopData.status === 'active' ? new Date().toISOString() : null,
      deactivationDate: stopData.status === 'deactivated' ? new Date().toISOString() : null,
    };
    mockDataStore.set('mockBusStops', [...stops, newStop]);
    return { success: true, data: newStop, message: "Bus stop created successfully" };
  },

  updateBusStop: async (id, stopData) => {
    await simulateDelay();
    let stops = mockDataStore.get('mockBusStops');
    const index = stops.findIndex(s => s.id === id);
    if (index === -1) return { success: false, message: "Bus stop not found" };

    const oldStatus = stops[index].status;
    const newStatus = stopData.status;

    stops[index] = {
      ...stops[index],
      ...stopData,
      lastUpdateDate: new Date().toISOString(),
    };

    if (oldStatus !== 'active' && newStatus === 'active') {
      stops[index].activationDate = new Date().toISOString();
    } else if (oldStatus !== 'deactivated' && newStatus === 'deactivated') {
      stops[index].deactivationDate = new Date().toISOString();
    }

    mockDataStore.set('mockBusStops', stops);
    return { success: true, data: stops[index], message: "Bus stop updated successfully" };
  },

  getBusStops: async (filters = {}) => {
    await simulateDelay();
    let stops = mockDataStore.get('mockBusStops');
    // Apply filters if needed (mock filtering)
    if (filters.status) {
      stops = stops.filter(s => s.status === filters.status);
    }
    return { success: true, data: stops };
  },

  getActiveBusStops: async () => {
    await simulateDelay();
    const stops = mockDataStore.get('mockBusStops').filter(s => s.status === 'active');
    return { success: true, data: stops };
  },

  // ================= BUS ROUTES =================
  createBusRoute: async (routeData) => {
    await simulateDelay();
    const routes = mockDataStore.get('mockBusRoutes');
    const newRoute = {
      ...routeData,
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
      status: routeData.status || 'active',
      activationDate: routeData.status === 'active' ? new Date().toISOString() : null,
      deactivationDate: routeData.status === 'deactivated' ? new Date().toISOString() : null,
    };
    mockDataStore.set('mockBusRoutes', [...routes, newRoute]);
    return { success: true, data: newRoute, message: "Bus route created successfully" };
  },

  updateBusRoute: async (id, routeData) => {
    await simulateDelay();
    let routes = mockDataStore.get('mockBusRoutes');
    const index = routes.findIndex(r => r.id === id);
    if (index === -1) return { success: false, message: "Bus route not found" };

    const oldStatus = routes[index].status;
    const newStatus = routeData.status;

    routes[index] = {
      ...routes[index],
      ...routeData,
      lastUpdateDate: new Date().toISOString(),
    };

    if (oldStatus !== 'active' && newStatus === 'active') {
      routes[index].activationDate = new Date().toISOString();
    } else if (oldStatus !== 'deactivated' && newStatus === 'deactivated') {
      routes[index].deactivationDate = new Date().toISOString();
    }

    mockDataStore.set('mockBusRoutes', routes);
    return { success: true, data: routes[index], message: "Bus route updated successfully" };
  },

  getBusRoutes: async (filters = {}) => {
    await simulateDelay();
    let routes = mockDataStore.get('mockBusRoutes');
    if (filters.status) {
      routes = routes.filter(r => r.status === filters.status);
    }
    return { success: true, data: routes };
  },

  getActiveBusRoutes: async () => {
    await simulateDelay();
    const routes = mockDataStore.get('mockBusRoutes').filter(r => r.status === 'active');
    return { success: true, data: routes };
  },

  // ================= BUS SCHEDULES =================
  createBusSchedule: async (scheduleData) => {
    await simulateDelay();
    const schedules = mockDataStore.get('mockBusSchedules');
    const newSchedule = {
      ...scheduleData,
      id: Date.now().toString(),
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      status: 'created', // created, canceled, started, completed
      actualStartTime: null,
      actualEndTime: null,
    };
    mockDataStore.set('mockBusSchedules', [...schedules, newSchedule]);
    return { success: true, data: newSchedule, message: "Bus schedule created successfully" };
  },

  updateBusSchedule: async (id, scheduleData) => {
    await simulateDelay();
    let schedules = mockDataStore.get('mockBusSchedules');
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) return { success: false, message: "Bus schedule not found" };

    schedules[index] = {
      ...schedules[index],
      ...scheduleData,
      updatedTime: new Date().toISOString(),
    };

    mockDataStore.set('mockBusSchedules', schedules);
    return { success: true, data: schedules[index], message: "Bus schedule updated successfully" };
  },

  getBusSchedules: async (filters = {}) => {
    await simulateDelay();
    let schedules = mockDataStore.get('mockBusSchedules');
    return { success: true, data: schedules };
  },

  // ================= OTHER / UTILITIES =================
  getAvailableBuses: async () => {
    await simulateDelay();
    // Mock available devices
    return {
      success: true,
      data: [
        { id: 'BUS001', name: 'MH12 AB 1234' },
        { id: 'BUS002', name: 'MH14 CD 5678' },
        { id: 'BUS003', name: 'MH01 XX 9999' },
      ]
    };
  },

  updateTripStatus: async (scheduleId, status, locationData) => {
    await simulateDelay();
    let schedules = mockDataStore.get('mockBusSchedules');
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return { success: false, message: "Schedule not found" };

    schedules[index].status = status;
    schedules[index].updatedTime = new Date().toISOString();

    if (status === 'started' && !schedules[index].actualStartTime) {
      schedules[index].actualStartTime = new Date().toISOString();
    } else if (status === 'completed' && !schedules[index].actualEndTime) {
      schedules[index].actualEndTime = new Date().toISOString();
    }

    mockDataStore.set('mockBusSchedules', schedules);
    return { success: true, data: schedules[index], message: `Trip status updated to ${status}` };
  },

  getLiveTripStatus: async (scheduleId) => {
    await simulateDelay();
    const schedules = mockDataStore.get('mockBusSchedules');
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return { success: false, message: "Schedule not found" };

    // Mock live data
    return {
      success: true,
      data: {
        schedule,
        liveLocation: { lat: 18.5204, lon: 73.8567 }, // Mock coordinates
        timeToNextStop: 15, // mins
        etaDestination: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hr from now
      }
    };
  }
};

export default PISService;
