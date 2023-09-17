export const getPublicCSRFToken = () => {
    fetch('http://localhost:4000/api/v1/authentication/user', {
        method: 'GET',
        credentials: 'include'
    });
}

type isAuthenticatedPromiseType = {
  status: 'ok' | 'fail' | 'ERR_CONNECTION_REFUSED', 
  user: object
}

type isMFAModePromiseType = {
  status: 'MFA-Mode' | 'ok' | 'fail' | 'ERR_CONNECTION_REFUSED' | any, 
  user: object,
  response?: any
}

export const isAuthenticated = async (): Promise<isAuthenticatedPromiseType> => {
  try {
    const response: any = await fetch(`${process.env.REACT_APP_API}/api/v1/authentication/user`, {
      method: 'GET',
      credentials: 'include'
    }).then((response) => response.json());

    if (response.status === 'ok') return {status: 'ok', user: response.user};
    return {status: 'fail', user: {}};
  } catch (error: any) {
    return {status: 'fail', user: {}};
  }
};

export const isMFAMode = async (): Promise<isMFAModePromiseType> => {
  try {
    const response: any = await fetch(`${process.env.REACT_APP_API}/api/v1/authentication/user`, {
      method: 'GET',
      credentials: 'include'
    }).then((response) => response.json());

    if (response.status === 'MFA-Mode') return {status: response.status, user: response.user};
    if (response.status === 'ok') return {status: response.status, user: response.user};
    return {status: 'fail', user: {}, response: response};
  } catch (error: any) {
    return {status: 'fail', user: {}, };
  }
};