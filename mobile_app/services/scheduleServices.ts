const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getSchedules = async () => {
  const response = await fetch(`${API_URL}/schedules`);
  return await response.json();
};

export const deleteSchedule = async (id: string) => {
  const response = await fetch(`${API_URL}/schedules/${id}`, {
    method: "DELETE",
  });

  return await response.json();
};

export const updateSchedule = async (
  id: string,
  schedule: any
) => {

  const response = await fetch(`${API_URL}/schedules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schedule),
  });

  return await response.json();
};