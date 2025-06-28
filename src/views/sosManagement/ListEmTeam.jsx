import React from "react";
// project imports
import { Grid, Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import SOSManagement from "../../services/SOSManagement";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
//Datatables
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { emTeamColumns } from "../../datatables/rowsColumn";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ListEmTeam = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          console.log(t('emTeam.noDataFound'));
        } else {
          console.log(t('emTeam.noDataFound'));
        }
      }
    };
    fetchEmTeams();
  }, [del, t]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(
      t('emTeam.confirmDeleteTeam')
    );
    if (confirmed) {
      try {
        await SOSManagement.removeEmTeam({ team_id: id });
        alert(t('emTeam.teamDeleteSuccess'));
        setDel((prev) => !prev);
      } catch (error) {
        alert(t('emTeam.teamDeleteError'));
      }
    } else {
      alert(t('emTeam.teamDeleteCanceled'));
    }
  };

  const handleActivate = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(
      t('emTeam.confirmActivateTeam')
    );
    if (confirmed) {
      try {
        await SOSManagement.activateEmTeam({ team_id: id });
        alert(t('emTeam.teamActivateSuccess'));
        setDel((prev) => !prev);
      } catch (error) {
        alert(t('emTeam.teamActivateError'));
      }
    } else {
      alert(t('emTeam.teamActivateCanceled'));
    }
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    navigate(`/new/em-team/${id}`);
  };

  const actionColumn = [
    {
      name: "Action",
      label: t('emTeam.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Button
                color="primary"
                onClick={(e) => handleEdit(e, tableMeta.rowData[0])}
                title={t('emTeam.editTeam')}
              >
                <EditIcon />
              </Button>
              {tableMeta.rowData[1]!=='Active' && tableMeta.rowData[1]!=='Removed' && <Button
                color="primary"
                onClick={(e) => handleActivate(e, tableMeta.rowData[0])}
                title={t('emTeam.activateTeam')}
              >
                <CheckIcon />
              </Button>
              }
              {tableMeta.rowData[1]!=='Removed' &&
              <Button
                color="primary"
                onClick={(e) => handleDelete(e, tableMeta.rowData[0])}
                title={t('emTeam.deleteTeam')}
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
            tableTitle={t('emTeam.emTeams')}
            rows={emTeamList}
            columns={emTeamColumns.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default ListEmTeam;
