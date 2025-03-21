import React from "react";
import Layout from "./../components/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from 'react-hot-toast';

const Search = () => {
  const [values, setValues] = useSearch();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();

  // Hanlde clikcing More Details Button
  const handleMoreDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Hanlde clikcing Add To Cart Button
  const handleAddCart = (product) => {
    setCart([...cart, product]);
    localStorage.setItem(
      "cart",
      JSON.stringify([...cart, product])
    );
    toast.success("Item added to cart")
  };

  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          <h1>Search Resuts</h1>
          <h6>
            {values?.results.length < 1
              ? "No Products Found"
              : `Found ${values?.results.length}`}
          </h6>
          <div className="d-flex flex-wrap mt-4">
            {values?.results.map((p) => (
              <div key={p._id} className="card m-2" style={{ width: "18rem" }}>
                <img
                  src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">
                    {p.description.length > 30 ? p.description.substring(0, 30) + '...' : p.description}
                  </p>
                  <p className="card-text"> $ {p.price}</p>
                  <button className="btn btn-primary ms-1" onClick={() => handleMoreDetails(p._id)}>More Details</button>
                  <button className="btn btn-secondary ms-1" onClick={() => handleAddCart(p)}>Add To Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;