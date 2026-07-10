const API = process.env.EXPO_PUBLIC_API_URL;

export const registerPassenger = async (passenger: any) => {
  const response = await fetch(`${API}/passengers/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passenger),
  });

  return await response.json();
};

export const loginPassenger = async (email: string, password: string) => {
  const response = await fetch(`${API}/passengers/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return await response.json();
};

export async function getPassengers() {
  const response = await fetch(`${API}/passengers`);

  return await response.json();
};

