// import { useEffect, useRef, useState } from "react";

// import { useSelector, useDispatch } from "react-redux";
// import { getCurrentUser, reset, updateProfile } from "../store/auth/authSlice";
// import Loading from "./Loading";
// import { toast } from "react-toastify";

// const AccountSetting = () => {
//     const { user, isLoading, isSuccess, isError, message } = useSelector(
//         (state) => state.auth
//     );
//     //console.log(user, "user.......");
//     const [formData, setFormData] = useState({
//         fullName: user?.fullName || "",
//         email: user?.email,
//         gender: user?.gender || "",
//         address: user?.address || "",
//         city: user?.city || "",
//         userType: user?.userType || "",
//         description: user?.description || "",
//         phone: user?.phone || "",
//     });
//     const dispatch = useDispatch();
//     useEffect(() => {
//         //console.log("useEffect........");
//         dispatch(getCurrentUser());
//     }, []);
//     useEffect(() => {}, [user]);

//     const [imgUrl, setImgUrl] = useState(user?.profilePicture);
//     const imgRef = useRef(null);
//     //console.log(imgUrl, "imgUrl......");
//     //console.log(user?.profilePicture, "user?.profilePicture........");

//     const handleFormSubmit = (e) => {
//         dispatch(reset());
//         e.preventDefault();
//         //console.log(imgUrl, "imgUrl");
//         //image data so use new formdata
//         const data = new FormData();
//         //console.log(formData);

//         data.append("fullName", formData.fullName);
//         data.append("email", formData.email);
//         data.append("gender", formData.gender);
//         data.append("address", formData.address);
//         data.append("city", formData.city);
//         data.append("userType", formData.userType);
//         data.append("description", formData.description);
//         data.append("phone", formData.phone);
//         if (imgRef.current.files[0]) {
//         data.append("profilePicture", imgRef.current.files[0]);
//         } else {
//         data.append("profilePicture", imgUrl);
//         }
//         //console.log(imgUrl);
//         dispatch(updateProfile(data)).then(() => {
//         if (isSuccess) {
//             toast.success(message || "user profile updated successfully.", {
//             autoClose: 500,
//             });
//         }
//         if (isError) {
//             toast.error(message, {
//             autoClose: 500,
//             });
//         }
//         });
//         setImgUrl(null);
//         dispatch(getCurrentUser());

//         dispatch(reset());
//     };

//     return (
//         <div className=" px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl ">
//             <h2 className=" text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
//                 Account Settings
//             </h2>

//             <form onSubmit={handleFormSubmit}>
//                 <div
//                 className="relative overflow-hidden w-fit h-fit rounded-lg cursor-pointer mb-10"
//                 onClick={() => imgRef.current.click()}
//                 >
//                     <img
//                         src={imgUrl ? imgUrl : user?.profilePicture}
//                         alt="upload img"
//                         className="w-full md:w-[200px] object-contain"
//                     />
//                     <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
//                         <p className="text-white font-bold ">Change Profile Picture</p>
//                     </div>
//                 </div>

//                 {/* INPUTS*/}
//                 <div className="flex flex-col gap-4 inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 [&_input[type=submit]]:bg-theme-color [&_input:hover[type=submit]]:bg-color-danger inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color  [&_*]:transition-all ">
//                     <input
//                         type="file"
//                         className="hidden"
//                         onChange={(e) => setImgUrl(URL.createObjectURL(e.target.files[0]))}
//                         ref={imgRef}
//                     />
//                     <div className="grid lg:grid-cols-3 gap-4">
//                         <input
//                         type="text"
//                         placeholder="FullName "
//                         value={formData.fullName}
//                         name="fullName"
//                         required
//                         onChange={(e) =>
//                             setFormData({ ...formData, fullName: e.target.value })
//                         }
//                         />
//                         <input
//                         required
//                         type="email"
//                         placeholder="Email"
//                         value={formData.email}
//                         name="email"
//                         onChange={(e) =>
//                             setFormData({ ...formData, email: e.target.value })
//                         }
//                         />{" "}
//                         {/* {select field} */}
//                         <select
//                         className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color"
//                         value={formData.gender}
//                         name="gender"
//                         onChange={(e) =>
//                             setFormData({ ...formData, gender: e.target.value })
//                         }
//                         >
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         </select>
//                     </div>

//                     <div className="grid lg:grid-cols-2 gap-4">
//                         <input
//                         type="text"
//                         placeholder="Address"
//                         value={formData.address}
//                         name="address"
//                         onChange={(e) =>
//                             setFormData({ ...formData, address: e.target.value })
//                         }
//                         />
//                         <input
//                         type="text"
//                         placeholder="City"
//                         value={formData.city}
//                         name="city"
//                         onChange={(e) =>
//                             setFormData({ ...formData, city: e.target.value })
//                         }
//                         />
//                     </div>
                    
