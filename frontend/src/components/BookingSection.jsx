import React, { useEffect, useReducer, useCallback } from "react";
import {
  GET_LATEST_SEATS,
  UPDATE_LATEST_SEATS,
  initialState,
  latestSeatsReducer,
} from "../reducers/latestSeatsReducer";

// const baseAPI = "http://localhost:8080/api/latest";
const baseAPI = "https://stormy-sunglasses-fly.cyclic.app/api/latest";

const BookingSection = ({
  numOfSeats,
  setNumOfSeats,
  reserveSeats,
  isLoading,
  bookedSeats,
  resetAllSeats,
  isResetAll
}) => {
  const [state, dispatch] = useReducer(latestSeatsReducer, initialState);
  // console.log(" state.latestSeats", state && state.latestSeats);

  const getLatestSeats = useCallback(async () => {
    try {
      const response = await fetch(`${baseAPI}`);
      const data = await response.json();
      dispatch({ type: GET_LATEST_SEATS, payload: data.latestSeats });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const updateLatestSeats = useCallback(async (seats) => {
    // console.log("isResetAll called in updateLatestSeats");
    try {
      const response = await fetch(`${baseAPI}/update/all`, {
        method: "PATCH",
        body: JSON.stringify({ requestedSeats: seats }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      dispatch({ type: UPDATE_LATEST_SEATS, payload: data.latestSeats });
    } catch (error) {
      console.error(error);
    }
  }, []);


  useEffect(() => {
    if (bookedSeats.length > 0 || isResetAll) {
      updateLatestSeats(bookedSeats);
    }
  }, [bookedSeats, updateLatestSeats,isResetAll]);

  useEffect(() => {
    getLatestSeats();
  }, [getLatestSeats]);

  const handleReserveSeats = () => {
    reserveSeats();
  };

  function resetAllSeatsFn() {
    resetAllSeats();
  }

  return (
    <div className="booking-section">
      <div className="color_indicator_message">
        <div className="_rounded_box_conatiner">
          {/* <!-- Red box for booked seats --> */}
          <div className="_rounded_box red-box"></div>
          {/* <!-- Green box for available seats --> */}
          <div className="_rounded_box green-box"></div>
        </div>
        <div className="_rounded_box_message">
          {/* <!-- Message indicating booked seats --> */}
          <p>Booked Seats</p>
          {/* <!-- Message indicating available seats --> */}
          <p>Available Seats</p>
        </div>
      </div>
      <div id="currentBookedSeats">
        <div className="booked_seats_text">
          <p>Current Seats booked:</p>
        </div>
        {isLoading ? (
          <p className="updating_seats">Updating ...</p>
        ) : (
          <div className="row_booked_seats">
            {state?.latestSeats?.length === 0 ? (
              <p>&nbsp;&nbsp; All seats are Avialable</p>
            ) : (
              state.latestSeats &&
              state.latestSeats.map((el) => (
                <div key={el} className="seat_booked">
                  {el}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="input_conatiner">
        <label htmlFor="numOfSeats">Number of Seats:</label>
        <input
          type="number"
          value={numOfSeats}
          onChange={(e) => setNumOfSeats(e.target.value)}
          id="numOfSeats"
          placeholder="Enter number 1-7 to book seats"
        />
        <label htmlFor="numOfSeats" className="example_un">
          Example: 2 (no. of seats need to book)
        </label>
        <button onClick={handleReserveSeats}>Reserve Seats</button>
        <button className="resetBtn" onClick={resetAllSeatsFn}>
        Reset All Seats
      </button>
      </div>

      
    </div>
  );
};

export default BookingSection;
