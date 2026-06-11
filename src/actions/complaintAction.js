import HelpDeskService from "../services/HelpDeskService";

export const getComplaintList =
  (filters) => async (dispatch) => {
    dispatch({
      type: "COMPLAINT_LIST_REQUEST",
    });

    const response =
      await HelpDeskService.getComplaints(
        filters
      );

    if (response.success) {
      dispatch({
        type: "COMPLAINT_LIST_SUCCESS",
        payload: response.data,
      });
    } else {
      dispatch({
        type: "COMPLAINT_LIST_FAIL",
        payload: response.message,
      });
    }
  };

export const getComplaintDetailsAction =
  (id) => async (dispatch) => {
    dispatch({
      type: "COMPLAINT_DETAILS_REQUEST",
    });

    const response =
      await HelpDeskService.getComplaintDetails(id);

    if (response.success) {
      dispatch({
        type: "COMPLAINT_DETAILS_SUCCESS",
        payload: response.data,
      });
    } else {
      dispatch({
        type: "COMPLAINT_DETAILS_FAIL",
        payload: response.message,
      });
    }
  };

export const updateStatusAction =
  (id, payload) => async (dispatch) => {
    dispatch({
      type: "UPDATE_STATUS_REQUEST",
    });

    const response =
      await HelpDeskService.updateComplaintStatus(
        id,
        payload
      );

    if (response.success) {
      dispatch({
        type: "UPDATE_STATUS_SUCCESS",
        payload: response.data,
      });
    } else {
      dispatch({
        type: "UPDATE_STATUS_FAIL",
        payload: response.message,
      });
    }
  };

export const addCommentAction =
  (id, payload) => async (dispatch) => {
    dispatch({
      type: "ADD_COMMENT_REQUEST",
    });

    const response =
      await HelpDeskService.addComment(
        id,
        payload
      );

    if (response.success) {
      dispatch({
        type: "ADD_COMMENT_SUCCESS",
        payload: response.data,
      });
    } else {
      dispatch({
        type: "ADD_COMMENT_FAIL",
        payload: response.message,
      });
    }
  };

export const submitFinalReportAction =
  (id, formData) => async (dispatch) => {
    dispatch({
      type: "FINAL_REPORT_REQUEST",
    });

    const response =
      await HelpDeskService.submitFinalReport(
        id,
        formData
      );

    if (response.success) {
      dispatch({
        type: "FINAL_REPORT_SUCCESS",
        payload: response.data,
      });
    } else {
      dispatch({
        type: "FINAL_REPORT_FAIL",
        payload: response.message,
      });
    }
  };