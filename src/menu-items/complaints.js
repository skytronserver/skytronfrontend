import { IconUrgent } from "@tabler/icons";

const icons = { IconUrgent };

const complaints = {
  id: "complaint-management",
  type: "group",
  roles: ["helpdesk", "teamlead", "sosexecutive", "sosadmin", "stateadmin", "superadmin", "devicemanufacture"],
  children: [
    {
      id: "complaints-group",
      title: "Complaint Tickets",
      type: "collapse",
      icon: icons.IconUrgent,
      roles: ["helpdesk", "teamlead", "sosexecutive", "sosadmin", "stateadmin", "superadmin", "devicemanufacture"],
      children: [
        {
          id: "helpdesk-tickets",
          title: "My Ticket Dashboard",
          type: "item",
          url: "/helpdesk/tickets",
          breadcrumbs: false,
          roles: ["helpdesk"],
        },
        {
          id: "helpdesk-new-ticket",
          title: "Create Ticket",
          type: "item",
          url: "/helpdesk/tickets/new",
          breadcrumbs: false,
          roles: ["helpdesk"],
        },
        {
          id: "staff-tickets",
          title: "All Tickets",
          type: "item",
          url: "/staff/tickets",
          breadcrumbs: false,
          roles: ["teamlead", "sosexecutive", "sosadmin", "stateadmin", "superadmin"],
        },
        {
          id: "manufacturer-tickets",
          title: "Escalated Tickets",
          type: "item",
          url: "/manufacturer/tickets",
          breadcrumbs: false,
          roles: ["devicemanufacture"],
        },
      ],
    },
  ],
};

export default complaints;
