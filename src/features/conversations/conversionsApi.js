import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const pathResult1 = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            arg.sender,
            (draft) => {
              draft.push({
                ...arg.data,
                message: arg.data.message,
                timestamp: arg.data.timestamp,
              });
            }
          )
        );
        // optimistic cache update end

        try {
          const conversation = await queryFulfilled;

          if (conversation?.data?.id) {
            // silent entry to message table
            const users = arg.data.users;
            const senderUser = users.find((user) => user.email === arg.sender);
            const receiverUser = users.find(
              (user) => user.email !== arg.sender
            );

            dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation?.data?.id,
                sender: senderUser,
                receiver: receiverUser,
                message: arg.data.message,
                timestamp: arg.data.timestamp,
              })
            );
          }
        } catch (err) {
          pathResult1.undo();
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data, sender }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const pathResult = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            arg.sender,
            (draft) => {
              const drafConversation = draft.find((c) => c.id == arg.id);
              drafConversation.message = arg.data.message;
              drafConversation.timestamp = arg.data.timestamp;
            }
          )
        );
        // optimistic cache update end

        try {
          const conversation = await queryFulfilled;
          if (conversation?.data?.id) {
            // silent entry to message table
            const users = arg.data.users;
            const senderUser = users.find((user) => user.email === arg.sender);
            const receiverUser = users.find(
              (user) => user.email !== arg.sender
            );

            const res = await dispatch(
                messagesApi.endpoints.addMessage.initiate({
                    conversationId: conversation?.data?.id,
                    sender: senderUser,
                    receiver: receiverUser,
                    message: arg.data.message,
                    timestamp: arg.data.timestamp,
                })
            ).unwrap();
            // update messages cache pessmistically
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                res.conversationId.toString(),
                (draft) => {
                 draft.push(res)
                }
              )
            );
          }
        } catch (err) {
          pathResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationsApi;
