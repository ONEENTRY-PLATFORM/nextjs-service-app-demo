[Back to README](../README.md)

# How the appointment booking process works in the app?

Appointments is one of the main modules of OneEntry CMS.
In this beauty salon application it is implemented for booking services. More about the appointments: <https://doc.oneentry.cloud/docs/category/orders>
It is a complex process, let's take a look at it.

1. Appointment Initialization: Generates an appointment based on the user's selected services.
2. Service Details Setup: The user specifies appointment preferences and provides required details (e.g., date and time, master preference).
3. Confirmation: The user confirms the booking and chooses a payment method:
   Stripe for online transactions.
   Cash on delivery for in-person payment.

Additionally, each component's functionality described detailed via JSDoc inside of it.

## Step 1: Appointment Initialization

Once on the appointment preparation page, pay attention to two key components: ItemsInOrderList which displays a list of services and contains some logic and OrderForm which will be discussed in the next step.

- The ItemsInOrderList component utilizes custom logic to prepare the appointment data.
- This logic initializes the appointment data in **Redux**, formatting it for seamless further processing.

The appointment data is managed in the OrderSlice Redux slice which contains:

- Form data for collecting user information
- Service items to be booked
- Payment method selection

## Step 2: Service Details Setup

### Fetching the Appointment Form with OrderForm

- The OrderForm component retrieves the form structure for the appointment from the CMS.
- This includes all fields that can be filled out by the user and will later be saved with the appointment.
- Pay attention to the **date field**. It implements an attribute of the interval type from the CMS. It allows for flexible customization of defining appointment time slots.
- As the user fills out the form, the entered data is dynamically added to the appointment in **Redux** using the FormFieldsSlice.

### Proceeding to Confirmation with GoToPayButton

- Once all required fields are completed, the user can proceed to the next step using the **GoToPayButton** component.
- This button triggers navigation to the confirmation stage

## Step 3: Confirmation

### Payment Methods Selection

- On the CreateOrderScreen, the available payment methods are fetched from the CMS.
- The user can select their preferred payment method (e.g., **Stripe** or **Cash**).
- Once selected, the chosen payment method is added to **Redux** in the OrderSlice for further processing.

### Confirming Appointment Details

- Once all required appointment information has been collected, the user can finalize the booking process.
- When the user confirms the appointment, the logic of appointment creation in the CMS is triggered using the useCreateOrder hook.
- If **Stripe** is selected as the payment method:
  - A payment session is created using the `createSession` function.
  - This session handles the payment flow through Stripe's API.

### Payment Process with Stripe

- When a user selects **Stripe** as the payment method, they are redirected to the PaymentPayScreen. Here's how it works:
- It creates a Stripe checkout session
- Redirects the user to Stripe's payment page
- Handles the success/cancel callbacks

### Appointment Booking Process Complete

The appointment booking process is fully implemented, supporting both **Stripe** and **Cash** for a seamless user experience.
