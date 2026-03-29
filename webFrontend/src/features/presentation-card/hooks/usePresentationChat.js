import { useCallback, useReducer, useRef } from 'react';
import { postRagChat } from '../api/client';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const initialState = { messages: [], pending: false };

function chatReducer(state, action) {
  switch (action.type) {
    case 'USER_SEND':
      if (state.pending) return state;
      return {
        ...state,
        pending: true,
        messages: [...state.messages, action.payload],
      };
    case 'ASSISTANT_REPLY':
      return {
        ...state,
        pending: false,
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
}

/**
 * Recruiter chat UI state. Wire POST /portfolio-rag/chat inside sendMessage when the API is ready.
 *
 * Hook order is stable: useReducer → useRef (in-flight guard) → useCallback.
 * The in-flight ref prevents a second async run before the first finishes (avoids duplicate assistant replies).
 */
export function usePresentationChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const inFlightRef = useRef(false);

  const sendMessage = useCallback(async (rawText) => {
    const text = typeof rawText === 'string' ? rawText.trim() : '';
    if (!text || inFlightRef.current) return;

    inFlightRef.current = true;
    const userMsg = { id: uid(), role: 'user', text };
    dispatch({ type: 'USER_SEND', payload: userMsg });

    try {
      const { reply } = await postRagChat(text);
      dispatch({
        type: 'ASSISTANT_REPLY',
        payload: { id: uid(), role: 'assistant', text: reply },
      });
    } catch {
      dispatch({
        type: 'ASSISTANT_REPLY',
        payload: {
          id: uid(),
          role: 'assistant',
          text: 'Something went wrong. Try again in a moment.',
        },
      });
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  return {
    messages: state.messages,
    pending: state.pending,
    sendMessage,
  };
}
