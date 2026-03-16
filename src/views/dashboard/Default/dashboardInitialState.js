export const dashboardInitialState = {
  userInfo: {
    dealer: 0,
    manufacturer: 0,
    dto: 0,
    owner: 0,
  },
  fitmentInfo: {
    fitted: 0,
    taggedDevice: 0,
    onlineDevice: 0,
    offlineDevice: 0,
    totalOnlineDevice: 0,
    totalOfflineDevice: 0,
    untaggedDevice: 0,
    totalFitments: 0,
  },
  dealerFitmentInfo: {
    total: 0,
    taggedDevice: 0,
    onlineDevice: 0,
    offlineDevice: 0,
    monthly: 0,
    daily: 0,
  },
  dealerDeviceInfo: {
    assigned: 0,
    returned: 0,
    stocked: 0,
    faulty: 0,
    freeDevice: 0,
  },
  dealerESIMInfo: {
    totalActivation: 0,
    oneYearRenewal: 0,
    twoYearRenewal: 0,
  },
  eSIMInfo: {
    totalDevicesWithESim: 0,
    validated: 0,
    expired: 0,
    active: 0,
    // pending: 0,
    // invalid: 0,
  },
  eSIMActivationInfo: {
    activationRequestSent: 0,
    activationConfirmed: 0,
    activationRejected: 0,
    expiringSoon: 0,
    // todayRequests: 0,
    // weeklyRequests: 0,
    // monthlyRequests: 0,
  },
  deviceStatusInfo: {
    onlineNow: 0,
    onlineToday: 0,
    sevenDaysOffline: 0,
    thirtyDaysOffline: 0,
  },
  deviceHealthInfo: {
    totalActivatedDevice: 0,
    todayActive: 0,
    inActiveFor7Days: 0,
    inActiveFor30Days: 0,
  },
  alertInfo: {
    totalAlert: 0,
    thisMonthAlert: 0,
    todayAlert: 0,
  },
  miscInfo: {
    dealer: 0,
    activation: 0,
    expired: 0,
  },
  manufacturerStockInfo: {
    stockCreated: 0,
    stockAllocated: 0,
    returned: 0,
    faulty: 0,
  },
  modelInfo: {
    model: 0,
    m2mLinked: 0,
  },
  userDashboardInfo: {
    deviceActivated: 0,
    vehicles: 0,
    onlineDevice: 0,
    offlineDevice: 0,
    movingVehicles: 0,
    stoppedVehicles: 0,
    idleVehicles: 0,
    travelDistanceKm: 0,
    sevenDaysOffline: 0,
    thirtyDaysOffline: 0,
    alert: 0,
    monthlyAlert: 0,
    dailyAlert: 0,
    harshBreaking: 0,
    suddenTurn: 0,
    overSpeeding: 0,
    sosCalls: 0,
    genuineCalls: 0,
    fakeCalls: 0,
  },
  dtoDashboardInfo: {
    activated: 0,
    vehicles: 0,
    onlineDevice: 0,
    offlineDevice: 0,
    sevenDaysOffline: 0,
    thirtyDaysOffline: 0,
    alert: 0,
    monthlyAlert: 0,
    dailyAlert: 0,
    activations: 0,
    monthlyActivations: 0,
    dailyActivations: 0,
    sosCalls: 0,
    genuineCalls: 0,
    fakeCalls: 0
  },
  userInfoForAdmin: {
    stateUser: 0,
    eSimUser: 0,
    manufacturer: 0,
    sosAdmin: 0,
  },
  stateInfo: {
    total: 0,
    active: 0,
    inactive: 0,
  },
  districtInfo: {
    total: 0,
    active: 0,
    inactive: 0,
  },
  stockInfo: {
    total: 0,
    unassigned: 0,
    waiting: 0,
  },
  adminFitmentInfo: {
    fitted: 0,
    toggedDevice: 0,
    onlineDevice: 0,
    offlineDevice: 0,
  },
  team: {
    Total_Teams: 0,
    Total_DeskExecutives: 0,
    Live_Teams: 0,
    Live_DeskExecutives: 0
  },
  teamForLead: {
    Total_DeskExecutives: 0,
    Live_DeskExecutives: 0
  },
  incomingCall: {
    Total_Incoming_Calls: 0,
    Total_Incoming_Calls_thismonth: 0,
    Total_Incoming_Calls_thisweek: 0,
    Total_Incoming_Calls_today: 0,
  },
  fakeCall: {
    Total_Fake_Calls: 0,
    Total_Fake_Calls_thismonth: 0,
    Total_Fake_Calls_thisweek: 0,
    Total_Fake_Calls_today: 0,
  },
  callRejection: {
    Total_Rejected_Assignemnt: 0,
    Total_Rejected_Assignemnt_thismonth: 0,
    Total_Rejected_Assignemnt_thisweek: 0,
    Total_Rejected_Assignemnt_today: 0,
  },
  calls: {
    Total_Active_Calls: 0,
    Total_Closed_Calls: 0,
    Total_Pending_Calls: 0,
    Average_time_to_Accept: 0
  },
  assignment: {
    Total_Assignemnt_thistmonth: 0,
    Total_Assignemnt_thisweek: 0,
    Total_Assignemnt_today: 0,
    Total_Assignemnt: 0,
  },
  closedAssignment: {
    Total_Closed_Assignemnt_thistmonth: 0,
    Total_Closed_Assignemnt_thisweek: 0,
    Total_Closed_Assignemnt_today: 0,
    Total_Closed_Assignemnt: 0,
  },
  falseAssignment: {
    Total_False_Assignemnt_thistmonth: 0,
    Total_False_Assignemnt_thisweek: 0,
    Total_False_Assignemnt_today: 0,
    Total_False_Assignemnt: 0,
  },
  rejectedAssignment: {
    Total_Rejected_Assignemnt_thistmonth: 0,
    Total_Rejected_Assignemnt_thisweek: 0,
    Total_Rejected_Assignemnt_today: 0,
    Total_Rejected_Assignemnt: 0,
  },
  vehicleAlertStatistics: {
    vehicles: {
      total_tagged_vehicles: 0,
      online_vehicles: 0,
      offline_vehicles: 0
    },
    sos_calls: {
      total: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      by_status: {
        closed: 0,
        pending: 0
      }
    },
    broadcasts: {
      total: 0,
      total_closed: 0,
      closed_daily: 0,
      closed_weekly: 0,
      closed_monthly: 0,
      closed_yearly: 0,
      pending: 0
    },
    alerts: {
      total: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      by_type: {
        BoxTemp: 0,
        Em: 0,
        Route: 0,
        LowIntBat: 0,
        OverSpeed: 0,
        LowExtBat: 0,
        Eng: 0,
        ExtBatDiscnt: 0
      }
    }
  },
  reportBuilder: {
    reportTitle: "Custom Report",
    canvasItems: [],
    selectedItemId: null,
    previewMode: false,
    lastUpdated: null
  },
  activeUsersInfo: {
    stateAdmin: 0,
    esimProvider: 0,
    manufacturer: 0,
    sosAdmin: 0,
    sosExecutive: 0,
    sosTeamLead: 0,
    sosDeskExecutive: 0,
  }
};