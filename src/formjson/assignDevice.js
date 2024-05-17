import * as Yup from "yup";
import DeviceModelServices from "../services/DeviceModelServices";
import DealerServices from "../services/DealerServices";
const retriveModelList = async () => {
  try {
    const response = await DeviceModelServices.getDeviceList();
    const list=response.data.data.map(device => ({
      value: device.id,
      label: device.imei,
    })); 
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
     console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
const retriveDealerList=async()=>{
    try{
        const res=await DealerServices.dealerList();
        const arrayList=res.data.map(dealer=>({
            value:dealer.id,
            label:dealer.company_name,
        }));
        return arrayList;
    }catch(error){
        if (error.response && error.response.status === 404) {
            console.log('No Data Found')
           } else {
             console.log('No Data Found')
           }
    }
}
let modelList=[];
let dealerList=[];
if(localStorage.getItem('oAuthToken') && sessionStorage.getItem('sessionID')){
  modelList=await retriveModelList();
  dealerList=await retriveDealerList();
}

export const assignDeviceInitials = {
    dealer:"",
    device:[],
    shipping_remark:"",
};
export const assignDeviceFormFields = {
    dealer: {
        name: "dealer",
        type: "select",
        label: "Dealer",
        validation: Yup.string().required("Dealer is required"),
        options: dealerList,
      },
  device: {
    name: "device",
    type: "multiselect",
    label: "Device",
    options: modelList,
  },
  shipping_remark: {
    name: "shipping_remark",
    type: "text",
    label: "Remarks",
  },  
};
