import api from "./client";

export const loginUser = async (email: string, password: string) => {
  // MOCK LOGIN: Simulate a delay and return a fake token
  console.log("Mocking login for:", email);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    token: "mock-jwt-token-123",
    user: {
      id: "1",
      email: email,
      name: "Demo User"
    }
  };

  /* Original code:
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
  */
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  // MOCK REGISTER: Simulate a delay and return a fake token
  console.log("Mocking registration for:", email);
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    token: "mock-jwt-token-123",
    user: {
      id: "1",
      email: email,
      name: name
    }
  };

  /* Original code:
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
  */
};

export const loginWithGoogle = async (accessToken: string) => {
  // In a real app, you would send this token to your backend
  // Your backend would then verify the token with Google and return a JWT
  console.log("Mocking Google Login with token:", accessToken);
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    token: "google-mock-jwt-token-456",
    user: {
      id: "google-1",
      email: "google-user@example.com",
      name: "Google User"
    }
  };
};
