import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Set the player's display name (first time only).
 * Called when a signed-in user first plays.
 */
export const savePlayerName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Only set name if not already set
    if (!user.name || user.name === "Player") {
      await ctx.db.patch(userId, { name: args.name });
    }

    return { success: true };
  },
});

/**
 * Update the player's display name (from the dashboard profile editor).
 * Can be called any time to change the name.
 */
export const updatePlayerName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, { name: args.name });

    return { success: true };
  },
});

/**
 * Get the current user's profile name.
 * Returns null if not signed in.
 */
export const getPlayerName = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return user.name ?? null;
  },
});
