const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const addConductor = async (conductorData: any) => {
  const response = await fetch(`${API_URL}/conductors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conductorData),
  });

  return await response.json();
};

export const getConductors = async () => {
  const response = await fetch(`${API_URL}/conductors`);
  return await response.json();
};

export const getConductorById = async (id: string) => {
  const response = await fetch(`${API_URL}/conductors/${id}`);
  return await response.json();
};

export const deleteConductor = async (id: string) => {
  const response = await fetch(`${API_URL}/conductors/${id}`, {
    method: "DELETE",
  });

  return await response.json();
};

export const updateConductor = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/conductors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};