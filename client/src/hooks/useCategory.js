import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  //get cat
  const getCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data.success) {
        setCategories(data?.category);
      } else {
        console.log(data?.message);
        toast.error(data?.message);
        setCategories([]);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching categories data");
      console.log(error);
      setCategories([]);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return categories;
}