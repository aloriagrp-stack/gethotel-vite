const logger = require('./logger');

const BOOKING_STATES = {
    SEARCH_DESTINATION: 'SEARCH_DESTINATION',
    SEARCH_HOTELS: 'SEARCH_HOTELS',
    HOTEL_SELECTED: 'HOTEL_SELECTED',
    SHOW_ROOMS: 'SHOW_ROOMS',
    ROOM_SELECTED: 'ROOM_SELECTED',
    COLLECT_GUEST_NAME: 'COLLECT_GUEST_NAME',
    COLLECT_PHONE: 'COLLECT_PHONE',
    COLLECT_EMAIL: 'COLLECT_EMAIL',
    PAYMENT_SELECTION: 'PAYMENT_SELECTION',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
    BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
    POST_BOOKING_SUPPORT: 'POST_BOOKING_SUPPORT'
};

const NEXT_REQUIRED_SLOT = {
    SEARCH_DESTINATION: 'destination',
    SEARCH_HOTELS: 'hotel',
    HOTEL_SELECTED: 'room',
    SHOW_ROOMS: 'room',
    ROOM_SELECTED: 'guestName',
    COLLECT_GUEST_NAME: 'guestName',
    COLLECT_PHONE: 'guestPhone',
    COLLECT_EMAIL: 'guestEmail',
    PAYMENT_SELECTION: 'paymentMethod',
    PAYMENT_PENDING: 'paymentConfirmation',
    PAYMENT_SUCCESS: null,
    BOOKING_CONFIRMED: null,
    POST_BOOKING_SUPPORT: null
};

const ALLOWED_TRANSITIONS = {
    SEARCH_DESTINATION: ['SEARCH_DESTINATION', 'SEARCH_HOTELS'],
    SEARCH_HOTELS: ['SEARCH_HOTELS', 'HOTEL_SELECTED', 'SHOW_ROOMS', 'SEARCH_DESTINATION'],
    HOTEL_SELECTED: ['HOTEL_SELECTED', 'SHOW_ROOMS', 'ROOM_SELECTED', 'SEARCH_HOTELS', 'SEARCH_DESTINATION'],
    SHOW_ROOMS: ['SHOW_ROOMS', 'ROOM_SELECTED', 'HOTEL_SELECTED', 'SEARCH_HOTELS'],
    ROOM_SELECTED: ['ROOM_SELECTED', 'COLLECT_GUEST_NAME', 'SHOW_ROOMS'],
    COLLECT_GUEST_NAME: ['COLLECT_GUEST_NAME', 'COLLECT_PHONE', 'ROOM_SELECTED'],
    COLLECT_PHONE: ['COLLECT_PHONE', 'COLLECT_EMAIL', 'COLLECT_GUEST_NAME'],
    COLLECT_EMAIL: ['COLLECT_EMAIL', 'PAYMENT_SELECTION', 'COLLECT_PHONE'],
    PAYMENT_SELECTION: ['PAYMENT_SELECTION', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'BOOKING_CONFIRMED'],
    PAYMENT_PENDING: ['PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'BOOKING_CONFIRMED'],
    PAYMENT_SUCCESS: ['PAYMENT_SUCCESS', 'BOOKING_CONFIRMED', 'POST_BOOKING_SUPPORT'],
    BOOKING_CONFIRMED: ['BOOKING_CONFIRMED', 'POST_BOOKING_SUPPORT'],
    POST_BOOKING_SUPPORT: ['POST_BOOKING_SUPPORT', 'SEARCH_HOTELS', 'SEARCH_DESTINATION']
};

function validateStateTransition(currentState, targetState) {
    if (!currentState || !targetState) return true;
    const allowed = ALLOWED_TRANSITIONS[currentState];
    if (!allowed) return true;
    return allowed.includes(targetState);
}

function inferBookingState(memory = {}, intent, previousState = null) {
    let inferred = BOOKING_STATES.SEARCH_DESTINATION;

    if (memory.paymentSuccess) inferred = BOOKING_STATES.PAYMENT_SUCCESS;
    else if (memory.bookingConfirmed) inferred = BOOKING_STATES.BOOKING_CONFIRMED;
    else if (memory.paymentPending) inferred = BOOKING_STATES.PAYMENT_PENDING;
    else if (intent === 'HOTEL_SEARCH') inferred = BOOKING_STATES.SEARCH_HOTELS;
    else if (memory.selectedRoomId && intent !== 'HOTEL_SEARCH' && intent !== 'ROOM_SEARCH') {
        if (!memory.guestName) inferred = BOOKING_STATES.COLLECT_GUEST_NAME;
        else if (!memory.guestPhone) inferred = BOOKING_STATES.COLLECT_PHONE;
        else if (!memory.guestEmail) inferred = BOOKING_STATES.COLLECT_EMAIL;
        else if (!memory.paymentMethod) inferred = BOOKING_STATES.PAYMENT_SELECTION;
        else inferred = BOOKING_STATES.PAYMENT_PENDING;
    } else if (memory.selectedHotelId && intent === 'ROOM_SEARCH') {
        inferred = BOOKING_STATES.SHOW_ROOMS;
    } else if (memory.selectedHotelId && intent !== 'HOTEL_SEARCH') {
        inferred = BOOKING_STATES.HOTEL_SELECTED;
    } else if (memory.destination) {
        inferred = BOOKING_STATES.SEARCH_HOTELS;
    }

    // Force allow transitions if explicit selections or state overrides are present in memory
    const isExplicitSelection = Boolean(memory.selectedHotelId || memory.selectedRoomId);
    if (isExplicitSelection) {
        return inferred;
    }

    if (previousState && !validateStateTransition(previousState, inferred)) {
        logger.warn('StateMachine', 'Blocked invalid transition', { from: previousState, to: inferred });
        return previousState;
    }

    return inferred;
}

function getNextRequiredSlot(state) {
    return Object.prototype.hasOwnProperty.call(NEXT_REQUIRED_SLOT, state)
        ? NEXT_REQUIRED_SLOT[state]
        : null;
}

function buildStateSnapshot({ memory, intent, previousState = null }) {
    const state = inferBookingState(memory, intent, previousState);
    return {
        state,
        nextRequiredSlot: getNextRequiredSlot(state),
        completedSlots: {
            destination: Boolean(memory.destination),
            hotel: Boolean(memory.selectedHotelId),
            room: Boolean(memory.selectedRoomId),
            guestName: Boolean(memory.guestName),
            guestPhone: Boolean(memory.guestPhone),
            guestEmail: Boolean(memory.guestEmail),
            paymentMethod: Boolean(memory.paymentMethod),
            paymentConfirmation: Boolean(memory.paymentSuccess || memory.bookingConfirmed)
        }
    };
}

module.exports = {
    BOOKING_STATES,
    ALLOWED_TRANSITIONS,
    validateStateTransition,
    inferBookingState,
    getNextRequiredSlot,
    buildStateSnapshot
};
