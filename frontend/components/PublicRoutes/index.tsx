import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isMFAMode } from '@/helpers/auth';
import { useState } from 'react';

const publicRoutes = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  const WrapperComponent: React.FC<P> = (props) => {
    const router = useRouter();

    useEffect(() => {
      async function checkAuth() {
        const result = await isMFAMode();

        if(result.status === 'MFA-Mode') {
          router.replace('/login/multi-factor-authentication');
        }

        if (result.status === 'ok') {
          // Redirect to the login page or show an unauthorized message
          router.replace('/home'); // Update with your login route
        }
      }

      checkAuth();
    }, []);

    // Pass the isAuthenticated prop to the wrapped component
    return <WrappedComponent {...props} />;
  };

  return WrapperComponent;
};

export default publicRoutes;