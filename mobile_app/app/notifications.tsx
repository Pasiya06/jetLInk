import React from "react";
import { useLocalSearchParams } from "expo-router";
import StaffAlertsScreen from "../components/StaffAlertsScreen";

// One Alerts screen for everyone. Alerts are stored on the server:
//   /notifications?role=admin
//   /notifications?role=staff&busNumber=NB-1234
//   /notifications?role=passenger   (uses the email saved at login)
export default function NotificationsScreen() {
  const { role, busNumber, busNo } = useLocalSearchParams<{
    role?: string;
    busNumber?: string;
    busNo?: string;
  }>();

  if (role === "admin" || role === "staff") {
    return <StaffAlertsScreen role={role} busNumber={busNumber || busNo || undefined} />;
  }
  return <StaffAlertsScreen role="passenger" />;
}
