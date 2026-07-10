const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const addDriver = async (driverData: any) => {
  try {
    const response = await fetch(`${API_URL}/drivers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(driverData),
    });

    return await response.json();
  } catch (error) {
    console.log("Driver Service Error:", error);
    throw error;
  }
};
export const getDrivers = async () => {
  const response = await fetch(`${API_URL}/drivers`);

  if (!response.ok) {
    throw new Error("Failed to load drivers");
  }

  return await response.json();
};

// Get one driver
export const getDriverById = async (id: string) => {
  const response = await fetch(`${API_URL}/drivers/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load driver");
  }

  return await response.json();
};

export const updateDriver = async (id: string, driver: any) => {
  const res = await fetch(`${API_URL}/drivers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(driver),
  });

  return await res.json();
};

export const deleteDriver = async (id: string) => {
  const res = await fetch(`${API_URL}/drivers/${id}`, {
    method: "DELETE",
  });

  return await res.json();
};