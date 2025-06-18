import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ManufacturerServices from "../../services/ManufacturerServices";
import DealerServices from "../../services/DealerServices";
import {formatDate,openFile} from "../../helper";
import SettingService from "../../services/SettingService";
import DescriptionIcon from '@mui/icons-material/Description';
import UserServices from "../../services/UserServices";
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

const docViewStyle={
  padding:"0px"
}

const Details = () => {
    const { userId,userType } = useParams();
    const { t } = useTranslation('pages');
    const [isLoaded,setIsLoaded]=useState(false)
    const [user,setUser]=useState({
        role:"",
        name:"",
        email:"",
        mobile:"",
        dob:"",
        gstNo:"",
        district:"",
        company_name:"",
        expiryDate:"",
        state:"",
        idProofno:"",
        created_by_name:"",
        file_authLetter	:"",
        file_companRegCertificate:"",
        file_GSTCertificate:"",
        file_idProof:""

    });
    useEffect(()=>{
      const retrieveUserDetails = async () => {
        try {
            let retrieveData;
            if (userType === 'manufacturer') {
                retrieveData = await ManufacturerServices.findManufacturer({ manufacturer_id: userId });
            } else if (userType === 'dealer') {
                retrieveData = await DealerServices.dealerList({ dealer_id: userId });
            }else if (userType === 'sosUser') {
              retrieveData = await UserServices.fetchSOSAdmin({ StateAdmin_id: userId });
            }else if (userType === 'sosOtherUser') {
              retrieveData = await UserServices.fetchSOSUser({ SOSUser_id: userId });
            }
            else if (userType === 'dtoUser') {
              retrieveData = await UserServices.fetchDTOList({ dto_rto_id: userId });
            }
            else if (userType === 'stateadmin') {
              retrieveData = await UserServices.fetchStateAdmin({ StateAdmin_id: userId });
            } else if (userType === 'serviceProvider') {
              retrieveData = await UserServices.fetchSimProvider({ eSimProvider_id: userId });
            }
            else {
                throw new Error("Unsupported user type");
            }

            const userData = retrieveData.data[0];
            setUser({
                role: userData?.users[0]?.role || "",
                name: userData?.users[0]?.name || "",
                email: userData?.users[0]?.email || "",
                mobile: userData?.users[0]?.mobile || "",
                dob: userData?.users[0]?.dob || "",
                district: userData?.district || "",
                gstNo: userData?.gstnnumber || "",
                company_name: userData?.company_name || "",
                expiryDate: userData?.expirydate || "",
                state: userData?.state?.state || "",
                idProofno: userData?.idProofno || "",
                created_by_name: userData?.users[0]?.created_by_name || "",
                file_authLetter: userData?.file_authLetter || "",
                file_companRegCertificate: userData?.file_companRegCertificate || "",
                file_GSTCertificate: userData?.file_GSTCertificate || "",
                file_idProof: userData?.file_idProof || ""
            });

            setIsLoaded(true);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log("User not found");
            } else {
                console.log("An error occurred while fetching user data");
            }
        }
    };

    retrieveUserDetails();
    },[])
    
    const role = {
        devicemanufacture: t('details.roles.devicemanufacture'),
        dealer: t('details.roles.dealer'),
        stateadmin: t('details.roles.stateadmin'),
        sosadmin: t('details.roles.sosadmin'),
        dtorto: t('details.roles.dtorto'),
        esimprovider: t('details.roles.esimprovider')
    }
    
  return (
    <Card sx={{ margin: 'auto' }}>
      {isLoaded && <CardContent>
        <Typography gutterBottom variant="h4" component="div">
          {(user.name).toUpperCase()}<br/>
          <strong>{user?.role!=='' && role[user.role]}</strong> <strong>{user?.district!=='' && user?.district}</strong>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.email')}: </strong>{user.email}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.mobile')}: </strong>{user.mobile}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.dateOfBirth')}: </strong>{user.dob!=='' ? formatDate(user.dob) : t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.expiryDate')}: </strong>{user.expiryDate!=='' ? user.expiryDate : t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.state')}: </strong>{user.state!==''? user.state : t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.gstNumber')}: </strong>{user.gstNo!==''?user.gstNo: t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.companyName')}: </strong>{user.company_name!=='' ?user.company_name: t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.createdBy')}: </strong>{user.created_by_name}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.idProofNumber')}: </strong>{user.idProofno}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.idProof')}: </strong>{user.file_idProof!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_idProof)} >
              <span><DescriptionIcon/></span>{t('details.viewIdProof')}
              </Button>: t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.registrationCertificate')}: </strong>{user.file_companRegCertificate!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_companRegCertificate)} >
              <span><DescriptionIcon/></span>{t('details.viewCertificate')}
              </Button>: t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.gstCertificate')}: </strong>{user.file_GSTCertificate!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_GSTCertificate)} >
              <span><DescriptionIcon/></span>{t('details.viewGstCertificate')}
              </Button>: t('details.notAvailable')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('details.authorizationLetter')}: </strong>{user.file_authLetter!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_authLetter)} >
              <span><DescriptionIcon/></span>{t('details.viewAuthorizationLetter')}
              </Button>: t('details.notAvailable')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      }
    </Card>
  );
}

export default Details;
