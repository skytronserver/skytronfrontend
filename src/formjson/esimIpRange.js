import * as Yup from "yup";

const FILE_SIZE = 1024 * 1024; // 1 MB
const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export const esimIpRangeInitials = {
  ip_range: "",
  certificate_file: null,
  isp_name: "",
  remarks: "",
};

export const esimIpRangeField = {
  ip_range: {
    name: "ip_range",
    type: "text",
    label: "IP Range",
    placeholder: "e.g., 103.21.58.0/24 or 103.21.58.1-103.21.58.50",
    validation: Yup.string()
      .required("IP Range is required")
      .test(
        "is-valid-ip-range",
        "Must be a valid CIDR or start-end range",
        (value) => {
          if (!value) return true;
          const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;
          const startEndRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}-([0-9]{1,3}\.){3}[0-9]{1,3}$/;
          return cidrRegex.test(value) || startEndRegex.test(value);
        }
      ),
  },
  certificate_file: {
    name: "certificate_file",
    type: "file",
    label: "ISP Certificate (Max 1MB, PDF/Image)",
    validation: Yup.mixed()
      .required("Certificate file is required for new entries")
      .test("fileSize", "File size is too large (max 1MB)", (value) => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "Unsupported format (must be PDF, JPG, PNG)", (value) => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  isp_name: {
    name: "isp_name",
    type: "text",
    label: "ISP Name",
    placeholder: "e.g., Airtel, Jio",
    validation: Yup.string().nullable(),
  },
  remarks: {
    name: "remarks",
    type: "text",
    label: "Remarks",
    multiline: true,
    rows: 2,
    validation: Yup.string().nullable(),
  },
};