//                     <input
//                         type="number"
//                         placeholder="Phone Number"
//                         value={formData.phone}
//                         name="phone"
//                         onChange={(e) =>
//                         setFormData({ ...formData, phone: e.target.value })
//                         }
//                     />
//                     <select
//                         className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color "
//                         value={formData.userType}
//                         name="userType"
//                         onChange={(e) =>
//                         setFormData({ ...formData, userType: e.target.value })
//                         }
//                     >
//                         <option value="user">User</option>
//                         <option value="seller">Seller</option>
//                     </select>
//                     <textarea
//                         className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
//                         cols="30"
//                         rows="10"
//                         placeholder="Description"
//                         value={formData.description}
//                         name="description"
//                         onChange={(e) =>
//                         setFormData({ ...formData, description: e.target.value })
//                         }
//                     ></textarea>{" "}
//                     <input
//                         className="text-white cursor-pointer font-bold tracking-wide"
//                         type="submit"
//                         value={`${isLoading ? "Loaign" : "Update"}`}
//                     />
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AccountSetting;





import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser , reset, updateProfile } from "../store/auth/authSlice";
import Loading from "./Loading";
import { toast } from "react-toastify";

const AccountSetting = () => {
    const { user, isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.auth
    );

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email,
        gender: user?.gender || "",
        address: user?.address || "",
        city: user?.city || "",
        userType: user?.userType || "",
        description: user?.description || "",
        phone: user?.phone || "",
        location: user?.location || "", // Add location field
    });

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getCurrentUser ());
    }, [dispatch]);

    const [imgUrl, setImgUrl] = useState(user?.profilePicture);
    const imgRef = useRef(null);

    // Function to fetch current location
    const fetchCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Call the geocoding API to get the location name
                    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=68b2dfe2cc734004874e11fab655462f`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.results && data.results.length > 0) {
                                const location = data.results[0].formatted; // Get the formatted address
                                setFormData((prevData) => ({
                                    ...prevData,
                                    location: location, // Set the location in formData
                                }));
                            }
                        })
                        .catch(error => console.error("Error fetching location:", error));
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    const handleFormSubmit = (e) => {
        dispatch(reset());
        e.preventDefault();
        const data = new FormData();

        data.append("fullName", formData.fullName);
        data.append("email", formData.email);
        data.append("gender", formData.gender);
        data.append("address", formData.address);
        data.append("city", formData.city);
        data.append("userType", formData.userType);
        data.append("description", formData.description);
        data.append("phone", formData.phone);
        data.append("location", formData.location); // Include location in the data

        if (imgRef.current.files[0]) {
            data.append("profilePicture", imgRef.current.files[0]);
        } else {
            data.append("profilePicture", imgUrl);
        }

        dispatch(updateProfile(data)).then(() => {
            if (isSuccess) {
                toast.success(message || "User  profile updated successfully.", {
                    autoClose: 500,
                });
            }
            if (isError) {
                toast.error(message, {
                    autoClose: 500,
                });
            }
        });

        setImgUrl(null);
        dispatch(getCurrentUser ());
        dispatch(reset());
    };

    return (
        <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl ">
            <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
                Account Settings
            </h2>

            <form onSubmit={handleFormSubmit}>
                <div
                    className="relative overflow-hidden w-fit h-fit rounded-lg cursor-pointer mb-10"
                    onClick={() => imgRef.current.click()}
                >
                    <img
                        src={imgUrl ? imgUrl : user?.profilePicture}
                        alt="upload img"
                        className="w-full md:w-[200px] object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center opacity- 0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold ">Change Profile Picture</p>
                    </div>
                </div>

                {/* INPUTS*/}
                <div className="flex flex-col gap-4 inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 [&_input[type=submit]]:bg-theme-color [&_input:hover[type=submit]]:bg-color-danger inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color  [&_*]:transition-all ">
                    <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setImgUrl(URL.createObjectURL(e.target.files[0]))}
                        ref={imgRef}
                    />
                    <div className="grid lg:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.fullName}
                            name="fullName"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, fullName: e.target.value })
                            }
                        />
                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            name="email"
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                        <select
                            className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color"
                            value={formData.gender}
                            name="gender"
                            onChange={(e) =>
                                setFormData({ ...formData, gender: e.target.value })
                            }
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
{/* 
                    <div className="grid lg:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Address"
                            value={formData.address}
                            name="address"
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            name="city"
                            onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                            }
                        />
                    </div> */}
                    
                    <input
                        type="number"
                        placeholder="Phone Number"
                        value={formData.phone}
                        name="phone"
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                    />
                    <select
                        className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color"
                        value={formData.userType}
                        name="userType"
                        onChange={(e) =>
                            setFormData({ ...formData, userType: e.target.value })
                        }
                    >
                        <option value="user">User </option>
                        <option value="seller">Seller</option>
                    </select>
                    <textarea
                        className="outline-none bg-theme-bg2 rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
                        cols="30"
                        rows="10"
                        placeholder="Description"
                        value={formData.description}
                        name="description"
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                    ></textarea>
                    <div className="flex items-center">

                    <input
                        type="text"
                        placeholder="Location"
                        value={formData.location}
                        name="location"
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                        className="flex-grow outline-none bg-theme-bg2 rounded-xl px-3 py-4 h-12"

                    />
                    <button
                        type="button"
                        onClick={fetchCurrentLocation}
                        className="ml-2 bg-theme-color text-white rounded-xl px-4 py-2"
                    >
                        Use Current Location
                    </button>


                    </div>
                    
                    <input
                        className="text-white cursor-pointer font-bold tracking-wide"
                        type="submit"
                        value={`${isLoading ? "Loading" : "Update"}`}
                    />
                </div>
            </form>
        </div>
    );
};

export default AccountSetting;