import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "finance-manager", // Unique app ID
  name: "Finance Manager",
});
