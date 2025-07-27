import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector} from "react-redux";


const useAuth = () => {
  const token = Cookies.get("JwtToken");
  const user = JSON.parse(localStorage.getItem("user"));

  // console.log("Token:", token); // Log the token
  // console.log("User:", user); // Log the user

  if(!token){
    localStorage.removeItem("user");
    return null;
  }
  //console.log(user, "user,,,,,,,,,,,");
  // return auth status based on both token and user
  return { token, user };
};


const PublicRoute = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......public....");

  useEffect(() => {
    if (auth) {
      navigate("/dashboard");
    }
  }, [auth, navigate]);

  return auth ? null : <Outlet />;
};


const AdminPublicRoute = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......public....");

  useEffect(() => {
    if (auth) {
      navigate("/admin/users");
    }
  }, [auth, navigate]);

  return auth ? null : <Outlet />;
};


const Protected = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  console.log(auth, "auth status in Protected"); // Debugging log

  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return auth ? <Outlet /> : null;
};


const AdminProtected = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  console.log(auth, "auth status is in Protected"); // Log the auth status
    
  useEffect(() => {
    if (!auth) {
      navigate("/admin/login");
    }
  }, [auth, navigate]);
  // if (!auth) {
  //   return <div>Loading...</div>; // Show a loading state or similar
  // }

  return auth ? <Outlet /> : null;
};


const SellerRoutes = () => {
  const { user } = useSelector((state) => state.auth);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User:", user); // Log user state
    console.log("Auth status:", auth); // Log auth status
    console.log("User Type:", user?.userType); // Log user type
      
    if (auth && user.userType !== "seller") {
      navigate("/dashboard");
    }
  }, [auth, user, navigate]);
  return auth && user.userType === "seller" ? <Outlet /> : null;
}


const AdminRoutes = () => {
  const { user } = useSelector((state) =>  state.auth);
    const auth = useAuth();
    const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,seller routes,,,...........");
  if (auth && user.userType !== "admin") {
    navigate("/dashboard");
  }
    useEffect(() => {
      if (auth && user.userType !== "admin") {
        navigate("/dashboard");
      }
    }, [auth, navigate]);
    return auth && user.userType === "admin" ? <Outlet /> : null;
  }


export { PublicRoute, SellerRoutes, AdminRoutes, AdminProtected, AdminPublicRoute};
export default Protected;
