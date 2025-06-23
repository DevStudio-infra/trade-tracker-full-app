import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "./index";
import { protectedProcedure, adminProcedure } from "./auth";
import { UserRepository, RecipeRepository, MenuRepository, ScheduleRepository, ChatRepository, OrdersRepository } from "../repositories";
import { LLMService } from "../services/llm.service";
import { FileUploadService } from "../services/file-upload.service";

const llmService = new LLMService();
const fileUploadService = new FileUploadService();

/**
 * Root tRPC router
 * Combines all feature-specific sub-routers with multi-tenant support
 */
export const appRouter = router({
  // Basic health check procedure
  healthCheck: publicProcedure.query(async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // User procedures
  users: router({
    // Get current user
    me: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    // Admin-only operations
    getAll: adminProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await UserRepository.findAll(input.organizationId);
    }),

    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await UserRepository.findById(input.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          clerkId: z.string(),
          organizationId: z.string(),
          name: z.string(),
          email: z.string().email(),
          role: z.enum(["admin", "staff"]).default("staff"),
        })
      )
      .mutation(async ({ input }) => {
        return await UserRepository.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            role: z.enum(["admin", "staff"]).optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        // Check permissions
        if (ctx.user.id !== input.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own profile",
          });
        }

        if (input.data.role && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can change roles",
          });
        }

        return await UserRepository.update(input.id, input.data);
      }),
  }),

  // Recipe procedures
  recipes: router({
    getAll: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await RecipeRepository.findAll(input.organizationId);
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await RecipeRepository.findById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          instructions: z.string(),
          prepTime: z.number().optional(),
          cookTime: z.number().optional(),
          servings: z.number().optional(),
          difficulty: z.string().optional(),
          imageUrl: z.string().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await RecipeRepository.create({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            instructions: z.string().optional(),
            prepTime: z.number().optional(),
            cookTime: z.number().optional(),
            servings: z.number().optional(),
            difficulty: z.string().optional(),
            imageUrl: z.string().optional(),
            isPublic: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const recipe = await RecipeRepository.findById(input.id);
        if (!recipe) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recipe not found",
          });
        }

        if (recipe.createdBy !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update recipes you created",
          });
        }

        return await RecipeRepository.update(input.id, input.data);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const recipe = await RecipeRepository.findById(input.id);
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      if (recipe.createdBy !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete recipes you created",
        });
      }

      return await RecipeRepository.delete(input.id);
    }),

    addComment: protectedProcedure
      .input(
        z.object({
          recipeId: z.number(),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await RecipeRepository.addComment(input.recipeId, ctx.user.id, input.comment);
      }),
  }),

  // Menu procedures
  menus: router({
    getAll: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          includeInactive: z.boolean().default(false),
        })
      )
      .query(async ({ input }) => {
        return await MenuRepository.findAll(input.organizationId, input.includeInactive);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await MenuRepository.findById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          menuType: z.string().optional(),
          season: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await MenuRepository.create({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            menuType: z.string().optional(),
            season: z.string().optional(),
            isActive: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update menus",
          });
        }

        return await MenuRepository.update(input.id, input.data);
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return await MenuRepository.delete(input.id);
    }),
  }),

  // Schedule procedures
  schedules: router({
    getAll: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await ScheduleRepository.findAll(input.organizationId);
    }),

    create: adminProcedure
      .input(
        z.object({
          organizationId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          startDate: z.string(),
          endDate: z.string(),
          isPublished: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await ScheduleRepository.create({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
  }),

  // Oracle/Chat procedures
  oracle: router({
    getConversations: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await ChatRepository.findAllConversations(input.organizationId);
    }),

    getConversation: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await ChatRepository.findConversationById(input.id);
    }),

    createConversation: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          title: z.string(),
          type: z.enum(["oracle", "menu_suggestions", "general"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await ChatRepository.createConversation({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    askQuestion: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          question: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        // Add user message
        await ChatRepository.addMessage({
          conversationId: input.conversationId,
          userId: ctx.user.id,
          role: "user",
          content: input.question,
        });

        // Get context for the organization
        const contextSources = await ChatRepository.getContextSources(ctx.user.organizationId);
        const recipes = await RecipeRepository.findAll(ctx.user.organizationId);
        const menus = await MenuRepository.findAll(ctx.user.organizationId);

        const context = {
          menus,
          recipes,
          notes: contextSources,
          ingredients: [], // TODO: get ingredients
        };

        // Get conversation history
        const conversation = await ChatRepository.findConversationById(input.conversationId);
        const history = conversation.messages.slice(-10); // Last 10 messages

        // Ask Oracle
        const { answer, tokens } = await llmService.askOracle(input.question, context, history);

        // Add assistant response
        const assistantMessage = await ChatRepository.addMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: answer,
          tokens,
        });

        return assistantMessage;
      }),

    generateSuggestion: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          type: z.enum(["menu", "shopping_list", "prep_list"]),
          prompt: z.string(),
          recipes: z.array(z.number()).optional(),
          servings: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        // Get context
        const recipes = input.recipes ? await Promise.all(input.recipes.map((id) => RecipeRepository.findById(id))) : await RecipeRepository.findAll(input.organizationId);

        const menus = await MenuRepository.findAll(input.organizationId);
        const contextSources = await ChatRepository.getContextSources(input.organizationId);

        const context = {
          menus,
          recipes: recipes.filter(Boolean),
          notes: contextSources,
          ingredients: [],
        };

        const { suggestion, tokens } = await llmService.generateSuggestion({
          type: input.type,
          context,
          prompt: input.prompt,
          recipes: recipes.filter(Boolean),
          servings: input.servings,
        });

        // Save suggestion
        const savedSuggestion = await ChatRepository.saveSuggestion({
          organizationId: input.organizationId,
          type: input.type,
          title: `${input.type} suggestion`,
          content: suggestion,
          metadata: { tokens },
          createdBy: ctx.user.id,
        });

        return savedSuggestion;
      }),

    getSuggestions: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await ChatRepository.getSuggestions(input.organizationId);
    }),
  }),

  // Orders procedures
  orders: router({
    getAll: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await OrdersRepository.findAllOrders(input.organizationId);
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await OrdersRepository.findOrderById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          eventDate: z.string().optional(),
          totalGuests: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await OrdersRepository.createOrder({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    addItem: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          recipeId: z.number(),
          servings: z.number(),
          multiplier: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        return await OrdersRepository.addOrderItem(input);
      }),

    getShoppingLists: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await OrdersRepository.findAllShoppingLists(input.organizationId);
    }),

    getProductionLists: protectedProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input }) => {
      return await OrdersRepository.findAllProductionLists(input.organizationId);
    }),
  }),
});

export type AppRouter = typeof appRouter;
