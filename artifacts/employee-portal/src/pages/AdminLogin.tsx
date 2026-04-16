export default function AdminLogin() {
  const handleLogin = async () => {
    try {
      const result = await authenticateUser();

      if (!result || typeof result !== "object") {
        throw new Error("Unexpected response format received.");
      }

      if (result.authenticated) {
        console.log("User authenticated successfully.");
      } else {
        throw new Error("Invalid username or password.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
