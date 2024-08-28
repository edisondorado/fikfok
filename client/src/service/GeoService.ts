import axios from "axios";

const getCountry = async (): Promise<string | null> => {
    try {
        const response = await axios.get("http://ip-api.com/json");
        return response.data.country;
    } catch (err) {
        console.error("Error location:", err);
        return null;
    }
};

export default getCountry;
