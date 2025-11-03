import { create } from 'zustand';
import { IMessage } from '@/model/message.model';

type ChatState = {
  messages: IMessage[];
  addMessage: (message: IMessage) => void;
  setInitialMessages: (messages: IMessage[]) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setInitialMessages: (messages) =>
    set({ messages: messages }),
}));