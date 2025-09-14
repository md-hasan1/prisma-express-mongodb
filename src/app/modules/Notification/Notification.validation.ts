import { z } from 'zod';

const createSchema = z.object({

    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),

});

const updateSchema = z.object({

    name: z.string().optional(),
    description: z.string().optional(),

});

export const NotificationValidation = {
createSchema,
updateSchema,
};