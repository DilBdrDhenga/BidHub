import React from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import ProfileComponent from "../components/ProfileComponent";
import BidsItem from "../components/BidsItem";
import Notifications from "../components/Notifications";
import AccountSetting from "../components/AccountSetting";
import ChangePassword from "./auth/ChangePassword";
import PaymentMethod from "../components/PaymentMethod";
import Cart from "../components/Cart";
import { SellerRoutes } from "../auth/Protected";
import ManageItems from "../components/ManageItems";

import ErrorPage from "./ErrorPage";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please try again later.</h1>;
        }
        return this.props.children;
    }
}

const UserProfile = () => {
    const navigate = useNavigate();

    return (
        <div className = "">
            <div className = "text-white flex items-center justify-center flex-col h-[280px] bg-hero-img bg-cover">
                <h1 className = "text-center font-bold text-3xl"> Profile </h1>
                <div className = "flex gap-2 font-medium pt-2">
                    <Link
                        to = "/"
                        className = " no-underline hover:text-theme-color transition-all"
                    >
                        Home
                    </Link>
                    <span>/</span>
                    <span className = "text-theme-color"> Profile </span>
                </div>
            </div>

            <div className = "flex gap-4 px-5 py-10 flex-wrap lg:flex-nowrap ">
                <Sidebar />
                <ErrorBoundary>
                    <Routes>
                        <Route path = "/profile" element = { <ProfileComponent /> } />
                        <Route element = { <SellerRoutes/> }>
                            <Route path = "/manage-items" element = { <ManageItems/> } />
                        </Route>

                        <Route path = "/bids-items" element = { <BidsItem /> } />
                        <Route path = "/notifications" element = { <Notifications />}  />
                        <Route path = "/account-settings" element = { <AccountSetting /> } />
                        <Route path = "/change-password" element = { <ChangePassword /> } />
                        <Route path = "/payment-method" element = { <PaymentMethod/> } />
                        <Route path = "/cart" element = { <Cart/> } />
                            
                      
                        <Route path = "/logout" element = { <ChangePassword/> } />
                        <Route path = "*" element = {<ErrorPage /> } />
                    </Routes>
                </ErrorBoundary>
            </div>
            <button
                className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
                onClick={() => navigate("/dashboard")} // Navigate to dashboard page
            >
                Go back to Dashboard
            </button>
        </div>
    );
};

export default UserProfile;
