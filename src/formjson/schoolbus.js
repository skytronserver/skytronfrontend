import * as Yup from "yup";

export const busTaggingFields = (t) => ({
    vehicleRegNo: {
        name: "vehicleRegNo",
        type: "text",
        label: "Vehicle Registration Number",
        placeholder: "Enter vehicle registration number",
        validation: Yup.string().required("Vehicle registration number is required"),
    },
    otp: {
        name: "otp",
        type: "tel",
        label: "OTP",
        placeholder: "Enter 6-digit OTP",
        validation: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
    },
    schoolBusPermit: {
        name: "schoolBusPermit",
        type: "file",
        label: "School Bus Permit",
        validation: Yup.mixed().required("School Bus Permit is required"),
    },
    requestLetter: {
        name: "requestLetter",
        type: "file",
        label: "Request letter from the School Principal",
        validation: Yup.mixed().required("Request letter is required"),
    },
    rcCertificate: {
        name: "rcCertificate",
        type: "file",
        label: "Vehicle Registration Certificates (RCs)",
        validation: Yup.mixed().required("RC Certificate is required"),
    },
    authLetter: {
        name: "authLetter",
        type: "file",
        label: "Authorisation letter from vehicle owner",
        validation: Yup.mixed().required("Authorisation letter is required"),
    },
    fitmentReceipt: {
        name: "fitmentReceipt",
        type: "file",
        label: "Skytron VLTD fitment receipt",
        validation: Yup.mixed().required("Fitment receipt is required"),
    },
});

export const routeFields = (t) => ({
    name: {
        name: "name",
        type: "text",
        label: "Route Name",
        placeholder: "e.g., Route A - North Zone",
        validation: Yup.string().required("Route name is required"),
    },
    description: {
        name: "description",
        type: "text",
        label: "Description",
        placeholder: "Brief description of the route",
        validation: Yup.string().required("Description is required"),
    },
    status: {
        name: "status",
        type: "select",
        label: "Status",
        options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
        ],
        validation: Yup.string().required("Status is required"),
    },
        // ✅ ADD THIS
    route_points: {
        name: "route_points",
        type: "map",
        label: "Route Coordinates",
        validation: Yup.array()
            .of(
                Yup.object().shape({
                    lat: Yup.number().required(),
                    lng: Yup.number().required(),
                })
            )
            .min(1, "Select at least 1 points for the route")
            .required("Route path is required"),
    },
});

export const busStopFields = (t) => ({
    name: {
        name: "name",
        type: "text",
        label: "Stop Name",
        placeholder: "e.g., Main Street Stop",
        validation: Yup.string().required("Stop name is required"),
    },
    latitude: {
        name: "latitude",
        type: "number",
        label: "Latitude",
        placeholder: "28.6139",
        validation: Yup.number().required("Latitude is required"),
    },
    longitude: {
        name: "longitude",
        type: "number",
        label: "Longitude",
        placeholder: "77.2090",
        validation: Yup.number().required("Longitude is required"),
    },
    timing: {
        name: "timing",
        type: "time",
        label: "Timing",
        validation: Yup.string().required("Timing is required"),
    },
     order: {
        name: "order",
        type: "number",
        label: "Order",
        placeholder: "1",
        validation: Yup.number().required("Order is required"),
    },
});

export const busAssignmentFields = (t, buses = [], routes = []) => ({
    busId: {
        name: "busId",
        type: "select",
        label: "Select Bus",
        options: buses.map(bus => ({ label: `${bus.regNo} - ${bus.driverName}`, value: bus.id })),
        validation: Yup.string().required("Bus selection is required"),
    },
    routeId: {
        name: "routeId",
        type: "select",
        label: "Select Route",
        options: routes.map(route => ({ label: route.name, value: route.id })),
        validation: Yup.string().required("Route selection is required"),
    },
});
