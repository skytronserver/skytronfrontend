const initialState = {
    sosAdmin:[],
    error:null
};
const listReducer=(state=initialState,action)=>{
    switch(action.type){
        case 'GET_ALL_SOS_ADMIN':
            return {
                ...state,
                sosAdmin:action.payload
            }
        default :
            return state;
    }

}
export default listReducer;
