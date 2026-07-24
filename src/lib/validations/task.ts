import { z } from "zod";

export const taskCategoryEnum = z.enum(["POST", "COMMENT", "REPLY"]);

export const createTaskSchema = z.object({
  category: taskCategoryEnum,
  targetUrl: z
    .string()
    .url("Enter a valid URL")
    .refine((url) => url.includes("reddit.com"), "Target URL must be a Reddit link"),
  instructions: z.string().min(10, "Add at least a sentence of instructions").max(4000),
  publishAt: z.string().optional().refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid publish date"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

const linkField = (label: string) =>
  z
    .string()
    .url(`${label} must be a valid URL`)
    .refine((url) => url.includes("reddit.com"), `${label} must be a Reddit link`);

export const submitTaskSchema = z
  .object({
    taskId: z.string().cuid(),
    mainLink: linkField("Main link"),
    randomLink1: linkField("Random link 1"),
    randomLink2: linkField("Random link 2"),
    randomLink3: linkField("Random link 3"),
  })
  .refine(
    (data) => {
      const links = [data.mainLink, data.randomLink1, data.randomLink2, data.randomLink3];
      return new Set(links).size === links.length;
    },
    { message: "Submitted links must all be different", path: ["mainLink"] }
  );

export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;

export const reviewSubmissionSchema = z.object({
  submissionId: z.string().cuid(),
  decision: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
  adminNote: z.string().max(1000).optional(),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;

export const updateSettingsSchema = z.object({
  postReward: z.coerce.number().positive(),
  commentReward: z.coerce.number().positive(),
  replyReward: z.coerce.number().positive(),
  claimCooldownMin: z.coerce.number().int().min(0),
  claimTimeoutMin: z.coerce.number().int().min(5),
  maxActiveTasks: z.coerce.number().int().min(1),
  referralReward: z.coerce.number().min(0),
  referredWorkerBonus: z.coerce.number().min(0),
  discordSupportUrl: z.union([z.string().url("Enter a valid Discord URL"), z.literal("")]).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
