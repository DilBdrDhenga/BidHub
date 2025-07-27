import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";


import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import Admin from "./admin/Admin"
import AdminHeader from "./admin/components/Header";
import AdminFooter from "./admin/components/Footer";
import AdminLogin from "./admin/pages/Login"
import AdminDashboard from "./admin/Admin";

import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Dashboard from "./pages/Dashboard";
import SingleAuctionDetail from "./pages/SingleAuctionDetail";
import ErrorPage from "./pages/ErrorPage";


import Protected, { PublicRoute, SellerRoutes, AdminRoutes } from "./auth/Protected";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetNewPassword from "./pages/auth/ResetNewPassword";


import UserProfile from "./pages/UserProfile";
import UploadItem from "./pages/UploadItem";
import EditAuction from "./pages/EditAuction";
import ManageItems from "./components/ManageItems";
import PaymentSuccess from "./pages/PaymentSuccess";
import authService from "./store/auth/authService";


const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  console.log("LoggedIn User is: ", user);

  useEffect (() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        console.log("Current User response: ", response);
        if (response.data && response.data.data.user) {
          dispatch (setUser(response.data.data.user)); // update your redux store
        }
      } catch (error) {
        console.log("Error fetching current user.", error.response ? error.response.data : error.message);
      }
    };
    fetchCurrentUser();
  }, [dispatch])

  return (
    <>
      <BrowserRouter>
          
          {user && user.userType === "admin" ? <AdminHeader /> : <Header />}
  
          <Routes>

            <Route path = "/admin/login" element = { <AdminLogin /> } />


            <Route path = "/" element = { <Home /> } />
            <Route path = "/home" element = { <Home/> } />
            <Route path = "/contact-us" element = { <ContactUs/> } />
            <Route path = "/about-us" element = { <AboutUs /> } />
            <Route path = "/privacy-policy" element = { <PrivacyPolicy/> } />
            <Route path = "/dashboard" element = { <Dashboard/> } />
            <Route path = "/single-auction-detail/:id" element = { <SingleAuctionDetail/> } />
            <Route path = "*" element = { <ErrorPage/> } />
          
                        
            <Route element = {<PublicRoute />}>
              <Route path = "/reset-password/:id/:token" element = { <ResetNewPassword /> } />
              <Route path = "/forgot-password" element = { <ForgotPassword /> } />
              <Route path = "/login" element = { <Login /> } />
              <Route path = "/register" element =  {<Register /> } />
            </Route>
           
            
            
            <Route element = {<Protected />}>
              <Route path = "/user-profile/*" element = { <UserProfile /> } />
              <Route path = "/edit-auction/:id" element = { <EditAuction />} />
              <Route path = "/success/:id" element = { <PaymentSuccess />} />

              <Route element={<SellerRoutes />}>
                <Route path = "/create-auction" element = { <UploadItem/> } />
              </Route>

            </Route> 

            
            {/* <Route element={<AdminRoutes />}> */}
              <Route path = "/admin/*" element = {<AdminDashboard />} />
            {/* </Route> */}
            


            
          </Routes>
      

          {user && user.userType === "admin" ? <AdminFooter />: <Footer /> }
      
      </BrowserRouter>
      <ToastContainer/>
    </>
  );
};

export default App;
