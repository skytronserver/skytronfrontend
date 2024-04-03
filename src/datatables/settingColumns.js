export const stateColumns=[
    {
        name: "id",
        label: "ID",
        options: {
          filter: false,
          sort: false,
          display: false,
        },
      },
      {
        name: "state",
        label: "Name",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "status",
        label: "Status",
        options: {
          filter: true,
          sort: false,
        },
      }, 
];
export const vehicleColumns = [
    {
      name: "id",
      label: "ID",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: "category",
      label: "Category",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "maxSpeed",
      label: "Maximum Speed",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "warnSpeed",
      label: "Speed Warning",
      options: {
        filter: true,
        sort: false,
      },
    }
  ];
  