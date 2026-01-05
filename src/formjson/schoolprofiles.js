import * as Yup from "yup";

export const parentProfileFields = (t) => ({
    name: {
        name: "name",
        type: "text",
        label: "Parent Name",
        placeholder: "Enter parent's full name",
        validation: Yup.string().required("Parent name is required"),
    },
    email: {
        name: "email",
        type: "text",
        label: "Email Address",
        placeholder: "parent@email.com",
        validation: Yup.string().email("Invalid email").required("Email is required"),
    },
    mobile: {
        name: "mobile",
        type: "tel",
        label: "Mobile Number",
        placeholder: "9876543210",
        validation: Yup.string().length(10, "Mobile must be 10 digits").required("Mobile is required"),
    },
    address: {
        name: "address",
        type: "text",
        label: "Address",
        placeholder: "Enter complete address",
        validation: Yup.string().required("Address is required"),
    },
    lat: {
        name: "lat",
        type: "number",
        label: "Latitude",
        placeholder: "28.6139",
        validation: Yup.number().required("Latitude is required"),
    },
    lon: {
        name: "lon",
        type: "number",
        label: "Longitude",
        placeholder: "77.2090",
        validation: Yup.number().required("Longitude is required"),
    },
});

export const studentProfileFields = (t, parents = [], routes = [], stops = []) => ({
    name: {
        name: "name",
        type: "text",
        label: "Student Name",
        placeholder: "Enter student's full name",
        validation: Yup.string().required("Student name is required"),
    },
    class: {
        name: "class",
        type: "text",
        label: "Class",
        placeholder: "e.g., 5th",
        validation: Yup.string().required("Class is required"),
    },
    section: {
        name: "section",
        type: "text",
        label: "Section",
        placeholder: "e.g., A",
        validation: Yup.string().required("Section is required"),
    },
    rollNo: {
        name: "rollNo",
        type: "text",
        label: "Roll No",
        placeholder: "e.g., 15",
        validation: Yup.string().required("Roll number is required"),
    },
    parentId: {
        name: "parentId",
        type: "select",
        label: "Link to Parent",
        options: parents.map(p => ({ label: `${p.name} - ${p.mobile}`, value: p.id })),
        validation: Yup.string().required("Parent linking is required"),
    },
    routeId: {
        name: "routeId",
        type: "select",
        label: "Assign Route",
        options: routes.map(r => ({ label: r.routeName || r.name, value: r.id })),
        validation: Yup.string().required("Route allocation is required"),
    },
    pickupStopId: {
        name: "pickupStopId",
        type: "select",
        label: "Pickup Stop",
        options: stops.map(s => ({ label: `${s.stopName} (${s.timing || ''})`, value: s.id })),
        validation: Yup.string().required("Pickup stop is required"),
    },
    dropStopId: {
        name: "dropStopId",
        type: "select",
        label: "Drop Stop",
        options: stops.map(s => ({ label: `${s.stopName} (${s.timing || ''})`, value: s.id })),
        validation: Yup.string().required("Drop stop is required"),
    },
});
