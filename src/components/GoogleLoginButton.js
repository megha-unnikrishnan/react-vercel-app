


// import React, { useEffect } from 'react';
// import { GoogleLogin } from '@react-oauth/google';
// import { useDispatch, useSelector } from 'react-redux';
// import { googleLogin } from '../features/authSlice';
// import { useNavigate } from 'react-router-dom';
// import { fetchUserDetails } from '../features/authSlice';
// const GoogleLoginButton = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { status } = useSelector((state) => state.auth);

//    // In GoogleLoginButton component
//    const responseGoogle = async (response) => {
//     if (response.credential) {
//       const tokenId = response.credential;
//       console.log('Google token:', tokenId);
  
//       try {
//         const loginResponse = await dispatch(googleLogin({ idToken: tokenId })).unwrap();
//         console.log('Login response:', loginResponse);
  
//         // Store token in localStorage
//         localStorage.setItem('token', loginResponse.token);
  
//         // Fetch user details after successful login
//         await dispatch(fetchUserDetails()).unwrap();
//       } catch (error) {
//         console.error('Error during Google login:', error);
//         console.error('Error details:', error.message, error.stack);
//       }
//     } else {
//       console.error('Failed to receive token');
//     }
//   };


//     useEffect(() => {
//         if (status === 'succeeded') {
//             navigate('/fetch-all-posts');
//         }
//     }, [status, navigate]);

//     return (
//         <GoogleLogin
//             onSuccess={responseGoogle}
//             onFailure={responseGoogle}
//             logo="Google"
//             clientId="221641798990-tjggsbal6ffkec13snt89l2hgmad4eo5.apps.googleusercontent.com" // Replace with your actual client ID
//         />
//     );
// };

// export default GoogleLoginButton;









import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status } = useSelector((state) => state.auth);

    // In GoogleLoginButton component
    const responseGoogle = async (response) => {
        if (response.credential) {
            const tokenId = response.credential;
            console.log('Google token:', tokenId);

            try {
                // Dispatch the action to perform the Google login
                const loginResponse = await dispatch(googleLogin({ idToken: tokenId })).unwrap();
                console.log('Login response:', loginResponse);

                // Store token in localStorage for future use
                localStorage.setItem('token', loginResponse.token);

                // Optionally, fetch user details after successful login
                // You can implement a user fetch here if necessary
                // await dispatch(fetchUserDetails()).unwrap();

                // Navigate to the profile or home page after successful login
                navigate('/profile');  // Navigate to the profile or any page as needed
            } catch (error) {
                console.error('Error during Google login:', error);
            }
        } else {
            console.error('Failed to receive token');
        }
    };

    useEffect(() => {
        if (status === 'succeeded') {
            navigate('/profile');  // Ensure this redirects correctly after a successful login
        }
    }, [status, navigate]);

    return (
        <GoogleLogin
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            logo="Google"
            clientId="221641798990-tjggsbal6ffkec13snt89l2hgmad4eo5.apps.googleusercontent.com" // Replace with your actual client ID
        />
    );
};

export default GoogleLoginButton;

