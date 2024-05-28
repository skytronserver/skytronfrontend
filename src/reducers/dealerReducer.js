const initialState = {
    list:[],
    error:null
};
const dealerReducer=(state=initialState,action)=>{
    switch(action.type){
        case 'GET_ALL_DEALER':
            return {
                ...state,
                list:action.payload
            }
        default :
            return state;
    }

}
export default dealerReducer;
