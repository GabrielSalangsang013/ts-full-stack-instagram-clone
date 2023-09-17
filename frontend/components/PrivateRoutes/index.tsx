import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/helpers/auth';

const privateRoutes = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  const WrapperComponent: React.FC<P> = (props) => {
    const [authenticatedUser, setAuthenticatedUser] = useState<object>({});
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const router = useRouter();

    useEffect(() => {
      async function checkAuth() {
        const result = await isAuthenticated();

        if (result.status !== 'ok') {
          // Redirect to the login page or show an unauthorized message
          router.replace('/login'); // Update with your login route
        }else {
          if(result.user) {
            setAuthenticatedUser(result.user);
            setIsLoading(false);
          }
        }
      }

      checkAuth();
    }, []);

    // Pass the isAuthenticated prop to the wrapped component
    return isLoading ? null : (
      <WrappedComponent {...props} authenticatedUser={authenticatedUser} />
    );
  };

  return WrapperComponent;
};

export default privateRoutes;