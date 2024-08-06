// material-ui
import { useState,useEffect} from "react";
import {Grid,TextField} from '@mui/material';
import Button from "@mui/material/Button"
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import * as Yup from "yup";
import { Formik, Form, useFormik } from "formik";
import {useSelector,useDispatch} from 'react-redux'
import { fetchUserData } from '../../actions/dataActions';
import Datatable from '../../datatables/Datatable';
import {userColumns} from '../../datatables/rowsColumn';
import DummyServices from '../../services/DummyServices';
const NewUser = () => {
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData=await DummyServices.getUsers();
      dispatch(fetchUserData(retriveData.data)) ;
      setLoad(true)
    };
    retrievePosts();
  },[dispatch])
  const registeredData=useSelector((state)=>state.userData.userData);
  const [selectedFileName, setSelectedFileName] = useState('');
  const initialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    idProofNo: "",
    idProof: null,
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setSelectedFileName(selectedFile.name);
    }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
      mobile: Yup.string()
      .matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number')
      .required('Mobile Number is required'),
    companyName: Yup.string().required("Company Name is required"),
    gstNo: Yup.string().required("GTS No is required"),
    idProofNo: Yup.string().required("ID Proof Number is required"),
    idProof: Yup.mixed().required("ID Proof is required"),
  });
  const handleSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      alert("Form submitted successfully!");
      setSubmitting(false);
    }, 1000);
  };
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="State" />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <MainCard title="New User">
              <Formik
                initialValues={formik.initialValues}
                onSubmit={formik.handleSubmit}
              >
                <Form>
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("name")}
                        error={
                          formik.touched.name && Boolean(formik.errors.name)
                        }
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Mobile Number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("mobile")}
                        error={
                          formik.touched.mobile && Boolean(formik.errors.mobile)
                        }
                        helperText={
                          formik.touched.mobile && formik.errors.mobile
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("email")}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("companyName")}
                        error={
                          formik.touched.companyName &&
                          Boolean(formik.errors.companyName)
                        }
                        helperText={
                          formik.touched.companyName &&
                          formik.errors.companyName
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="GST No."
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("gstNo")}
                        error={
                          formik.touched.gstNo && Boolean(formik.errors.gstNo)
                        }
                        helperText={formik.touched.gstNo && formik.errors.gstNo}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="ID Proof Number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("idProofNo")}
                        error={
                          formik.touched.idProofNo &&
                          Boolean(formik.errors.idProofNo)
                        }
                        helperText={
                          formik.touched.idProofNo && formik.errors.idProofNo
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sx={{
                      pt:2,
                      pb:2
                    }}> 
                      <input
                        id="idProof"
                        name="idProof"
                        type="file"
                        onChange={(event) =>{
                          handleFileChange(event);
                          formik.setFieldValue(
                            "idProof",
                            event.currentTarget.files[0]
                          )
                        }
                        }
                        onBlur={() => formik.setFieldTouched("idProof", true)}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="idProof">
                        <Button variant="outlined" component="span">
                          Select ID Proof
                        </Button> <span style={{
                          color:"#2196f3",
                          fontStyle:"italic"
                        }}>{selectedFileName}</span>
                      </label>
                      {formik.touched.idProof && formik.errors.idProof && (
                        <div style={{ color: "red", marginTop: "8px" }}>
                          {formik.errors.idProof}
                        </div>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary">
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              </Formik>
            </MainCard>
          </Grid>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <MainCard title="Users">
            {load && <Datatable userRows={registeredData} userColumns={userColumns}/>}
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default NewUser;
