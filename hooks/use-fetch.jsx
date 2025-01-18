import { toast } from "sonner";

const { useState } = require("react");

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);

      console.log(response);
      if (response && !response.success) {
        throw new Error(response.error?.message || "Unknown Error Occurred ");
      }
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
