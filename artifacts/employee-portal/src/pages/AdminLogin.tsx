handleLogin = async () => {
    try {
        const result = await authenticateUser();

        if (!result || typeof result !== 'object') {
            console.error('Login response format is incorrect:', result);
            throw new Error('Unexpected response format received.');
        }

        if (result.authenticated === true) {
            console.log('User authenticated successfully.');
            // Proceed with successful login actions
        } else {
            console.error('Invalid credentials provided.');
            throw new Error('Invalid username or password. Please try again.');
        }

    } catch (error) {
        console.error('An error occurred during login:', error);
        // Handle the error appropriately, maybe using a toast or modal
    }
};