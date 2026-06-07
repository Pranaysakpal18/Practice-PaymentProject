import { create } from 'zustand';

const initialStoreState = {
  sessionData: null,
  currentStep: 'CONTACT', // CONTACT -> OTP -> BILLING -> SHIPPING -> PAYMENT_SELECTION -> method specific UIs -> PROCESSING -> RESULT
  selectedPaymentMethod: null, // UPI, CARD, NETBANKING
  paymentStatus: null, // SUCCESS, FAILURE, PENDING
  paymentError: null,
  transactionDetails: null, // transactionId, amount, date, method
  modal: {
    type: null, // ADDITIONAL_INFO, etc.
    props: {}
  },
  timer: 600, // 10 minutes default in seconds
  language: 'en'
};

export const useCheckoutStore = create((set, get) => ({
  ...initialStoreState,

  // Set checkout session data
  setSessionData: (data) => set((state) => {
    // If the mock session provides custom timer limit, use it
    const newTimer = data?.settings?.timerSeconds || state.timer;
    return { 
      sessionData: data,
      timer: newTimer
    };
  }),

  // Transition to another step in the checkout wizard
  setCurrentStep: (step) => set({ currentStep: step }),

  // Set the selected payment instrument
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  // Direct checkout updates
  updateCheckoutState: (updates) => set((state) => ({ ...state, ...updates })),

  // Modal actions
  openModal: (type, props = {}) => set({ modal: { type, props } }),
  closeModal: () => set({ modal: { type: null, props: {} } }),

  // Timer Tick
  tickTimer: () => set((state) => {
    if (state.timer <= 0) return { timer: 0 };
    return { timer: state.timer - 1 };
  }),
  
  // Set Timer value explicitly
  setTimer: (seconds) => set({ timer: seconds }),

  // Set selected language
  setLanguage: (lang) => set({ language: lang }),

  // Finalize payment state
  setPaymentStatus: (status, details = null, error = null) => set({
    paymentStatus: status,
    transactionDetails: details,
    paymentError: error,
    currentStep: 'RESULT'
  }),

  // Reset the wizard back to default values
  resetStore: () => set(initialStoreState)
}));
