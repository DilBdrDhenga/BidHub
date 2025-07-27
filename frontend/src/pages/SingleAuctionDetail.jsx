
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSingleAuctionById, reset } from "../store/auction/auctionSlice";
import CountDownTimer from "../components/CountDownTimer";
import BidCard from "../components/BidCard";
import { placeABid } from "../store/bid/bidSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendNewBidNotification } from "../store/notification/notificationSlice";
import socket from "../socket";
import { getAllBidsForAuction } from "../store/bid/bidSlice";
import Loading from "../components/Loading";
import LiveHome from "../components/home/LiveHome";

const SingleAuctionDetail = ({ noPadding }) => {
  const [newBidAmount, setNewBidAmount] = useState("");
  const logInUser = JSON.parse(localStorage.getItem("user"));
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("description");
  const params = useParams();
  const dispatch = useDispatch();
  const { singleAuction } = useSelector((state) => state.auction);
  const { bids } = useSelector((state) => state.bid);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [singleAuctionData, setSingleAuctionData] = useState({
    startingPrice: 0,
  });
  //console.log((singleAuctionData, "singleAuctionData............"));
  const [auctionWinnerDetailData, setAuctionWinnerDetailData] = useState();
  const [bidsData, setBidsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedArrayBidsData = [];
  let getFetchedArrayBidsData = []

   // Handle receiving auction winner notification from backend (real-time)
   useEffect(() => {
    socket.on("auction_winner_notification", (notification) => {
      // You can display a toast or update UI based on this notification
      toast.success(notification.message);
      setAuctionWinnerDetailData(notification);
    });

    return () => {
      socket.off("auction_winner_notification"); // Clean up the event listener when component unmounts
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const auctionStartTime = new Date(singleAuction?.startTime).getTime();
      const auctionEndTime = new Date(singleAuction?.endTime).getTime();

      if (
        currentTime >= auctionStartTime &&
        currentTime <= auctionEndTime &&
        !auctionStarted
      ) {
        setAuctionStarted(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [singleAuction?.startTime]);

  socket.on("winnerSelected", async (data) => {
    setAuctionStarted(false);

    setAuctionWinnerDetailData(data);
    
  });

  const handleWinner = () => {
    socket.emit("selectWinner", params?.id);
  };

  //console.log(params.id);
  //console.log(singleAuction);
  //console.log(isLoading);

  // useEffect(() => {
  //   setIsLoading(true);

  //   console.log("hello")
  //   Promise.all([dispatch(getSingleAuctionById(params?.id))]).then((prevBids) => {
  //     fetchedArrayBidsData.push(...prevBids);
  //     getFetchedArrayBidsData = fetchedArrayBidsData[0].payload.data.bids;

  //     setIsLoading(false);
  //   });
  //   dispatch(getAllBidsForAuction(params?.id));
  // }, [params?.id]);
  // // Function to render bids using a loop
  // const renderBids = () => {
  //   // Sort bids in descending order by amount
  //   const sortedBids = [...bidsData].sort((a, b) => b.amount - a.amount); // Assuming 'amount' is a number

  //   const bidElements = []; // Array to hold bid elements

  //   for (let i = 0; i < sortedBids.length; i++) {
  //     const bid = sortedBids[i];
  //     bidElements.push(
  //       <BidCard key={bid._id} bid={bid} /> // Create BidCard for each bid
  //     );
  //   }

  //   return bidElements; // Return the array of bid elements
  // };






  useEffect(() => {
    setIsLoading(true);

    console.log("Fetching bids...");
    Promise.all([dispatch(getSingleAuctionById(params?.id))]).then((prevBids) => {
      const fetchedArrayBidsData = prevBids[0].payload.data.bids; // Get the bids from the fetched data
      setBidsData(fetchedArrayBidsData); // Store the fetched bids in state
      setIsLoading(false);
    });

    dispatch(getAllBidsForAuction(params?.id));
  }, [params?.id, dispatch]);
  // Function to render bids using a loop
  const renderBids = () => {
    // Sort bids in descending order by amount
    const sortedBids = [...bidsData].sort((a, b) => b.bidAmount - a.bidAmount); // Assuming 'amount' is a number

    return sortedBids.map((bid) => (
      <BidCard key={bid._id} bid={bid} /> // Create BidCard for each bid
    ));
  }








  //console.log("useEffect is running.new new....");
  socket.on("newBidData", async (data) => {
    //console.log(data, "newBidData,,,,,,,,,,,,,,,,,io,,,,,,io");
    setBidsData([
      {
        _id: new Date().getTime(),
        bidder: {
          fullName: data.fullName,
          profilePicture: data.profilePicture,
        },
        bidAmount: data.bidAmount,
        bidTime: data.bidTime,
        auction: data.auctionId,
      },
      ...(Array.isArray(bidsData) ? bidsData : []),
    ]);

    
    setSingleAuctionData((prevState) => ({
      ...prevState,
      startingPrice: data.bidAmount,
    }));
    
    // handleNewBid()
  }); 
  useEffect(() => {
    console.log("bidsData", bidsData);
    //console.log("useEffect is running.new new bidsdata bidsdata bidsdata....");
  }, [bidsData]);

  useEffect(() => {
    setBidsData(bids);
    setSingleAuctionData(singleAuction);
  }, [bids, singleAuction]);

  useEffect(() => {
    socket.on("connect", () => {
      //console.log(`Client connected with the id: ${socket.id}`);
    });
    socket.emit("joinAuction", logInUser?._id);
    socket.on("newUserJoined", (data) => {
      
    });
  }, []);

  const placeBidHandle = async (e) => {
    e.preventDefault();
    //console.log((singleAuctionData, "singleAuctionData............"));
    if (user?.paymentVerified === false) {
      toast.info(
        "Please verify your payment method to place a bid. Go to settings..."
      );
    }
    let bidData = {
      id: params.id,
      amount: Math.floor(newBidAmount),
    };
    if (Math.floor(newBidAmount) <= singleAuctionData?.startingPrice) {
      toast.info("Bid amount should be greater than the currnt bid");
      //console.log(new Date().getTime() / 1000 + " seconds");
    } else if (singleAuction?.endTime < new Date().getTime() / 1000) {
      toast.info("Auction time is over");
    } else {
      dispatch(placeABid(bidData));
      setNewBidAmount("");
      // setSingleAuctionData(newBidAmount);

      socket.emit("newBid", {
        profilePicture: logInUser?.profilePicture,
        fullName: logInUser?.fullName,
        bidAmount: Math.floor(newBidAmount),
        bidTime: new Date().getTime(),
        auctionId: params.id,
      });

      await socket.emit("sendNewBidNotification", {
        auctionId: params.id,
        type: "BID_PLACED",
        newBidAmount: newBidAmount,
        fullName: logInUser?.fullName,
        id: logInUser?._id,
      });
      setActiveTab("bids");
      dispatch(
        sendNewBidNotification({
          auctionId: params.id,
          type: "BID_PLACED",
          newBidAmount: newBidAmount,
        })
      );
    }
  };
  if (isLoading) {
    return <Loading />;
  }

  // Rest of your code

  return (
    <>
      <div
        className={`flex place-content-between  py-10 px-5 lg:py-20  lg:px-10  items-start gap-7 flex-wrap md:flex-nowrap ${noPadding ? "lg:py-0 px-0" : "p-4"}`}
        id="item01"
      >
        <img
          className=" rounded-xl  md:max-w-[45%]  w-full "
          src={singleAuction?.image}
          alt="product image"
        />
        <div className="w-full flex gap-4 flex-col ">
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              {singleAuction?.name}
            </h2>

            <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.category?.name}
              </a>
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.location?.name}
              </a>
            </div>

            {/* border */}
          </div>

          <div className="pt-4 border-t border-border-info-color">
            {/* Creator */}
            <div className="flex gap-8">
              <div id="author-item" className="text-heading-color">
                <span className="font-medium capitalize  ">Seller</span>
                <div id="author-info" className="flex items-center gap-2 pt-2">
                  <img
                    src={singleAuction?.seller?.profilePicture}
                    alt="avatar"
                    className="w-[45px] rounded-full"
                  />
                  <a href="#" className="font-medium ">
                    {singleAuction?.seller?.fullName}
                  </a>
                </div>
              </div>
            </div>
            {/* TABS buttons */}
            <div className="flex gap-4 pt-4 font-bold text-white ">
              <button
                className={`px-5 py-2 rounded-xl   ${
                  activeTab === "description"
                    ? "bg-color-primary"
                    : "bg-theme-bg2 text-body-text-color"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Details
              </button>
              <button
                className={`px-5 py-2 rounded-xl   ${
                  activeTab === "bids"
                    ? "bg-color-primary"
                    : "bg-theme-bg2 text-body-text-color"
                }`}
                onClick={() => setActiveTab("bids")}
              >
                Bids
              </button>
            </div>
          </div>
          <div>
            {/* Description */}
            <div
              id="description"
              className={`pt-4 border-t border-border-info-color ${
                activeTab === "description" ? "block" : "hidden"
              }`}
            >
              <h3 className="text-heading-color font-medium">Description</h3>
              <p className="text-body-text-color">
                {singleAuction?.description}
              </p>
            </div>




            {/* Bids */}
            <div 
            id="bids" 
            className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto 
            ${ activeTab === "bids" ? "block" : "hidden" } no-scrollbar`} 
            >
              {/* Check if there are any bids */}
              {isLoading ? (
                <p>Loading...</p> // Show loading state
              ) : ( 
                (singleAuction?.bids?.length > 0 || bidsData.length > 0) ? 
                renderBids() : ( // Call renderBids to display sorted bids
                  <h1 className="text-white">No bids yet</h1>
                )
              )}
            </div>
          </div>




          <div className="text-heading-color capitalize"></div>

          {/* countdown timer */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">
                  {" "}
                  {singleAuction?.bids?.length > 0
                    ? "Current Bid"
                    : "Starting Price"}
                </h3>
                <p className="text-body-text-color">
                  ${singleAuctionData?.startingPrice}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">Time </h3>
                <div className="text-body-text-color">
                  <CountDownTimer
                    startTime={singleAuction?.startTime}
                    endTime={singleAuction?.endTime}
                    id={singleAuction?._id}
                    Winner={handleWinner}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* // detail about current bid and timer  */}
          <div className=" flex flex-col gap-4 pt-4 border-t border-border-info-color ">
            {singleAuction?.status === "over" || auctionWinnerDetailData ? (
              bidsData.length > 0 ? (
                <>
                  <div>
                    <h1 className="font-bold text-white">Winner</h1>
                    <div className="flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full">
                      <div className="flex gap-4 items-center text-white">
                        <img
                          src={
                            auctionWinnerDetailData?.bidder?.profilePicture ||
                            singleAuction?.winner?.bidder?.profilePicture 
                          }
                          alt="bidder profilePicture"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {auctionWinnerDetailData?.bidder?.fullName ||
                              singleAuction?.winner?.bidder?.fullName}
                          </span>
                          <span className="text-xs text-body-text-color">
                            {new Date(
                              auctionWinnerDetailData?.bidTime ||
                                singleAuction?.winner?.bidTime
                            ).toLocaleDateString()}{" "}
                            {""}
                            {`${new Date(
                              auctionWinnerDetailData?.bidTime ||
                                singleAuction?.winner?.bidTime
                            ).toLocaleTimeString()}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-white">
                        Bid Amount : $
                        {auctionWinnerDetailData?.bidAmount ||
                          singleAuction?.winner?.bidAmount}
                      </div>
                    </div>{" "}
                  </div>
                </>
              ) : (
                <h1 className="text-white">No bids</h1>
              )
            ) : (
              auctionStarted && (
                <form
                  className="flex justify-between flex-wrap gap-4 items-center"
                  onSubmit={placeBidHandle}
                >
                  {/* input button for bid */}
                  <input
                    type="number"
                    className="outline-none text-slate-300 px-3 py-4 rounded-xl bg-theme-bg2 border border-border-info-color focus:border-theme-color transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter your bid"
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(e.target.value)}
                    required
                  /> 
                  {logInUser ? (
                         <button
                         type="submit"
                         disabled={
                           singleAuction?.seller?._id === logInUser?._id
                             ? true
                             : false || !auctionStarted
                         }
                         className={`bg-color-primary py-2 px-4 rounded-lg  text-white ${
                           singleAuction?.seller?._id === logInUser?._id
                             ? "bg-theme-bg2 text-body-text-color cursor-not-allowed border border-border-info-color hover:border-color-danger"
                             : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger"
                         } ${
                           !auctionStarted
                             ? "bg-theme-bg2 text-body-text-color "
                             : "bg-color-primary "
                         } `}
                       >
                         Place Bid
                       </button>
                  ) : (
                    <Link 
                      to = "/login"
                      className = "bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
                      >
                        Place Bid
                      </Link>
                  )
                  
                }
                  
                </form>
              )
            )}
          </div>
        </div>
      </div>
      {/* <div className="mx-8">
        <LiveHome></LiveHome>
      </div> */}
    </>
  );
};

export default SingleAuctionDetail;



// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { getSingleAuctionById, reset } from "../store/auction/auctionSlice";
// import CountDownTimer from "../components/CountDownTimer";
// import BidCard from "../components/BidCard";
// import { placeABid } from "../store/bid/bidSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { sendNewBidNotification } from "../store/notification/notificationSlice";
// import socket from "../socket";
// import { getAllBidsForAuction } from "../store/bid/bidSlice";
// import Loading from "../components/Loading";
// import LiveHome from "../components/home/LiveHome";

// const SingleAuctionDetail = ({ noPadding }) => {
//   const [newBidAmount, setNewBidAmount] = useState("");
//   const logInUser = JSON.parse(localStorage.getItem("user"));
//   const { user } = useSelector((state) => state.auth);
//   const [activeTab, setActiveTab] = useState("description");
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { singleAuction } = useSelector((state) => state.auction);
//   const { bids } = useSelector((state) => state.bid);
//   const [auctionStarted, setAuctionStarted] = useState(false);
//   const [singleAuctionData, setSingleAuctionData] = useState();
//   //console.log((singleAuctionData, "singleAuctionData............"));
//   const [auctionWinnerDetailData, setAuctionWinnerDetailData] = useState();
//   const [bidsData, setBidsData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const [auctionStatus, setAuctionStatus] = useState('Upcoming')  //default

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentTime = new Date().getTime();
//       const auctionStartTime = new Date(singleAuction?.startTime).getTime();
//       const auctionEndTime = new Date(singleAuction?.endTime).getTime();
                          
//       if (
//         currentTime >= auctionStartTime &&
//         currentTime <= auctionEndTime &&
//         !auctionStarted
//       ) {
//         if (!auctionStarted) {
//           setAuctionStarted(true);
//           setAuctionStatus('Live');   // set status to Live
//         }
//       } else if ( currentTime < auctionStartTime ) {
//         setAuctionStatus('Upcoming'); // set status to Upcoming
//       } else if ( currentTime > auctionEndTime ) {
//         setAuctionStatus('Over');   // Set status to Over
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [singleAuction?.startTime, auctionStatus, auctionStarted]);


//   socket.on("winnerSelected", async (data) => {
//     setAuctionStarted(false);
//     setAuctionWinnerDetailData(data);
//     setAuctionStatus('Over');
//   });
//   const handleWinner = () => {
//     socket.emit("selectWinner", params?.id);
//   };

//   //console.log(params.id);
//   //console.log(singleAuction);
//   //console.log(isLoading);

//   // initialization of 'singleAuctionData
//   useEffect(() => {
//     setIsLoading(true);
//     Promise.all([dispatch(getSingleAuctionById(params?.id)), dispatch(getAllBidsForAuction(params?.id))]).then(() => {
//         setIsLoading(false);
//         setSingleAuctionData(singleAuction); // Initialize singleAuctionData with fetched auction data
//     });
//   }, [params?.id]);
//   console.log(singleAuction, "Fetched Auction Data");
//   //console.log("useEffect is running.new new....");

//   // socket listener for new bids
//   socket.on("newBidData", async (data) => {
//     setBidsData((prevBids) => [
//         {
//             _id: new Date().getTime(),
//             bidder: {
//                 fullName: data.fullName,
//                 profilePicture: data.profilePicture,
//             },
//             bidAmount: data.bidAmount,
//             bidTime: data.bidTime,
//             auction: data.auctionId,
//         },
//         ...prevBids,
//     ]);

//     // Update currentHighestBid
//     setSingleAuctionData((prevState) => ({
//         ...prevState,
//         currentHighestBid: Math.max(prevState.currentHighestBid || 0, data.bidAmount), // Ensure the highest bid is updated
//     }));
//   });


  
//   useEffect(() => {
//     //console.log("useEffect is running.new new bidsdata bidsdata bidsdata....");
//   }, [bidsData]);


//   useEffect(() => {
//     setBidsData(Array.isArray(bids) ? bids : []); // Ensure bidsData is always an array
//     setSingleAuctionData(singleAuction);
//   }, [bids, singleAuction]);




//   useEffect(() => {
//     socket.on("connect", () => {
//       //console.log(`Client connected with the id: ${socket.id}`);
//     });
//     socket.emit("joinAuction", logInUser?._id);
//     socket.on("newUserJoined", (data) => {
      
//     });
//   }, []);


//   const placeBidHandle = async (e) => {
//     e.preventDefault();

//     if (user?.paymentVerified === false) {
//         toast.info("Please verify your payment method to place a bid. Go to settings...");
//         return;
//     }

//     const bidAmount = Math.floor(newBidAmount);
//     if (bidAmount <= (singleAuctionData?.currentHighestBid || 0)) {
//         toast.info("Bid amount should be greater than the current highest bid");
//         return;
//     } else if (singleAuction?.endTime < new Date().getTime() / 1000) {
//         toast.info("Auction time is over");
//         return;
//     }

//     // Create bid data
//     const bidData = {
//         id: params.id,
//         amount: bidAmount,
//     };

//     try {
//         // Dispatch the action to place a bid
//         const response = await dispatch(placeABid(bidData)); // Await the dispatch if it's a promise

//         if (response.payload) {
//             // Update the local state
//             setSingleAuctionData((prevData) => ({
//                 ...prevData,
//                 currentHighestBid: bidAmount, // Update to new highest bid
//                 bids: [
//                     ...prevData.bids,
//                     {
//                         _id: response.payload._id,
//                         bidder: { 
//                             fullName: user.fullName, 
//                             profilePicture: user.profilePicture 
//                         },
//                         bidAmount: bidAmount,
//                         bidTime: new Date().getTime(),
//                     },
//                 ],
//             }));

//             // Clear input field
//             setNewBidAmount("");

//             // Emit new bid through socket
//             socket.emit("newBidData", {
//                 profilePicture: logInUser ?.profilePicture,
//                 fullName: logInUser ?.fullName,
//                 bidAmount: bidAmount,
//                 bidTime: new Date().getTime(),
//                 auctionId: params.id,
//             });

//             await socket.emit("sendNewBidNotification", {
//                 auctionId: params.id,
//                 type: "BID_PLACED",
//                 newBidAmount: bidAmount,
//                 fullName: logInUser ?.fullName,
//                 id: logInUser ?._id,
//             });
//             setActiveTab("bids");
//             dispatch(
//               sendNewBidNotification({
//                 auctionId: params.id,
//                 type: "BID_PLACED",
//                 newBidAmount: newBidAmount,
//               })
//             )
//             // Show success toast
//             toast.success("Bid placed successfully!");  // Add this line for success notification
   
//         }
//     } catch (error) {
//         toast.error("Failed to place bid: " + error.message);
//     }
//   };

//   if (isLoading) {
//     return <Loading />;
//   }
//   if (!singleAuction) {
//     return <h1 className="text-white">Auction not found.</h1>;
//   }

//   // Rest of your code

//   return (
//     <>
//       <div
//         className={`flex place-content-between  py-10 px-5 lg:py-20  lg:px-10  items-start gap-7 flex-wrap md:flex-nowrap ${noPadding ? "lg:py-0 px-0" : "p-4"}`}
//         id="item01"
//       >
//         <img
//           className=" rounded-xl  md:max-w-[45%]  w-full "
//           src={singleAuction?.image}
//           alt="product image"
//         />
//         <div className="w-full flex gap-4 flex-col ">
//           <div>
//             <h2 className="text-3xl font-extrabold text-white">
//               {singleAuction?.name}
//             </h2>

//             <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
//               <a
//                 href="#"
//                 className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
//               >
//                 {singleAuction?.category?.name}
//               </a>
//               <a
//                 href="#"
//                 className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
//               >
//                 {singleAuction?.location?.name}
//               </a>
//             </div>

//             {/* border */}
//           </div>

//           <div className="pt-4 border-t border-border-info-color">
//             {/* Creator */}
//             <div className="flex gap-8">
//               <div id="author-item" className="text-heading-color">
//                 <span className="font-medium capitalize  ">Seller</span>
//                 <div id="author-info" className="flex items-center gap-2 pt-2">
//                   <img
//                     src={singleAuction?.seller?.profilePicture}
//                     alt="avatar"
//                     className="w-[45px] rounded-full"
//                   />
//                   <a href="#" className="font-medium ">
//                     {singleAuction?.seller?.fullName}
//                   </a>
//                 </div>
//               </div>
//             </div>
//             {/* TABS buttons */}
//             <div className="flex gap-4 pt-4 font-bold text-white ">
//               <button
//                 className={`px-5 py-2 rounded-xl   ${
//                   activeTab === "description"
//                     ? "bg-color-primary"
//                     : "bg-theme-bg2 text-body-text-color"
//                 }`}
//                 onClick={() => setActiveTab("description")}
//               >
//                 Details
//               </button>
//               <button
//                 className={`px-5 py-2 rounded-xl   ${
//                   activeTab === "bids"
//                     ? "bg-color-primary"
//                     : "bg-theme-bg2 text-body-text-color"
//                 }`}
//                 onClick={() => setActiveTab("bids")}
//               >
//                 Bids
//               </button>
//             </div>
//           </div>
//           <div>
//             {/* Description */}
//             <div
//               id="description"
//               className={`pt-4 border-t border-border-info-color ${
//                 activeTab === "description" ? "block" : "hidden"
//               }`}
//             >
//               <h3 className="text-heading-color font-medium">Description</h3>
//               <p className="text-body-text-color">
//                 {singleAuction?.description}
//               </p>
//             </div>
            
//             {/* Bids */}
//             <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//               <div className="flex justify-between items-center">
//                 <div className="flex flex-col gap-2">
//                   <h3 className="text-heading-color font-medium">Starting Price</h3>
//                   <p className="text-body-text-color">${singleAuctionData?.startingPrice}</p>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <h3 className="text-heading-color font-medium">Current Highest Bid</h3>
//                   <p className="text-body-text-color">${singleAuctionData?.currentHighestBid || 'N/A'}</p>
//                 </div>
//               </div>
//             </div>

//             {/* <div
//               id="bids"
//               className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto  ${
//                 activeTab === "bids" ? "block" : "hidden"
//               } no-scrollbar`}
//             >
//               {/* map over bids array 
//               {(singleAuction && singleAuction.bids && singleAuction.bids.length > 0) || (bidsData && bidsData.length > 0 ) ? (
//                 bidsData?.map((bid) => <BidCard key={bid._id} bid={bid} />)
//               ) : (
//                 <h1 className="text-white">No bids yet</h1>
//               )}
//             </div> */}
//           </div>

//           <div className="text-heading-color capitalize"></div>

//           {/* countdown timer */}
//           <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
//               <div className="flex justify-between items-center">
//               <div className="flex flex-col gap-2">
//                     <h3 className="text-heading-color font-medium">Auction Status</h3>
//                     <p className="text-body-text-color">
//                         {auctionStatus === "Over" 
//                             ? "Auction is Over" 
//                             : auctionStatus === "Live" 
//                             ? "Auction is Live" 
//                             : "Auction is Upcoming"}
//                     </p>
//                 </div>

//                   <div className="flex flex-col gap-2">
//                       <h3 className="text-heading-color font-medium">Time</h3>
//                       <div className="text-body-text-color">
//                           <CountDownTimer
//                               startTime={singleAuction?.startTime}
//                               endTime={singleAuction?.endTime}
//                               id={singleAuction?._id}
//                               Winner={handleWinner}
//                           />
//                       </div>
//                   </div>
//               </div>
//           </div>

//           {/* // detail about current bid and timer  */}
//          <div className=" flex flex-col gap-4 pt-4 border-t border-border-info-color ">
//             {singleAuction?.status === "over" || auctionWinnerDetailData ? (
//               bidsData.length > 0 ? (
//                 <>
//                   <div>
//                     <h1 className="font-bold text-white">Winner</h1>
//                     <div className="flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full">
//                       <div className="flex gap-4 items-center text-white">
//                         <img
//                           src={
//                             auctionWinnerDetailData?.bidder?.profilePicture ||
//                             singleAuction?.winner?.bidder?.profilePicture
//                           }
//                           alt="bidder profilePicture"
//                           className="w-10 h-10 rounded-full"
//                         />
//                         <div className="flex flex-col">
//                           <span className="font-semibold">
//                             {auctionWinnerDetailData?.bidder?.fullName ||
//                               singleAuction?.winner?.bidder?.fullName}
//                           </span>
//                           <span className="text-xs text-body-text-color">
//                             {new Date(
//                               auctionWinnerDetailData?.bidTime ||
//                                 singleAuction?.winner?.bidTime
//                             ).toLocaleDateString()}{" "}
//                             {""}
//                             {`${new Date(
//                               auctionWinnerDetailData?.bidTime ||
//                                 singleAuction?.winner?.bidTime
//                             ).toLocaleTimeString()}`}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-white">
//                         Bid Amount : $
//                         {auctionWinnerDetailData?.bidAmount ||
//                           singleAuction?.winner?.bidAmount}
//                       </div>
//                     </div>{" "}
//                   </div>
//                 </>
//               ) : (
//                 <h1 className="text-white">No bids</h1>
//               )
//             ) : (
//               auctionStarted && (
//                 <form
//                   className="flex justify-between flex-wrap gap-4 items-center"
//                   onSubmit={placeBidHandle}
//                 >
//                   {/* input button for bid */}
//                   <input
//                     type="number"
//                     className="outline-none text-slate-300 px-3 py-4 rounded-xl bg-theme-bg2 border border-border-info-color focus:border-theme-color transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                     placeholder="Enter your bid"
//                     value={newBidAmount}
//                     onChange={(e) => setNewBidAmount(e.target.value)}
//                     required
//                   />
//                       {logInUser ? (
//                           // user?.paymentVerified ? (
//                             <button
//                               type="submit"
//                               disabled={
//                                 singleAuction?.seller?._id === logInUser?._id
//                                   ? true
//                                   : false || !auctionStarted
//                               }
//                               className={`bg-color-primary py-2 px-4 rounded-lg  text-white ${
//                                 singleAuction?.seller?._id === logInUser?._id
//                                   ? "bg-theme-bg2 text-body-text-color cursor-not-allowed border border-border-info-color hover:border-color-danger"
//                                   : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger"
//                               } ${
//                                 !auctionStarted
//                                   ? "bg-theme-bg2 text-body-text-color "
//                                   : "bg-color-primary "
//                               } `}
//                             >
//                               Place Bid
//                             </button>
//                           // )
//                           // : (
//                           //   <Link
//                           //     to="/user-profile/payment-method"
//                           //     className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
//                           //   >
//                           //     Attach Payment Method to Bid
//                           //   </Link>
//                           // )
//                         ) :
//                         (
//                           <Link
//                             to="/login"
//                             className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
//                           >
//                             Place Bid
//                           </Link>
//                         )
//                       }
//                 </form>
//               )
//             )}
//           </div>
          
        
//         </div>
//       </div>
//       {/* <div className="mx-8">
//         <LiveHome></LiveHome>
//       </div> */}
//     </>
//   );
// };

// export default SingleAuctionDetail;




