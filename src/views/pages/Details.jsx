import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ManufacturerServices from "../../services/ManufacturerServices";
import {formatDate} from "../../helper";
import SettingService from "../../services/SettingService";
const ProfileCard = () => {
    const { userId } = useParams();
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

    })
    console.log(user);
    const openFile=async(e,filePath)=>{
        e.preventDefault();
        const file_path={
            file_path:filePath
        }
        try{
            const viewFiles=await SettingService.file_Download(file_path);
            console.log(viewFiles);
        }catch(error){
            console.log(error);
        }
    }
    useEffect(()=>{
        const retriveUserDetails = async () => {
            const uniqueId={
                manufacturer_id:userId
            }
            try {
              const retrieveData = await ManufacturerServices.findManufacturer(uniqueId);
              const userData=await retrieveData.data[0];
              setUser((prev)=>({...prev,
                role:userData?.users[0]?.role,
                name:userData?.users[0]?.name,
                email:userData?.users[0]?.email,
                mobile:userData?.users[0]?.mobile,
                dob:userData?.users[0]?.dob,
                gstNo:userData?.gstnnumber,
                company_name:userData?.company_name,
                expiryDate:userData?.expirydate,
                state:userData?.state?.state,
                idProofno:userData?.idProofno,
                created_by_name:userData?.users[0]?.created_by_name,
                file_authLetter	:userData?.file_authLetter,
                file_companRegCertificate:userData?.file_companRegCertificate,
                file_GSTCertificate:userData?.file_GSTCertificate,
                file_idProof:userData?.file_idProof
            }));
            setIsLoaded(true);
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.log("User not found"); // Set a specific error message for 404
              } else {
                console.log("An error occurred while fetching user data");
              }
            }
          };
          retriveUserDetails();
    },[])
    const role={
        devicemanufacture:'Device Manufacturer' 
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
              <strong>Date of Birth: </strong>{user.dob!=='' && formatDate(user.dob)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Expiry Date: </strong>{user.expiryDate}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>State: </strong>{user.state}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>GST Number: </strong>{user.gstNo}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Company Name: </strong>{user.company_name}
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
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>ID Proof: </strong>{user.file_idProof}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Registration Certificate: </strong>{user.file_companRegCertificate!=='' && <a href='' onClick={(e)=>openFile(e,user.file_companRegCertificate)}>View Certificate</a>}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>GST Certificate: </strong>{user.file_GSTCertificate}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Authorization Letter: </strong>{user.file_authLetter}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      }
    </Card>
  );
}

export default ProfileCard;
