const API = process.env.EXPO_PUBLIC_API_URL;

export const sendOTP = async (data: any) => {
    const response = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
};

export const verifyOTP = async (data:any)=>{
    const response = await fetch(`${API}/auth/verify-otp`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    });

    return response.json();
};