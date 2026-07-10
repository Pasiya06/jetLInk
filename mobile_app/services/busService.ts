const API = process.env.EXPO_PUBLIC_API_URL;

export const updateBus = async (id: string, bus: any) => {

    const response = await fetch(`${API}/buses/${id}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(bus)
    });

    return await response.json();
};

export const getBus = async(id:string)=>{

    const response = await fetch(`${API}/buses/${id}`);

    return await response.json();
}