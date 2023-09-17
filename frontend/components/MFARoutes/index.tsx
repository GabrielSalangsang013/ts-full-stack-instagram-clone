import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isMFAMode } from '@/helpers/auth';

const MFARoutes = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  const WrapperComponent: React.FC<P> = (props) => {
    const [authenticatedUser, setAuthenticatedUser] = useState<object>({});
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const router = useRouter();

    useEffect(() => {
      async function checkAuth() {
        const result = await isMFAMode();

        if(result.status === 'ok') {
          router.replace('/home');
        }

        if (result.status !== 'ok' && result.status !== 'MFA-Mode') {
          // Redirect to the login page or show an unauthorized message
          router.replace('/login'); // Update with your login route
        }

        setAuthenticatedUser(result.user);
        setIsLoading(false);
      }

      checkAuth();
    }, []);

    return isLoading ? null : (
      <WrappedComponent {...props} authenticatedUser={authenticatedUser} />
    );
  };

  return WrapperComponent;
};

export default MFARoutes;