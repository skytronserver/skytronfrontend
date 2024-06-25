import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ManufacturerServices from "../../services/ManufacturerServices";
import DealerServices from "../../services/DealerServices";
import {formatDate} from "../../helper";
import SettingService from "../../services/SettingService";
import DescriptionIcon from '@mui/icons-material/Description';
import UserServices from "services/UserServices";
import Button from '@mui/material/Button';
const docViewStyle={
  padding:"0px"
}
const Details = () => {
    const { userId,userType } = useParams();
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded,setIsLoaded]=useState(false)
    const [user,setUser]=useState({
        role:"",
        name:"",
        email:"",
        mobile:"",
        dob:"",
        gstNo:"",
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
    const createImageUrl = (blob) => {
      return URL.createObjectURL(blob);
    };
    const openFile = async (e, filePath) => {
      e.preventDefault();
      const file_path = {
        file_path: filePath,
      };
      try {
        const viewFiles = await SettingService.file_Download(file_path);
        const blob = new Blob([viewFiles.data], {
          type: "image/png",
        });
        const url = window.URL.createObjectURL(blob);
        setImageSrc("data:image/png;base64," + viewFiles.data);
        console.log(viewFiles);
        console.log(blob);
        return () => window.URL.revokeObjectURL(url);
      } catch (error) {
        console.log(error);
      }
    };
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
            }else if (userType === 'stateadmin') {
              retrieveData = await UserServices.fetchStateAdmin({ StateAdmin_id: userId });
            }else {
                throw new Error("Unsupported user type");
            }

            const userData = retrieveData.data[0];
            setUser({
                role: userData?.users[0]?.role || "",
                name: userData?.users[0]?.name || "",
                email: userData?.users[0]?.email || "",
                mobile: userData?.users[0]?.mobile || "",
                dob: userData?.users[0]?.dob || "",
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
    const role={
        devicemanufacture:'Device Manufacturer',
        dealer:'Dealer',
        stateadmin:'State Admin',
        sosadmin:'SOS Admin'
    }
  return (
    <Card sx={{ margin: 'auto' }}>
      {isLoaded && <CardContent>
        <Typography gutterBottom variant="h4" component="div">
          {(user.name).toUpperCase()}<br/>
          <strong>{user?.role!=='' && role[user.role]}</strong>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Email: </strong>{user.email}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Mobile: </strong>{user.mobile}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Date of Birth: </strong>{user.dob!=='' ? formatDate(user.dob) :'NA'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Expiry Date: </strong>{user.expiryDate!=='' ? user.expiryDate : 'NA'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>State: </strong>{user.state!==''? user.state :'NA'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>GST Number: </strong>{user.gstNo!==''?user.gstNo:'NA'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Company Name: </strong>{user.company_name!=='' ?user.company_name: 'NA'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Created By: </strong>{user.created_by_name}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>ID Proof Number: </strong>{user.idProofno}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>ID Proof: </strong>{user.file_idProof!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_idProof)} >
              <span><DescriptionIcon/></span>View ID Proof
              </Button>:'NA'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>Registration Certificate: </strong>{user.file_companRegCertificate!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_companRegCertificate)} >
              <span><DescriptionIcon/></span>View Certificate
              </Button>:'NA'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>GST Certificate: </strong>{user.file_GSTCertificate!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_GSTCertificate)} >
              <span><DescriptionIcon/></span>View GST Certificate
              </Button>:'NA'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>Authorization Letter: </strong>{user.file_authLetter!=='' ? <Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,user.file_authLetter)} >
              <span><DescriptionIcon/></span>View Authorization Letter
              </Button>:'NA'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      }
    </Card>
  );
}

export default Details;
