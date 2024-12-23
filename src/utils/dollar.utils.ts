import axios from "axios";

export const getCurrentDollarValue = async (): Promise<number> => {
  const value = await axios
    .get("https://dolarapi.com/v1/dolares/oficial")
    .then((data) => data?.data?.venta);
  return value;
};
