import { api } from 'src/boot/axios';

interface ApiResponse<T = any> {
  error: boolean;
  errorMessage: string;
  data: T;
  returnCode: number;
}

function isSuccessStatus(status: number): boolean {
  return status === 200 || status === 201 || status === 204;
}

export async function apiGet(endpoint: string, axiosConfig: any) {
  const returnData: ApiResponse = {
    error: true,
    errorMessage: '',
    data: {},
    returnCode: 0,
  };

  try {
    const response = await api.get(endpoint, axiosConfig);

    returnData.returnCode = response.status;
    if (isSuccessStatus(response.status)) {
      returnData.error = false;
      returnData.data = response.data;
    } else {
      returnData.error = true;
      returnData.errorMessage = response.data;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API Error returned code ' + response.status + '.';
      }
    }
  } catch (error: any) {
    returnData.returnCode = 1;
    if (error.response) {
      returnData.returnCode = error.response.status;
      returnData.error = true;
      returnData.errorMessage = error.response.data.error;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API returned code ' + error.response.status.toString();
        returnData.errorMessage += ' ' + error.response.statusText;
      }
    } else {
      returnData.error = true;
      returnData.errorMessage = error.message;
      if (returnData.errorMessage == '' || error.message == undefined) {
        returnData.errorMessage = 'Error during request.';
      }
    }
  }

  return returnData;
}

export async function apiDelete(endpoint: string, axiosConfig: any) {
  const returnData: ApiResponse = {
    error: true,
    errorMessage: '',
    data: {},
    returnCode: 0,
  };

  try {
    const response = await api.delete(endpoint, axiosConfig);

    returnData.returnCode = response.status;
    if (isSuccessStatus(response.status)) {
      returnData.error = false;
      returnData.data = response.data;
    } else {
      returnData.error = true;
      returnData.errorMessage = response.data;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API Error returned code ' + response.status + '.';
      }
    }
  } catch (error: any) {
    returnData.returnCode = 1;
    if (error.response) {
      returnData.returnCode = error.response.status;
      returnData.error = true;
      returnData.errorMessage = error.response.data.error;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API returned code ' + error.response.status.toString();
        returnData.errorMessage += ' ' + error.response.statusText;
      }
    } else {
      returnData.error = true;
      returnData.errorMessage = error.message;
      if (returnData.errorMessage == '' || error.message == undefined) {
        returnData.errorMessage = 'Error during request.';
      }
    }
  }

  return returnData;
}

export async function apiPost(endpoint: string, data: any, axiosConfig: any) {
  const returnData: ApiResponse = {
    error: true,
    errorMessage: '',
    data: {} as any,
    returnCode: 0,
  };

  try {
    const response = await api.post(endpoint, data, axiosConfig);

    returnData.returnCode = response.status;
    if (isSuccessStatus(response.status)) {
      returnData.error = false;
      returnData.data = response.data;
    } else {
      returnData.error = true;
      returnData.errorMessage = response.data;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API Error returned code ' + response.status + '.';
      }
    }
  } catch (error: any) {
    returnData.returnCode = 1;
    if (error.response) {
      returnData.returnCode = error.response.status;
      returnData.error = true;
      returnData.errorMessage = error.response.data.error;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API returned code ' + error.response.status.toString();
        returnData.errorMessage += ' ' + error.response.statusText;
      }
    } else {
      returnData.error = true;
      returnData.errorMessage = error.message;
      if (returnData.errorMessage == '' || error.message == undefined) {
        returnData.errorMessage = 'Error during request.';
      }
    }
  }

  return returnData;
}

export async function apiPut(endpoint: string, data: any, axiosConfig: any) {
  const returnData: ApiResponse = {
    error: true,
    errorMessage: '',
    data: {} as any,
    returnCode: 0,
  };

  try {
    const response = await api.put(endpoint, data, axiosConfig);

    returnData.returnCode = response.status;
    if (isSuccessStatus(response.status)) {
      returnData.error = false;
      returnData.data = response.data;
    } else {
      returnData.error = true;
      returnData.errorMessage = response.data;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API Error returned code ' + response.status + '.';
      }
    }
  } catch (error: any) {
    returnData.returnCode = 1;
    if (error.response) {
      returnData.returnCode = error.response.status;
      returnData.error = true;
      returnData.errorMessage = error.response.data.error;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API returned code ' + error.response.status.toString();
        returnData.errorMessage += ' ' + error.response.statusText;
      }
    } else {
      returnData.error = true;
      returnData.errorMessage = error.message;
      if (returnData.errorMessage == '' || error.message == undefined) {
        returnData.errorMessage = 'Error during request.';
      }
    }
  }

  return returnData;
}

export async function apiPatch(endpoint: string, data: any, axiosConfig: any) {
  const returnData: ApiResponse = {
    error: true,
    errorMessage: '',
    data: {} as any,
    returnCode: 0,
  };

  try {
    const response = await api.patch(endpoint, data, axiosConfig);

    returnData.returnCode = response.status;
    if (isSuccessStatus(response.status)) {
      returnData.error = false;
      returnData.data = response.data;
    } else {
      returnData.error = true;
      returnData.errorMessage = response.data;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API Error returned code ' + response.status + '.';
      }
    }
  } catch (error: any) {
    returnData.returnCode = 1;
    if (error.response) {
      returnData.returnCode = error.response.status;
      returnData.error = true;
      returnData.errorMessage = error.response.data.error;
      if (returnData.errorMessage == '' || returnData.errorMessage == undefined) {
        returnData.errorMessage = 'API returned code ' + error.response.status.toString();
        returnData.errorMessage += ' ' + error.response.statusText;
      }
    } else {
      returnData.error = true;
      returnData.errorMessage = error.message;
      if (returnData.errorMessage == '' || error.message == undefined) {
        returnData.errorMessage = 'Error during request.';
      }
    }
  }

  return returnData;
}
