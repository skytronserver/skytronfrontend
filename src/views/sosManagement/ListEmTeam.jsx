import React from "react";
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import SOSManagement from "../../services/SOSManagement";
import { useEffect, useState } from "react";
//Datatables
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { emTeamColumns } from "../../datatables/rowsColumn";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
const ListEmTeam = () => {
  const [load, setLoad] = useState(false);
  const [del, setDel] = useState(false);
  const [emTeamList, setEmTeamList] = useState([]);
  useEffect(() => {
    const fetchEmTeams = async () => {
      try {
        const response = await SOSManagement.listEmTeam();
        setEmTeamList(response.data.teams);
        setLoad(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No Data Found");
        } else {
          console.log("No Data Found");
        }
      }
    };
    fetchEmTeams();
  }, [del]);
  const handleDelete = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to delete this team?"
    );
    if (confirmed) {
      try {
        await SOSManagement.removeEmTeam({ team_id: id });
        alert("Team deleted successfully!");
        setDel((prev) => !prev);
      } catch (error) {
        alert("Error deleting Team!");
      }
    } else {
      alert("Team deletion canceled.");
    }
  };
  const handleActivate = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to activate this team?"
    );
    if (confirmed) {
      try {
        await SOSManagement.activateEmTeam({ team_id: id });
        alert("Team activate successfully!");
        setDel((prev) => !prev);
      } catch (error) {
        alert("Error activating team!");
      }
    } else {
      alert("Team activation canceled.");
    }
  };
  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              {tableMeta.rowData[1]!=='Active' && tableMeta.rowData[1]!=='Removed' && <Button
                color="primary"
                onClick={(e) => handleActivate(e, tableMeta.rowData[0])}
              >
                <CheckIcon />
              </Button>
              }
              {tableMeta.rowData[1]!=='Removed' &&
              <Button
                color="primary"
                onClick={(e) => handleDelete(e, tableMeta.rowData[0])}
              >
                <DeleteIcon />
              </Button>
            }
            </div>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <DynamicDatatables
            tableTitle="EM Teams"
            rows={emTeamList}
            columns={emTeamColumns.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default ListEmTeam;
