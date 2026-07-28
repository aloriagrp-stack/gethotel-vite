const { extractSessionState } = require('./stateManager');
const { BOOKING_STATES, buildStateSnapshot } = require('./bookingStateMachine');

/**
 * Phase 2 workflow manager.
 * This is intentionally derived from message history for now. Phase 4 will persist it.
 */
function buildWorkflowContext({ messages, intent }) {
    const state = extractSessionState(messages);
    return buildWorkflowFromMemory({ memory: state, intent });
}

function buildWorkflowFromMemory({ memory, intent }) {
    const state = memory || {};
    const booking = buildStateSnapshot({ memory: state, intent });

    return {
        workflowState: booking.state,
        nextRequiredSlot: booking.nextRequiredSlot,
        completedSlots: booking.completedSlots,
        memory: state
    };
}

module.exports = {
    WORKFLOW_STATES: BOOKING_STATES,
    buildWorkflowContext,
    buildWorkflowFromMemory
};
