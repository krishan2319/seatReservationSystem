const SeatModel = require("../models/seats.model");

const generateSeats = async (req, res) => {
  try {
    const existingSeats = await SeatModel.countDocuments();
    if (existingSeats === 0) {
      const seats = [];
      for (let i = 1; i <= 80; i++) {
        const isBooked = i <= 7;
        seats.push({ seatNo: i, isBooked });
      }
      await SeatModel.insertMany(seats);
      res.status(201).send({ message: "Seats created successfully", seats });
    } else {
      res.status(200).send({ message: "Seats already exist" });
    }
  } catch (error) {
    console.error({ message: 'Error creating seats:', error: error.message });
  }
};

const getAllSeats = async (req, res) => {
  try {
    const seats = await SeatModel.find();
    res.status(200).send({ seats });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', error: error.message });
  }
}


const bookingSeats = async (req, res) => {
  try {
    const { numSeats } = req.body;

    // Check if number of seats is provided
    if (!numSeats) {
      return res.status(400).send({ message: 'Number of seats required' });
    }

    // Retrieve all seats from the database and sort them by seat number
    const allSeats = await SeatModel.find({}).sort({ seatNo: 1 });
    const totalSeats = allSeats.length;
    const seatsPerRow = 7;
    const totalRows = Math.ceil(totalSeats / seatsPerRow);

    let bookedSeats = [];
    for (let row = 1; row <= totalRows; row++) {
      const rowSeats = allSeats.slice((row - 1) * seatsPerRow, row * seatsPerRow);
      const availableSeats = rowSeats.filter(seat => !seat.isBooked);
      if (availableSeats.length >= numSeats) {
        bookedSeats = availableSeats.slice(0, numSeats).map(seat => seat.seatNo);
        break;
      }
    }
    if (bookedSeats.length === 0) {
      const unbookedSeats = allSeats.filter(seat => !seat.isBooked);
      const unbookedSeatNos = unbookedSeats.map(seat => seat.seatNo);

      let startIndex = 0;
      let endIndex = numSeats - 1;

      let minDiff = Infinity;
      let closestSeats = [];
      while (endIndex < unbookedSeatNos.length) {
        const diff = Math.abs(unbookedSeatNos[startIndex] - unbookedSeatNos[endIndex]);

        if (diff < minDiff) {
          minDiff = diff;
          closestSeats = unbookedSeatNos.slice(startIndex, endIndex + 1);
        }

        startIndex++;
        endIndex++;
      }
      if (closestSeats.length === numSeats) {
        bookedSeats = closestSeats;
      }
      else {
        const remainingSeats = numSeats - closestSeats.length;
        const remainingUnbookedSeats = unbookedSeatNos.slice(endIndex);
        bookedSeats = closestSeats.concat(remainingUnbookedSeats.slice(0, remainingSeats));
      }
    }
    if (bookedSeats.length > 0) {
      for (const seat of allSeats) {
        if (bookedSeats.includes(seat.seatNo)) {
          seat.isBooked = true;
          await seat.save();
        }
      }

      return res.status(200).send({ message: 'Seats booked successfully', bookedSeats });
    } else {
      return res.status(400).send({ message: 'Seats not available' });
    }
  } catch (error) {
    return res.status(500).send({ message: 'Error occurred while booking seats', error: error.message });
  }
};



// Controller for unbooking seats
const unbookSeats = async (req, res) => {
  const { seatNumbers } = req.body;
  if (!seatNumbers) {
    return res.status(404).send({ message: 'Unbook seatNumbers number required' });
  }



  try {
    const seats = await SeatModel.find({ seatNo: { $in: seatNumbers } });

    // Check if all the requested seats exist and are booked
    const validSeats = seats.filter((seat) => seat.isBooked);
    if (validSeats.length !== seatNumbers.length) {
      res.status(400).send({ message: 'Invalid seat numbers or already unbooked' });
      return;
    }

    // Unbook the seats by setting isBooked to false
    await SeatModel.updateMany({ seatNo: { $in: seatNumbers } }, { $set: { isBooked: false } });

    res.status(200).send({ message: 'Seats successfully unbooked' });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong', error: error.message });
  }
};


// reset all booked

const resetAllBooked = async (req, res) => {
  try {
    await SeatModel.updateMany({ isBooked: true }, { isBooked: false });
    res.status(200).send({ message: "All the seats are available for booking." });
  } catch (error) {

    res.status(400).send({ message: "Something went wrong", error: error.message });
  }
}



module.exports = {
  generateSeats,
  getAllSeats,
  bookingSeats,
  unbookSeats,
  resetAllBooked
}