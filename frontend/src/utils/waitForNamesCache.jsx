import { useContext } from "react";
import NameContext from "../context/NameContext";


const waitForNamesCache = () => {
  return new Promise((resolve, reject) => {
    const { namesCache } = useContext(NameContext);

    const checkData = setInterval(() => {
      if (Object.keys(namesCache).length > 0) {
        clearInterval(checkData);
        clearTimeout(timeout);
        resolve(namesCache);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkData);
      reject(new Error("Timeout: No se pudo obtener namesCache en 60 segundos"));
    }, 60000);
  });
};

export default waitForNamesCache;
