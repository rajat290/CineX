# TODO: Fix Booking Creation Issue

## Steps to Complete
- [x] Modify `moviebooker-backend/controllers/bookingController.js` to generate `bookingId` explicitly in `createBooking` function before creating the Booking instance
- [ ] Test the booking creation by selecting seats and proceeding to pay
- [ ] Verify that the booking is created successfully without validation errors
- [ ] Ensure the frontend receives the booking with `bookingId` set
