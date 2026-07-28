const { INTENTS } = require('./intentDetector');

const TOOL_NAMES = {
    HOTEL_SEARCH: 'HOTEL_SEARCH',
    ROOM_SEARCH: 'ROOM_SEARCH',
    HOURLY_STAY_SEARCH: 'HOURLY_STAY_SEARCH',
    FLIGHT_SEARCH: 'FLIGHT_SEARCH',
    INDIA_TOUR_PLANNER: 'INDIA_TOUR_PLANNER',
    NONE: 'NONE'
};

/**
 * Decides which deterministic backend tool should run before the LLM writes prose.
 */
function decideNextAction({ intent, workflow }) {
    // If we are in the booking details collection states, do not run any search tools
    const isCollectingDetails = [
        'COLLECT_GUEST_NAME',
        'COLLECT_PHONE',
        'COLLECT_EMAIL',
        'PAYMENT_SELECTION',
        'PAYMENT_PENDING'
    ].includes(workflow?.workflowState);

    if (isCollectingDetails) {
        return {
            toolName: TOOL_NAMES.NONE,
            reason: 'User is in the booking flow, collecting guest details.'
        };
    }

    if (intent === INTENTS.HOURLY_STAY_SEARCH) {
        return {
            toolName: TOOL_NAMES.HOURLY_STAY_SEARCH,
            reason: 'User requested micro-stay / hourly room inventory.'
        };
    }

    if (intent === INTENTS.FLIGHT_SEARCH) {
        return {
            toolName: TOOL_NAMES.FLIGHT_SEARCH,
            reason: 'User requested worldwide flight search.'
        };
    }

    if (intent === INTENTS.INDIA_TOUR_PLANNER) {
        return {
            toolName: TOOL_NAMES.INDIA_TOUR_PLANNER,
            reason: 'User requested custom India tour itinerary and package.'
        };
    }

    if (intent === INTENTS.ROOM_SEARCH || workflow?.workflowState === 'SHOW_ROOMS') {
        return {
            toolName: TOOL_NAMES.ROOM_SEARCH,
            reason: 'User requested room categories for hotel inventory.'
        };
    }

    if (
        intent === INTENTS.HOTEL_SEARCH ||
        (intent === INTENTS.BOOKING_INQUIRY && !workflow?.memory?.selectedHotelId)
    ) {
        return {
            toolName: TOOL_NAMES.HOTEL_SEARCH,
            reason: 'User needs grounded hotel inventory context.'
        };
    }

    return {
        toolName: TOOL_NAMES.NONE,
        reason: 'General conversation can be answered without a business tool.'
    };
}

module.exports = {
    TOOL_NAMES,
    decideNextAction
};
