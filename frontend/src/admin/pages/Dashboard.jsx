import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileComponent from "../components/ProfileComponent";
import AllUsers from "../components/AllUsers";
import EditUser from "../components/EditUser";
import AllAuctions from "../components/AllAuctions";
import EditAuction from "../components/EditAuction";

import NavSidebar from "../components/NavSidebar";

import ErrorPage from "./ErrorPage";
import AllCategories from "../components/AllCategories";
import EditCategory from "../components/EditCategory";
import CreateCategory from "../components/CreateCategory";
import SingleAuctionDetail from "../../pages/SingleAuctionDetail"

const Dashboard = () => {
    const navigate = useNavigate();
        
    return (    
        
        <div className = " ">
            <div className = "text-white flex items-center justify-center flex-col h-[280px] bg-hero-img bg-cover">
                <h1 className = "text-center font-bold text-3xl"> Admin Profile </h1>
                <div className = "flex gap-2 font-medium pt-2">
                    <Link
                        to = "/"
                        className = " no-underline hover:text-theme-color transition-all"
                    >
                        Home
                    </Link>
                    <span>/</span>
                    <span className = "text-theme-color"> Dashboard </span>
                </div>
            </div>

            <div className = "flex gap-4 px-5 py-10 flex-wrap lg:flex-nowrap">
                <Sidebar />

                <div className = " w-full overflow-hidden">
                    <Routes>
                        {/* <Route path = "/dashboard" element = { <ProfileComponent /> }></Route> */}
                        {/* <Route path = "/" element = { <ProfileComponent /> }></Route> */}
                        <Route path = "/users/*" element = {<AllUsers />} />
                        <Route path = "/users/profile/:id" element = {<ProfileComponent />} />
                        <Route path = "/users/edit/:id" element = {<EditUser />} />
                        <Route path = "/auctions/*" element = {<AllAuctions />} />
                        <Route path = "/auctions/edit/:id" element = {<EditAuction />} />
                        <Route path = "/auctions/view/:id" element = {<SingleAuctionDetail noPadding />} />
                        <Route path = "/categories/*" element = {<AllCategories />} />
                        <Route path = "/categories/edit/:id" element = {<EditCategory />} />
                        <Route path = "/categories/create-category" element = {<CreateCategory />} />

                        {/* <Route path="/profile" element = {<ProfileComponent />} />

                        <Route path = "/logout" element = {<ChangePassword />} />
                          */}
                        <Route path = "*" element = {<ErrorPage />} />
                    </Routes>
                </div>
            </div>
            {/* <button
                className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
                onClick={() => navigate("/home")} // Navigate to home page
                >
                    Go back to HomePage
            </button>
         */}
        </div>
    );
};

export default Dashboard;