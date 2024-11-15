





import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, user } = useSelector((state) => state.auth);
    const [userDetails, setUserDetails] = useState(null);

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

                // Log the username to console
                console.log('Username from loginResponse:', loginResponse.username);  // Log the username

                // Store user details in the state
                setUserDetails({
                    username: loginResponse.username,
                    firstName: loginResponse.first_name,
                    email: loginResponse.email,
                    profilePicture: loginResponse.profile_picture,
                });

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
        <div>
            <GoogleLogin
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                logo="Google"
                clientId="221641798990-tjggsbal6ffkec13snt89l2hgmad4eo5.apps.googleusercontent.com" // Replace with your actual client ID
            />
            
            {userDetails && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Welcome, {userDetails.firstName}!</h2>
                    <p className="text-sm">Username: {userDetails.username}</p>
                    <p className="text-sm">Email: {userDetails.email}</p>
                    <img 
                        src={userDetails.profilePicture} 
                        alt="Profile" 
                        className="mt-2 w-24 h-24 rounded-full"
                    />
                </div>
            )}
        </div>
    );
};

export default GoogleLoginButton;
