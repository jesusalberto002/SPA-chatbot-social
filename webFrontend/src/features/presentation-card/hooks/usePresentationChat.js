import { useCallback, useReducer, useRef } from 'react';

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
      // await api.post('portfolio-rag/chat', { message: text });
      await new Promise((r) => setTimeout(r, 700));
      const reply =
        'This is a preview reply. Connect the portfolio RAG API to answer from your CV and project notes.';
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
